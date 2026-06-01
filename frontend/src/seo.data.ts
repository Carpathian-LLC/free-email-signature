// Single source of truth for per-route metadata.
//
// Consumed in two places:
//   1. useSeo (src/seo.ts) at runtime, so client-side navigation updates the
//      title/description/canonical for the active route.
//   2. The prerender plugin (vite.config.ts) at build time, so every route's
//      served HTML carries its own meta. Without this, crawlers and social
//      scrapers that do not run JS would see the homepage meta on every URL.
//
// Keep titles and descriptions here only. Do not duplicate them into pages.

export interface PageSeo {
  title: string;
  description: string;
  noindex?: boolean;
}

export const SEO_PAGES: Record<string, PageSeo> = {
  '/': {
    title: 'Free Email Signature Generator for Gmail, Outlook & Apple Mail | Free Signature Co',
    description:
      'Free email signature generator. Build a professional HTML email signature for Gmail, Outlook, Apple Mail, and Thunderbird in under a minute. Photo upload, social links, five templates, no account, no paywall, no watermark.',
  },
  '/create': {
    title: 'Create Your Free Email Signature | Gmail, Outlook, Apple Mail',
    description:
      'Build a free professional HTML email signature in your browser. Add your photo, social links, and brand color. Copy and paste into Gmail, Outlook, Apple Mail, or Thunderbird. No account required.',
  },
  '/templates': {
    title: 'Email Signature Templates for Gmail, Outlook, and Apple Mail | Free Signature Co',
    description:
      'Five free professional email signature templates: professional, minimal, modern, bold, and compact. All work in Gmail, Outlook, Apple Mail, and Thunderbird. No account required.',
  },
  '/about': {
    title: 'About Free Signature Co | Why We Built a Free Email Signature Generator',
    description:
      'Why Carpathian built a free, open source email signature generator with no accounts, no paywall, and no watermark. Our take on subscription fatigue and the enshittification of the web.',
  },
  '/privacy': {
    title: 'Privacy Policy | Free Signature Co',
    description:
      'How Free Signature Co handles your data. No accounts, no tracking, your signature data stays in your browser. Full transparency on uploads, analytics, ads, and logs.',
  },
  '/security': {
    title: 'Security Policy | Free Signature Co',
    description:
      'TLS in transit, AES-256 at rest, magic-byte upload validation, path-traversal protection, and parameterized SQL. Full security details for Free Signature Co.',
  },
  '/my-signatures': {
    title: 'My Signatures | Free Signature Co',
    description:
      'View the email signatures you have created. Saved only in this browser using localStorage. No account, nothing stored on our servers.',
    noindex: true,
  },
  '/how-to-add-email-signature-gmail': {
    title: 'How to Add an Email Signature in Gmail (Free, 2026 Guide) | Free Signature Co',
    description:
      'Step-by-step guide to adding a professional HTML email signature in Gmail on the web, plus a note on the Gmail mobile app. Free, no account required.',
  },
  '/how-to-add-email-signature-outlook': {
    title: 'How to Add an Email Signature in Outlook (Free Guide) | Free Signature Co',
    description:
      'Step-by-step instructions for adding an HTML email signature in new Outlook, Outlook on the web, and classic Outlook desktop for Windows. Free, no account.',
  },
  '/how-to-add-email-signature-apple-mail': {
    title: 'How to Add an Email Signature in Apple Mail (macOS and iPhone) | Free Signature Co',
    description:
      'Step-by-step guide to adding an HTML email signature in Apple Mail on macOS, plus the plain-text signature setting on iPhone and iPad. Free, no account required.',
  },
  '/free-email-signature-generator-mac': {
    title: 'Free Email Signature Generator for Mac & Apple Mail | Free Signature Co',
    description:
      'Create a free, professional email signature for Mac and Apple Mail. No account, no watermark. Build it in your browser, add your photo and logo, and paste it straight into Apple Mail.',
  },
  '/free-gmail-signature-generator': {
    title: 'Free Gmail Signature Generator | Free Signature Co',
    description:
      'Create a free, professional Gmail email signature in your browser. No account, no watermark. Pick a template, add your photo and logo, and paste it straight into Gmail.',
  },
  '/email-signature-best-practices': {
    title: 'Email Signature Best Practices and Examples | Free Signature Co',
    description:
      'Email signature best practices: what to include, what to leave out, sizing and format tips, accessibility, and mobile considerations. With a free signature generator.',
  },
  '/404': {
    title: 'Page Not Found | Free Signature Co',
    description:
      'The page you were looking for does not exist. Head back home or create a free email signature instead.',
    noindex: true,
  },
};
