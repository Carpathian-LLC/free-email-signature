// Blog content layer.
//
// Articles live as markdown files in src/content/blog/*.md, each with a small
// frontmatter block. They are imported eagerly via Vite's glob so the same data
// is available at runtime (client navigation), during SSR prerender, and at
// build time for the sitemap. Keep all article metadata in the frontmatter so
// there is a single source of truth per article.

import { marked } from 'marked';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO yyyy-mm-dd
  author: string;
  tags: string[];
  image: string; // cover image URL
  imageAlt: string;
  imageCredit: string;
  imageCreditUrl: string;
  readingTime: number; // minutes
  html: string; // rendered article body
}

marked.use({ gfm: true, breaks: false });

// Minimal frontmatter parser. We author the format, so it stays simple:
// a leading `---` block of `key: value` lines, then the markdown body. Values
// are taken verbatim after the first colon (so URLs with colons are safe).
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return { data, body: match[2] };
}

function estimateReadingTime(markdownBody: string): number {
  const words = markdownBody.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const modules = import.meta.glob('./content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

function buildPosts(): BlogPost[] {
  const posts: BlogPost[] = [];

  for (const [path, raw] of Object.entries(modules)) {
    const { data, body } = parseFrontmatter(raw);
    const fileSlug = path.split('/').pop()!.replace(/\.md$/, '');
    const slug = data.slug || fileSlug;

    posts.push({
      slug,
      title: data.title || slug,
      description: data.description || '',
      date: data.date || '',
      author: data.author || 'Free Signature Co.',
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      image: data.image || '',
      imageAlt: data.imageAlt || data.title || '',
      imageCredit: data.imageCredit || '',
      imageCreditUrl: data.imageCreditUrl || '',
      readingTime: data.readingTime ? parseInt(data.readingTime, 10) : estimateReadingTime(body),
      html: marked.parse(body) as string,
    });
  }

  // Newest first; fall back to title for stable ordering when dates tie.
  return posts.sort((a, b) =>
    b.date.localeCompare(a.date) || a.title.localeCompare(b.title)
  );
}

export const posts: BlogPost[] = buildPosts();

export function getPost(slug: string): BlogPost | undefined {
  return posts.find(p => p.slug === slug);
}

export function relatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = getPost(slug);
  if (!current) return posts.slice(0, limit);
  const scored = posts
    .filter(p => p.slug !== slug)
    .map(p => ({
      post: p,
      shared: p.tags.filter(t => current.tags.includes(t)).length,
    }))
    .sort((a, b) => b.shared - a.shared);
  return scored.slice(0, limit).map(s => s.post);
}
