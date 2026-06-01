import { useEffect } from 'react';
import { SEO_PAGES } from './seo.data';

interface SeoOptions {
  path: string;
  // Optional overrides. When omitted, title/description/noindex are pulled from
  // SEO_PAGES[path] so the runtime and the build-time prerender stay in sync.
  title?: string;
  description?: string;
  noindex?: boolean;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useSeo({ path, title, description, noindex }: SeoOptions) {
  const page = SEO_PAGES[path];
  const resolvedTitle = title ?? page?.title ?? 'Free Signature Co';
  const resolvedDescription = description ?? page?.description ?? '';
  const resolvedNoindex = noindex ?? page?.noindex ?? false;

  useEffect(() => {
    document.title = resolvedTitle;
    upsertMeta('name', 'description', resolvedDescription);
    upsertMeta('property', 'og:title', resolvedTitle);
    upsertMeta('property', 'og:description', resolvedDescription);
    upsertMeta('name', 'twitter:title', resolvedTitle);
    upsertMeta('name', 'twitter:description', resolvedDescription);

    const siteUrl = (import.meta.env.VITE_SITE_URL as string | undefined) || window.location.origin;
    const fullUrl = siteUrl.replace(/\/$/, '') + path;
    upsertCanonical(fullUrl);
    upsertMeta('property', 'og:url', fullUrl);

    upsertMeta(
      'name',
      'robots',
      resolvedNoindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large'
    );
  }, [resolvedTitle, resolvedDescription, path, resolvedNoindex]);
}
