import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Per-route static rendering (full body HTML + meta) and sitemap/robots
// generation happen after the build in scripts/prerender.mjs, which renders the
// SSR bundle. vite.config only produces the two bundles it needs.

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

export default defineConfig(({ isPreview }) => {
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

  // `vite build` -> client bundle in dist/. The SSR bundle (consumed only by
  // scripts/prerender.mjs to render each route to static HTML, then deleted) is
  // produced by `vite build --ssr src/entry-server.tsx --outDir dist-server`.
  // The SSR bundle has no use for the public/ assets, so skip copying them there.
  const isSsrBuild = process.argv.includes('--ssr');

  // The build prerenders every route to its own dir/index.html. In `vite
  // preview` (how this is served in prod) we must NOT use SPA mode: spa serves
  // the root index.html for any path without an exact file match, so clean URLs
  // like /blog/post collapse to the homepage shell and every page self-reports
  // as a duplicate of the homepage, which blocks indexing. 'mpa' makes preview
  // resolve dir/index.html for clean URLs instead. Dev stays 'spa' so deep-link
  // refreshes still work locally (dev has no prerendered files to fall back to).
  const appType: 'spa' | 'mpa' = isPreview ? 'mpa' : 'spa';

  return {
    appType,
    plugins: [react()],
    define,
    build: {
      copyPublicDir: !isSsrBuild,
    },
    server: {
      port: frontendPort,
    },
    preview: {
      port: frontendPort,
      allowedHosts: [new URL(siteUrl).hostname],
    },
  }
})
