import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { SEO_PAGES } from './src/seo.data'

// Files copied verbatim from public/ (sitemap.xml, robots.txt) never enter the
// rollup bundle, so generateBundle can't see them. Patch them on disk after the
// build writes the output dir, so __SITE_URL__ resolves to the real site URL.
function siteUrlPlugin(siteUrl: string): Plugin {
  const targets = ['robots.txt', 'sitemap.xml'];
  return {
    name: 'site-url-replace',
    writeBundle(options) {
      const outDir = options.dir ?? resolve(__dirname, 'dist');
      for (const name of targets) {
        const path = resolve(outDir, name);
        try {
          const patched = readFileSync(path, 'utf-8').replaceAll('__SITE_URL__', siteUrl);
          writeFileSync(path, patched);
        } catch { /* file not present in this build */ }
      }
    },
  }
}

// Build-time prerender. The app is a client-side SPA, so without this every
// route would serve index.html's static meta and crawlers that do not run JS
// (Google's non-JS pass, Facebook, LinkedIn, Slack, SEO auditors) would see
// identical title/description on every URL. This writes one HTML file per route
// with that route's meta baked in. SEO copy comes from SEO_PAGES (src/seo.data)
// so the runtime hook and these static files never drift.
function prerenderPlugin(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/$/, '');
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const setAttr = (html: string, selector: RegExp, value: string) =>
    html.replace(selector, (_m, p1: string, p2: string) => p1 + value + p2);

  return {
    name: 'route-prerender',
    writeBundle(options) {
      const outDir = options.dir ?? resolve(__dirname, 'dist');
      const template = readFileSync(resolve(outDir, 'index.html'), 'utf-8');

      for (const [path, meta] of Object.entries(SEO_PAGES)) {
        const title = esc(meta.title);
        const description = esc(meta.description);
        const url = path === '/' ? base + '/' : base + path;
        const robots = meta.noindex
          ? 'noindex, nofollow'
          : 'index, follow, max-snippet:-1, max-image-preview:large';

        let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
        html = setAttr(html, /(<meta name="description" content=")[^"]*(")/, description);
        html = setAttr(html, /(<meta property="og:title" content=")[^"]*(")/, title);
        html = setAttr(html, /(<meta property="og:description" content=")[^"]*(")/, description);
        html = setAttr(html, /(<meta property="og:url" content=")[^"]*(")/, url);
        html = setAttr(html, /(<meta name="twitter:title" content=")[^"]*(")/, title);
        html = setAttr(html, /(<meta name="twitter:description" content=")[^"]*(")/, description);
        html = setAttr(html, /(<link rel="canonical" href=")[^"]*(")/, url);
        html = setAttr(html, /(<meta name="robots" content=")[^"]*(")/, robots);

        // '/' overwrites the build's index.html; '/404' becomes 404.html for
        // static-host not-found fallback; every other route gets path/index.html.
        const outPath =
          path === '/'
            ? resolve(outDir, 'index.html')
            : path === '/404'
              ? resolve(outDir, '404.html')
              : resolve(outDir, '.' + path, 'index.html');
        mkdirSync(dirname(outPath), { recursive: true });
        writeFileSync(outPath, html);
      }
    },
  };
}

function loadKeysEnv(): Record<string, string> {
  const vars: Record<string, string> = {};
  try {
    const content = readFileSync(resolve(__dirname, '..', 'keys.env'), 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      vars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  } catch { /* keys.env not found */ }
  return vars;
}

export default defineConfig(() => {
  const env = loadKeysEnv();

  const siteUrl = env.VITE_SITE_URL;
  if (!siteUrl) {
    throw new Error('VITE_SITE_URL must be set in keys.env');
  }

  if (!env.FRONTEND_PORT) {
    throw new Error('FRONTEND_PORT must be set in keys.env');
  }
  const frontendPort = parseInt(env.FRONTEND_PORT, 10);
  if (!Number.isInteger(frontendPort) || frontendPort <= 0 || frontendPort > 65535) {
    throw new Error(`FRONTEND_PORT in keys.env is not a valid port: ${env.FRONTEND_PORT}`);
  }

  const define: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('VITE_')) {
      define[`import.meta.env.${key}`] = JSON.stringify(value);
    }
  }

  return {
    plugins: [react(), siteUrlPlugin(siteUrl), prerenderPlugin(siteUrl)],
    define,
    server: {
      port: frontendPort,
    },
    preview: {
      port: frontendPort,
      allowedHosts: [new URL(siteUrl).hostname],
    },
  }
})
