import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function siteUrlPlugin(siteUrl: string): Plugin {
  return {
    name: 'site-url-replace',
    generateBundle(_, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'asset' && typeof file.source === 'string') {
          file.source = file.source.replaceAll('__SITE_URL__', siteUrl);
        }
      }
    },
  }
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

  const define: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('VITE_')) {
      define[`import.meta.env.${key}`] = JSON.stringify(value);
    }
  }

  return {
    plugins: [react(), siteUrlPlugin(siteUrl)],
    define,
    server: {
      port: parseInt(env.FRONTEND_PORT || '5000', 10),
    },
    preview: {
      port: parseInt(env.FRONTEND_PORT || '5000', 10),
      allowedHosts: [new URL(siteUrl).hostname],
    },
  }
})
