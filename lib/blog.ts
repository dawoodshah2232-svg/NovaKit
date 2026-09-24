import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogSource {
  label: string;
  url: string;
}

export interface BlogMeta {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  date: string;
  author: string;
  image: string;
  imageAlt: string;
  readingMinutes: number;
  faqs: BlogFaq[];
  sources: BlogSource[];
  related: string[];
}

export interface BlogPost extends BlogMeta {
  html: string;
  howToSteps: BlogHowToStep[];
}

/** A numbered procedural step extracted from real guide content ("### Step 1: …"). */
export interface BlogHowToStep {
  position: number;
  name: string;
  text: string;
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
const BASE_URL = 'https://www.pdfedit.website';

/** Minimal strict frontmatter parser for the blog contract. */
function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('Blog post is missing valid frontmatter.');
  const [, fm, body] = match;
  const data: Record<string, unknown> = {};
  const lines = fm.split(/\r?\n/);
  let i = 0;
  let currentListKey: string | null = null;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) {
      i++;
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv && !line.startsWith(' ') && !line.startsWith('\t')) {
      const key = kv[1];
      const val = kv[2].trim();
      if (val === '') {
        currentListKey = key;
        data[key] = [];
      } else {
        currentListKey = null;
        data[key] = parseScalar(val);
      }
      i++;
      continue;
    }
    if (currentListKey && /^\s*-\s/.test(line)) {
      // `sources:` list uses `- label:` / `- url:` pairs (like faqs uses q:/a:)
      if (currentListKey === 'sources') {
        const item = line.replace(/^\s*-\s*/, '');
        const list = data[currentListKey] as BlogSource[];
        const subL = item.match(/^label:\s*(.*)$/);
        if (subL) {
          list.push({ label: parseScalar(subL[1].trim()) as string, url: '' });
        } else {
          const last = list[list.length - 1];
          const subU = item.match(/^url:\s*(.*)$/);
          if (last && subU) last.url = parseScalar(subU[1].trim()) as string;
        }
        i++;
        continue;
      }
      const item = line.replace(/^\s*-\s*/, '');
      const list = data[currentListKey] as unknown[];
      const subQ = item.match(/^q:\s*(.*)$/);
      if (subQ) {
        list.push({ q: parseScalar(subQ[1].trim()) as string, a: '' });
      } else {
        const last = list[list.length - 1] as Record<string, string> | undefined;
        const subA = item.match(/^a:\s*(.*)$/);
        if (last && subA && typeof last === 'object') {
          last.a = parseScalar(subA[1].trim()) as string;
        } else {
          list.push(parseScalar(item.trim()));
        }
      }
      i++;
      continue;
    }
    // nested `a:` answer line (standard YAML: indented, no dash)
    if (currentListKey === 'faqs' && /^\s+a:\s/.test(line)) {
      const list = data[currentListKey] as BlogFaq[];
      const last = list[list.length - 1];
      const m = line.match(/^\s+a:\s*(.*)$/);
      if (last && m) last.a = parseScalar(m[1].trim()) as string;
      i++;
      continue;
    }
    // continuation of a-multiline answer (indented plain text)
    if (currentListKey === 'faqs' && /^\s{4,}\S/.test(line)) {
      const list = data[currentListKey] as BlogFaq[];
      const last = list[list.length - 1];
      if (last) last.a += ' ' + line.trim();
      i++;
      continue;
    }
    currentListKey = null;
    i++;
  }
  return { data, body };
}

function parseScalar(val: string): unknown {
  const t = val.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  if (t.startsWith('[') && t.endsWith(']')) {
    return t
      .slice(1, -1)
      .split(',')
      .map((s) => parseScalar(s.trim()) as string)
      .filter(Boolean);
  }
  if (/^\d+$/.test(t)) return Number(t);
  return t;
}

