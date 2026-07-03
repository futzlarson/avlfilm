// Internal imports
import { redis, withRedis } from '@lib/redis';
import { logWarning } from '@lib/rollbar';

const CACHE_TTL_SECONDS = 60 * 60; // 1 hour — Luma content changes rarely
const FETCH_TIMEOUT_MS = 5000;

export interface LumaBlock {
  type: 'heading' | 'paragraph';
  html: string; // Sanitized inline HTML (text + <strong>/<em>/<a>/<br> only)
}

export interface LumaEventSummary {
  title: string | null;
  teaser: string | null; // Short one-liner Luma auto-generates (used for SEO/OG)
  description: LumaBlock[]; // Full event description, as ordered blocks
  coverImage: string | null;
}

const cacheKey = (url: string) => `luma:summary:${url}`;

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function metaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]*(?:name|property)="${key}"[^>]*content="([^"]*)"`, 'is'),
    new RegExp(`<meta[^>]*content="([^"]*)"[^>]*(?:name|property)="${key}"`, 'is'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return decodeEntities(m[1]);
  }
  return null;
}

// ── ProseMirror description parsing ──────────────────────────────────────────
// Luma embeds the full description as a ProseMirror doc (`description_mirror`)
// inside its __NEXT_DATA__ JSON. We render it to a small set of safe blocks so
// our page controls the markup (no injecting Luma's raw HTML).

interface PmMark {
  type?: string;
  attrs?: { href?: string };
}

interface PmNode {
  type?: string;
  text?: string;
  marks?: PmMark[];
  content?: PmNode[];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Only allow safe link protocols — blocks javascript:/data: hrefs.
function safeHref(href: string | undefined): string | null {
  if (!href) return null;
  try {
    const proto = new URL(href).protocol;
    if (proto === 'http:' || proto === 'https:' || proto === 'mailto:') return href;
  } catch {
    /* invalid URL */
  }
  return null;
}

function findKey<T>(obj: unknown, key: string): T | null {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findKey<T>(item, key);
      if (found !== null) return found;
    }
  } else if (obj && typeof obj === 'object') {
    const record = obj as Record<string, unknown>;
    if (key in record) return record[key] as T;
    for (const value of Object.values(record)) {
      const found = findKey<T>(value, key);
      if (found !== null) return found;
    }
  }
  return null;
}

// Render a text node to escaped HTML, applying its bold/italic/link marks.
function textNodeHtml(node: PmNode): string {
  let html = escapeHtml(node.text ?? '');
  const marks = node.marks ?? [];
  if (marks.some((m) => m.type === 'italic')) html = `<em>${html}</em>`;
  if (marks.some((m) => m.type === 'bold')) html = `<strong>${html}</strong>`;
  const link = marks.find((m) => m.type === 'link');
  if (link) {
    const href = safeHref(link.attrs?.href);
    if (href) html = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${html}</a>`;
  }
  return html;
}

function nodeHtml(node: PmNode): string {
  if (node.type === 'text') return textNodeHtml(node);
  if (node.type === 'hardBreak') return '<br>';
  return (node.content ?? []).map(nodeHtml).join('');
}

function parseDescription(html: string): LumaBlock[] {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
  if (!match) return [];

  let doc: PmNode | null;
  try {
    doc = findKey<PmNode>(JSON.parse(match[1]), 'description_mirror');
  } catch {
    return [];
  }
  if (!doc?.content) return [];

  const blocks: LumaBlock[] = [];
  for (const node of doc.content) {
    const html = nodeHtml(node).trim();
    // Skip empties and decorative divider lines (e.g. a row of underscores) —
    // check the visible text, ignoring tags.
    const visible = html.replace(/<[^>]*>/g, '');
    if (!visible || !/[a-z0-9]/i.test(visible)) continue;
    blocks.push({ type: node.type === 'heading' ? 'heading' : 'paragraph', html });
  }
  return blocks;
}

function parseSummary(html: string): LumaEventSummary {
  const rawTitle = metaContent(html, 'og:title') || metaContent(html, 'twitter:title');
  const title = rawTitle ? rawTitle.replace(/\s*·\s*Luma\s*$/, '') : null;

  const teaser = metaContent(html, 'description') || metaContent(html, 'og:description');

  // The og:image is a composite social card with the title baked in; the raw
  // uploaded cover photo is embedded as the `img=` param. Prefer the raw photo.
  const ogImage = metaContent(html, 'og:image') || metaContent(html, 'twitter:image');
  let coverImage = ogImage;
  if (ogImage) {
    const imgParam = ogImage.match(/[?&]img=([^&]+)/);
    if (imgParam) coverImage = decodeURIComponent(imgParam[1]);
  }

  return { title, teaser, description: parseDescription(html), coverImage };
}

/**
 * Fetch a summary (title, teaser, full description, cover image) for an external
 * Luma event page. Cached in Redis; degrades gracefully to empty on any failure.
 */
export async function getLumaEventSummary(url: string): Promise<LumaEventSummary> {
  const empty: LumaEventSummary = { title: null, teaser: null, description: [], coverImage: null };

  try {
    const cached = await withRedis(() => redis.get(cacheKey(url)));
    if (cached) return JSON.parse(cached) as LumaEventSummary;
  } catch (error) {
    logWarning('Redis cache miss for Luma summary', { error, url });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    clearTimeout(timeout);

    if (!res.ok) {
      logWarning('Luma fetch returned non-OK status', { url, status: res.status });
      return empty;
    }

    const summary = parseSummary(await res.text());

    try {
      await withRedis(() => redis.set(cacheKey(url), JSON.stringify(summary), { EX: CACHE_TTL_SECONDS }));
    } catch (error) {
      logWarning('Failed to cache Luma summary', { error, url });
    }

    return summary;
  } catch (error) {
    logWarning('Failed to fetch Luma event summary', { error, url });
    return empty;
  }
}
