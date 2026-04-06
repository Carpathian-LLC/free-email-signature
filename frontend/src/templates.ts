import { SignatureFields, Template, StyleOptions } from './types';
import { SOCIAL_PLATFORMS, buildIconDataUri } from './socialIcons';

// ── Sample data for template previews ───────────────────────────────

const PLACEHOLDER_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e5e7eb'/%3E%3Ccircle cx='100' cy='80' r='35' fill='%239ca3af'/%3E%3Cellipse cx='100' cy='170' rx='55' ry='45' fill='%239ca3af'/%3E%3C/svg%3E";

export const SAMPLE_DATA: SignatureFields = {
  fullName: 'Peter Oswald',
  title: 'Software Engineer',
  company: 'Carpathian',
  email: 'peter@carpathian.ai',
  phone: '(515) 344-3081',
  website: 'carpathian.ai',
  addressLine1: 'West Des Moines, IA 50265',
  addressLine2: '',
  photoUrl: PLACEHOLDER_PHOTO,
  socialLinks: [],
};

// ── Utilities ───────────────────────────────────────────────────────

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function safeColor(color: string, fallback: string): string {
  return /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : fallback;
}

function isSafeUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, 'https://placeholder.invalid');
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'mailto:';
  } catch {
    return false;
  }
}

function isSafeImgSrc(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('data:image/')) {
    const mime = url.slice(5, url.indexOf(';')).toLowerCase();
    if (mime === 'image/svg+xml') return false;
    return true;
  }
  return isSafeUrl(url);
}

function buildSocialHtml(f: SignatureFields, style: StyleOptions, gap: string = '&nbsp;'): string {
  let html = '';
  for (const link of f.socialLinks) {
    if (!link.url || !isSafeUrl(toHref(link.url))) continue;

    let iconSrc = link.iconUrl;
    if (link.platformId) {
      const platform = SOCIAL_PLATFORMS.find(p => p.id === link.platformId);
      if (platform) iconSrc = buildIconDataUri(platform.path, safeColor(style.iconColor, '#6b7280'));
    }
    if (!iconSrc || !isSafeImgSrc(iconSrc)) continue;

    if (html) html += gap;
    html += `<a href="${esc(toHref(link.url))}" target="_blank" style="text-decoration:none"><img src="${esc(iconSrc)}" width="22" height="22" alt="${esc(link.platform)}" style="border:0;display:inline-block"></a>`;
  }
  return html;
}