function metaFromFile(slug: string): BlogMeta {
  const file = path.join(BLOG_DIR, `${slug}.md`);
  const raw = fs.readFileSync(file, 'utf8');
  const { data } = parseFrontmatter(raw);
  return {
    slug,
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    keywords: (data.keywords as string[]) ?? [],
    date: String(data.date ?? ''),
    author: String(data.author ?? 'PDFEdit Team'),
    image: String(data.image ?? ''),
    imageAlt: String(data.imageAlt ?? ''),
    readingMinutes: Number(data.readingMinutes ?? 6),
    faqs: (data.faqs as BlogFaq[]) ?? [],
    sources: (data.sources as BlogSource[]) ?? [],
    related: (data.related as string[]) ?? [],
  };
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort();
}

export function getAllPostsMeta(): BlogMeta[] {
  return getAllPostSlugs()
    .map(metaFromFile)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): BlogPost {
  const meta = metaFromFile(slug);
  const file = path.join(BLOG_DIR, `${slug}.md`);
  const raw = fs.readFileSync(file, 'utf8');
  const { body } = parseFrontmatter(raw);
  // Rewrite relative tool links to absolute for feeds/crawlers; keep relative in HTML.
  const html = marked.parse(body, { async: false }) as string;
  return { ...meta, html, howToSteps: extractHowToSteps(body) };
}

/** Strip inline Markdown down to plain text for schema fields. */
function stripInlineMarkdown(s: string): string {
  return s
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^\s*[-\d+.]\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract numbered procedural steps ("### Step 1: Title") from the raw
 * Markdown body. Only returns steps when they form a real sequence
 * starting at 1 with at least 2 steps — otherwise the post has no
 * step-by-step procedure and gets no HowTo schema.
 */
function extractHowToSteps(body: string): BlogHowToStep[] {
  const lines = body.split(/\r?\n/);
  const steps: BlogHowToStep[] = [];
  let current: { position: number; name: string; text: string } | null = null;

  const flush = () => {
    if (current) {
      const text = current.text.replace(/\s+/g, ' ').trim();
      if (current.name && text) {
        steps.push({
          position: current.position,
          name: current.name,
          text: text.length > 500 ? text.slice(0, 497) + '…' : text,
        });
      }
      current = null;
    }
  };

  for (const line of lines) {
    const stepMatch = line.match(/^#{2,4}\s*Step\s+(\d+)\s*:?\s*(.+?)\s*$/);
    if (stepMatch) {
      flush();
      current = {
        position: Number(stepMatch[1]),
        name: stripInlineMarkdown(stepMatch[2]),
        text: '',
      };
      continue;
    }
    // Any other heading ends the current step's body.
    if (/^#{1,4}\s/.test(line)) {
      flush();
      continue;
    }
    if (current) current.text += stripInlineMarkdown(line) + ' ';
  }
  flush();

  // Only genuine procedures: sequential from 1, at least 2 steps.
  if (steps.length < 2) return [];
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].position !== i + 1) return [];
  }
  return steps;
}

export function blogPostUrl(slug: string): string {
  return `${BASE_URL}/blog/${slug}`;
}

export function articleJsonLd(post: BlogPost): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: [`${BASE_URL}${post.image}`],
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: post.author, url: BASE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'PDFEdit',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/pdfedit-icon-192.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': blogPostUrl(post.slug) },
  };
}

export function faqJsonLd(post: BlogPost): Record<string, unknown> | null {
  if (!post.faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/**
 * HowTo JSON-LD for guide posts that contain a real numbered procedure.
 * Returns null when the post has no sequential steps — schema always
 * describes visible page content, never invented structure.
 */
export function howToJsonLd(post: BlogPost): Record<string, unknown> | null {
  if (post.howToSteps.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: post.title,
    description: post.description,
    image: [`${BASE_URL}${post.image}`],
    totalTime: `PT${Math.max(1, post.readingMinutes)}M`,
    step: post.howToSteps.map((s) => ({
      '@type': 'HowToStep',
      position: s.position,
      name: s.name,
      text: s.text,
    })),
  };
}
