// Post-build static rendering.
//
// Runs after both `vite build` (client -> dist/) and `vite build --ssr`
// (server -> dist-server/). For every route it renders the React tree to HTML,
// bakes that HTML and the route's meta into the page, and writes the file. This
// is what makes the site crawlable: the served HTML now contains real content
// instead of an empty <div id="root">. It also generates sitemap.xml and
// resolves robots.txt, so those stay in sync with the actual route set.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const DIST_SERVER = resolve(ROOT, 'dist-server');

// Interactive app routes are left as empty shells so the client renders them
// fresh (no hydration mismatch from localStorage-derived initial state).
// /create is prerendered: its state initializes to SSR-safe defaults (EMPTY
// fields, default template, localStorage read deferred to useEffect), and it
// carries a static informational content block that crawlers need to see.
const SKIP_BODY = new Set(['/my-signatures']);

function loadKeysEnv() {
  const vars = {};
  try {
    const content = readFileSync(resolve(ROOT, '..', 'keys.env'), 'utf-8');
    for (const line of content.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      vars[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
  } catch { /* not present */ }
  // process.env wins so platform-injected config overrides the file.
  for (const k of Object.keys(process.env)) {
    if (k.startsWith('VITE_') && process.env[k]) vars[k] = process.env[k];
  }
  return vars;
}

const env = loadKeysEnv();
const SITE_URL = (env.VITE_SITE_URL || '').replace(/\/$/, '');
if (!SITE_URL) {
  console.error('prerender: VITE_SITE_URL is not set; aborting.');
  process.exit(1);
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const setAttr = (html, selector, value) =>
  html.replace(selector, (_m, p1, p2) => p1 + value + p2);

// WebApplication, FAQPage and HowTo schemas describe the homepage specifically.
// They live in the shared template, so strip them from every other route to
// avoid structured data that does not match the page's visible content.
function stripHomeOnlySchema(html) {
  return html.replace(
    /\s*<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    (m, body) => (/"@type":\s*"(WebApplication|FAQPage|HowTo)"/.test(body) ? '' : m)
  );
}

// Resolve the built SSR entry (filename can vary), then load render/getRoutes.
function findServerEntry() {
  const direct = resolve(DIST_SERVER, 'entry-server.js');
  if (existsSync(direct)) return direct;
  const candidates = readdirSync(DIST_SERVER).filter(f => f.startsWith('entry-server') && f.endsWith('.js'));
  if (candidates.length) return resolve(DIST_SERVER, candidates[0]);
  throw new Error('prerender: could not find SSR entry in dist-server/');
}

const { render, getRoutes } = await import(pathToFileURL(findServerEntry()).href);

// Resolve any leftover %VITE_X% placeholders in the template using env.
let template = readFileSync(resolve(DIST, 'index.html'), 'utf-8');
template = template.replace(/%VITE_[A-Z0-9_]+%/g, (m) => {
  const key = m.slice(1, -1);
  return env[key] != null ? env[key] : '';
});

const routes = getRoutes();
let written = 0;

for (const route of routes) {
  const { path, title, description, noindex } = route;
  const url = path === '/' ? SITE_URL + '/' : SITE_URL + path;
  const robots = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-snippet:-1, max-image-preview:large';

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = setAttr(html, /(<meta name="description" content=")[^"]*(")/, esc(description));
  html = setAttr(html, /(<meta property="og:title" content=")[^"]*(")/, esc(title));
  html = setAttr(html, /(<meta property="og:description" content=")[^"]*(")/, esc(description));
  html = setAttr(html, /(<meta property="og:url" content=")[^"]*(")/, esc(url));
  html = setAttr(html, /(<meta name="twitter:title" content=")[^"]*(")/, esc(title));
  html = setAttr(html, /(<meta name="twitter:description" content=")[^"]*(")/, esc(description));
  html = setAttr(html, /(<link rel="canonical" href=")[^"]*(")/, esc(url));
  html = setAttr(html, /(<meta name="robots" content=")[^"]*(")/, robots);

  // Per-article social preview image (falls back to the site logo from the template).
  if (route.image) {
    html = setAttr(html, /(<meta property="og:image" content=")[^"]*(")/, esc(route.image));
    html = setAttr(html, /(<meta name="twitter:image" content=")[^"]*(")/, esc(route.image));
  }

  if (path !== '/') {
    html = stripHomeOnlySchema(html);
  }

  if (!SKIP_BODY.has(path)) {
    try {
      const body = render(path);
      html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
    } catch (err) {
      console.warn(`prerender: render failed for ${path}, leaving shell. ${err.message}`);
    }
  }

  const outPath =
    path === '/'
      ? resolve(DIST, 'index.html')
      : path === '/404'
        ? resolve(DIST, '404.html')
        : resolve(DIST, '.' + path, 'index.html');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html);
  written++;
}

// sitemap.xml from indexable routes.
const priorityFor = (p) =>
  p === '/' ? '1.0' : p === '/create' ? '0.9' : p.startsWith('/blog/') ? '0.6' : '0.8';
const indexable = routes.filter(r => !r.noindex && r.path !== '/404');
const urls = indexable
  .map(r => {
    const loc = r.path === '/' ? SITE_URL + '/' : SITE_URL + r.path;
    const lastmod = r.lastmod ? `\n    <lastmod>${esc(r.lastmod)}</lastmod>` : '';
    return `  <url>\n    <loc>${esc(loc)}</loc>${lastmod}\n    <changefreq>monthly</changefreq>\n    <priority>${priorityFor(r.path)}</priority>\n  </url>`;
  })
  .join('\n');
writeFileSync(
  resolve(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);

// robots.txt: resolve __SITE_URL__ token if present.
const robotsPath = resolve(DIST, 'robots.txt');
if (existsSync(robotsPath)) {
  writeFileSync(robotsPath, readFileSync(robotsPath, 'utf-8').replaceAll('__SITE_URL__', SITE_URL));
}

// ads.txt: generated only when ads are enabled. Strip the leading "ca-" from
// VITE_ADSENSE_CLIENT to get the pub-XXXX seller id. Omitted entirely when the
// var is unset so forks never ship someone else's publisher id. The trailing
// token is Google's fixed AdSense certification id (same for every publisher).
const adsenseClient = (env.VITE_ADSENSE_CLIENT || '').trim();
if (adsenseClient) {
  const pubId = adsenseClient.replace(/^ca-/, '');
  writeFileSync(resolve(DIST, 'ads.txt'), `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`);
}

console.log(`prerender: wrote ${written} routes, sitemap with ${indexable.length} URLs.`);