function toHref(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

// ─── Professional ───────────────────────────────────────────────────

function buildProfessional(f: SignatureFields, style: StyleOptions): string {
  const social = buildSocialHtml(f, style);
  const sep = safeColor(style.separatorColor, '#e5e7eb');
  const photo = isSafeImgSrc(f.photoUrl) ? f.photoUrl : '';
  const lines: string[] = [];

  if (f.fullName) lines.push(`<p style="margin:0;padding:0;font-size:18px;font-weight:bold;color:#1f2937;font-family:Arial,sans-serif">${esc(f.fullName)}</p>`);
  if (f.title) lines.push(`<p style="margin:2px 0 0;padding:0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif">${esc(f.title)}</p>`);
  if (f.company) lines.push(`<p style="margin:2px 0 0;padding:0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif">${esc(f.company)}</p>`);
  lines.push(`<table width="100%" cellpadding="0" cellspacing="0" border="0"><tbody><tr><td style="padding:8px 0"><div style="border-top:1px solid ${esc(sep)};line-height:1px;font-size:1px">&nbsp;</div></td></tr></tbody></table>`);
  if (f.addressLine1) lines.push(`<p style="margin:0;padding:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif">${esc(f.addressLine1)}</p>`);
  if (f.addressLine2) lines.push(`<p style="margin:0;padding:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif">${esc(f.addressLine2)}</p>`);
  if (f.email) lines.push(`<p style="margin:0;padding:0;font-size:12px;font-family:Arial,sans-serif"><a href="mailto:${esc(f.email)}" style="color:#6b7280;text-decoration:none">${esc(f.email)}</a></p>`);
  if (f.phone) lines.push(`<p style="margin:0;padding:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif">${esc(f.phone)}</p>`);
  if (f.website && isSafeUrl(toHref(f.website))) lines.push(`<p style="margin:0;padding:0;font-size:12px;font-family:Arial,sans-serif"><a href="${esc(toHref(f.website))}" style="color:#6b7280;text-decoration:none" target="_blank">${esc(f.website)}</a></p>`);

  if (photo) {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif"><tbody><tr><td style="vertical-align:top;padding-right:15px"><img src="${esc(photo)}" width="130" alt="${esc(f.fullName)}" style="border-radius:50%;display:block">${social ? `<p style="margin:8px 0 0;padding:0;text-align:center">${social}</p>` : ''}</td><td style="vertical-align:top;padding-left:15px;border-left:2px solid ${esc(sep)}">${lines.join('')}</td></tr></tbody></table>`;
  }
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif"><tbody><tr><td>${lines.join('')}${social ? `<p style="margin:8px 0 0;padding:0">${social}</p>` : ''}</td></tr></tbody></table>`;
}

// ─── Minimal ────────────────────────────────────────────────────────

function buildMinimal(f: SignatureFields, style: StyleOptions): string {
  const social = buildSocialHtml(f, style);
  const sep = safeColor(style.separatorColor, '#e5e7eb');
  const photo = isSafeImgSrc(f.photoUrl) ? f.photoUrl : '';
  const lines: string[] = [];

  if (photo) lines.push(`<p style="margin:0 0 8px;padding:0"><img src="${esc(photo)}" width="80" alt="${esc(f.fullName)}" style="border-radius:50%;display:block"></p>`);
  if (f.fullName) lines.push(`<p style="margin:0;padding:0;font-size:16px;font-weight:bold;color:#111827;font-family:Arial,sans-serif">${esc(f.fullName)}</p>`);
  const titleCompany = [f.title, f.company].filter(Boolean).join(' at ');
  if (titleCompany) lines.push(`<p style="margin:2px 0 0;padding:0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif">${esc(titleCompany)}</p>`);
  lines.push(`<table width="200" cellpadding="0" cellspacing="0" border="0"><tbody><tr><td style="padding:6px 0"><div style="border-top:1px solid ${esc(sep)};line-height:1px;font-size:1px">&nbsp;</div></td></tr></tbody></table>`);

  const contact: string[] = [];
  if (f.email) contact.push(`<a href="mailto:${esc(f.email)}" style="color:#6b7280;text-decoration:none">${esc(f.email)}</a>`);
  if (f.phone) contact.push(esc(f.phone));
  if (f.website && isSafeUrl(toHref(f.website))) contact.push(`<a href="${esc(toHref(f.website))}" style="color:#6b7280;text-decoration:none" target="_blank">${esc(f.website)}</a>`);
  if (contact.length) lines.push(`<p style="margin:0;padding:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif">${contact.join(' &middot; ')}</p>`);

  const address = [f.addressLine1, f.addressLine2].filter(Boolean).join(', ');
  if (address) lines.push(`<p style="margin:2px 0 0;padding:0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif">${esc(address)}</p>`);
  if (social) lines.push(`<p style="margin:8px 0 0;padding:0">${social}</p>`);

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif"><tbody><tr><td>${lines.join('')}</td></tr></tbody></table>`;
}

// ─── Modern ─────────────────────────────────────────────────────────

function buildModern(f: SignatureFields, style: StyleOptions): string {
  const social = buildSocialHtml(f, style);
  const accent = safeColor(style.accentColor, '#1B8FF2');
  const photo = isSafeImgSrc(f.photoUrl) ? f.photoUrl : '';
  const lines: string[] = [];

  if (f.fullName) lines.push(`<p style="margin:0;padding:0;font-size:20px;font-weight:bold;color:${esc(accent)};font-family:Arial,sans-serif">${esc(f.fullName)}</p>`);
  const sub = [f.title, f.company].filter(Boolean).join(' | ');
  if (sub) lines.push(`<p style="margin:4px 0 0;padding:0;font-size:13px;color:#374151;font-family:Arial,sans-serif">${esc(sub)}</p>`);
  lines.push(`<table cellpadding="0" cellspacing="0" border="0"><tbody><tr><td style="padding:8px 0;line-height:1px">&nbsp;</td></tr></tbody></table>`);
  if (f.email) lines.push(`<p style="margin:0;padding:0;font-size:12px;font-family:Arial,sans-serif"><a href="mailto:${esc(f.email)}" style="color:#374151;text-decoration:none">${esc(f.email)}</a></p>`);
  if (f.phone) lines.push(`<p style="margin:2px 0 0;padding:0;font-size:12px;color:#374151;font-family:Arial,sans-serif">${esc(f.phone)}</p>`);
  if (f.website && isSafeUrl(toHref(f.website))) lines.push(`<p style="margin:2px 0 0;padding:0;font-size:12px;font-family:Arial,sans-serif"><a href="${esc(toHref(f.website))}" style="color:${esc(accent)};text-decoration:none" target="_blank">${esc(f.website)}</a></p>`);
  const address = [f.addressLine1, f.addressLine2].filter(Boolean).join(', ');
  if (address) lines.push(`<p style="margin:2px 0 0;padding:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif">${esc(address)}</p>`);
  if (social) lines.push(`<p style="margin:8px 0 0;padding:0">${social}</p>`);

  const content = lines.join('');
  if (photo) {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif"><tbody><tr><td style="vertical-align:top;padding-right:15px"><img src="${esc(photo)}" width="100" alt="${esc(f.fullName)}" style="border-radius:8px;display:block"></td><td style="vertical-align:top;border-left:3px solid ${esc(accent)};padding-left:15px">${content}</td></tr></tbody></table>`;
  }
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif"><tbody><tr><td style="border-left:3px solid ${esc(accent)};padding-left:15px">${content}</td></tr></tbody></table>`;
}

// ─── Bold ───────────────────────────────────────────────────────────

function buildBold(f: SignatureFields, style: StyleOptions): string {
  const social = buildSocialHtml(f, style);
  const accent = safeColor(style.accentColor, '#1B8FF2');
  const sep = safeColor(style.separatorColor, '#e5e7eb');
  const photo = isSafeImgSrc(f.photoUrl) ? f.photoUrl : '';

  let headerBar = '';
  if (f.fullName) {
    const titleLine = f.title ? `<p style="margin:2px 0 0;padding:0;font-size:12px;color:rgba(255,255,255,0.85);font-family:Arial,sans-serif">${esc(f.title)}${f.company ? ` at ${esc(f.company)}` : ''}</p>` : '';
    headerBar = `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tbody><tr><td style="background-color:${esc(accent)};padding:12px 16px"><p style="margin:0;padding:0;font-size:18px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif">${esc(f.fullName)}</p>${titleLine}</td></tr></tbody></table>`;
  }

  const contactParts: string[] = [];
  if (f.email) contactParts.push(`<a href="mailto:${esc(f.email)}" style="color:#374151;text-decoration:none">${esc(f.email)}</a>`);
  if (f.phone) contactParts.push(`<span style="color:#374151">${esc(f.phone)}</span>`);
  if (f.website && isSafeUrl(toHref(f.website))) contactParts.push(`<a href="${esc(toHref(f.website))}" style="color:${esc(accent)};text-decoration:none" target="_blank">${esc(f.website)}</a>`);
  const address = [f.addressLine1, f.addressLine2].filter(Boolean).join(', ');

  let contactBlock = '';
  if (contactParts.length || address || social) {
    const inner: string[] = [];
    if (contactParts.length) inner.push(`<p style="margin:0;padding:0;font-size:12px;font-family:Arial,sans-serif">${contactParts.join(' &middot; ')}</p>`);
    if (address) inner.push(`<p style="margin:4px 0 0;padding:0;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif">${esc(address)}</p>`);
    if (social) inner.push(`<p style="margin:8px 0 0;padding:0">${social}</p>`);
    contactBlock = `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tbody><tr><td style="padding:10px 16px;border:1px solid ${esc(sep)};border-top:none">${inner.join('')}</td></tr></tbody></table>`;
  }

  if (photo) {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif"><tbody><tr><td style="vertical-align:top">${headerBar}${contactBlock}</td><td style="vertical-align:top;padding-left:15px"><img src="${esc(photo)}" width="100" alt="${esc(f.fullName)}" style="border-radius:8px;display:block"></td></tr></tbody></table>`;
  }
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;width:auto"><tbody><tr><td>${headerBar}${contactBlock}</td></tr></tbody></table>`;
}

// ─── Compact ────────────────────────────────────────────────────────

function buildCompact(f: SignatureFields, style: StyleOptions): string {
  const social = buildSocialHtml(f, style, ' ');
  const photo = isSafeImgSrc(f.photoUrl) ? f.photoUrl : '';
  const lines: string[] = [];

  const nameParts: string[] = [];
  if (f.fullName) nameParts.push(`<strong>${esc(f.fullName)}</strong>`);
  const titleCo = [f.title, f.company].filter(Boolean).join(', ');
  if (titleCo) nameParts.push(esc(titleCo));
  if (nameParts.length) lines.push(`<p style="margin:0;padding:0;font-size:13px;color:#374151;font-family:Arial,sans-serif">${nameParts.join(' &middot; ')}</p>`);

  const contact: string[] = [];
  if (f.email) contact.push(`<a href="mailto:${esc(f.email)}" style="color:#6b7280;text-decoration:none">${esc(f.email)}</a>`);
  if (f.phone) contact.push(esc(f.phone));
  if (f.website && isSafeUrl(toHref(f.website))) contact.push(`<a href="${esc(toHref(f.website))}" style="color:#6b7280;text-decoration:none" target="_blank">${esc(f.website)}</a>`);
  if (contact.length) lines.push(`<p style="margin:2px 0 0;padding:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif">${contact.join(' &middot; ')}</p>`);

  const address = [f.addressLine1, f.addressLine2].filter(Boolean).join(', ');
  if (address) lines.push(`<p style="margin:2px 0 0;padding:0;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif">${esc(address)}</p>`);
  if (social) lines.push(`<p style="margin:6px 0 0;padding:0">${social}</p>`);

  if (photo) {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif"><tbody><tr><td style="vertical-align:middle;padding-right:10px"><img src="${esc(photo)}" width="50" height="50" alt="${esc(f.fullName)}" style="border-radius:50%;display:block"></td><td style="vertical-align:middle">${lines.join('')}</td></tr></tbody></table>`;
  }
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif"><tbody><tr><td>${lines.join('')}</td></tr></tbody></table>`;
}

// ─── Export ─────────────────────────────────────────────────────────

export const templates: Template[] = [
  { id: 'professional', name: 'Professional', description: 'Classic corporate style with photo and dividers', build: buildProfessional },
  { id: 'minimal', name: 'Minimal', description: 'Clean text-focused design with subtle divider', build: buildMinimal },
  { id: 'modern', name: 'Modern', description: 'Accent bar with contemporary styling', build: buildModern },
  { id: 'bold', name: 'Bold', description: 'Colored header bar with strong visual presence', build: buildBold },
  { id: 'compact', name: 'Compact', description: 'Condensed format for minimal footprint', build: buildCompact },
];
