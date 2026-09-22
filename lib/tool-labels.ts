// Friendly display names for analytics paths. Admin dashboard only.
import { TOOLS_CONFIG } from './tools-config';

const SPECIAL: Record<string, string> = {
  '/': 'Homepage',
  '/studio': 'PDF Studio',
  '/cv-builder': 'CV Builder',
  '/batch-pdf': 'Batch PDF',
  '/blog': 'Blog home',
  '/about': 'About page',
  '/contact': 'Contact page',
  '/faq': 'FAQ page',
  '/privacy': 'Privacy page',
  '/terms': 'Terms page',
  '/cookies': 'Cookie policy',
};

const slugToName = new Map<string, string>();
for (const tool of TOOLS_CONFIG) slugToName.set(tool.slug, tool.name);

function prettify(slug: string): string {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/** '/merge-pdf' -> 'Merge PDF Converter'; '/blog/how-to-x' -> 'Blog: How To X'; '/studio' -> 'PDF Studio'. */
export function toolLabel(path: string | null | undefined): string {
  if (!path) return 'Unknown page';
  const clean = path.split('?')[0].split('#')[0];
  if (SPECIAL[clean]) return SPECIAL[clean];
  if (clean.startsWith('/blog/')) return `Blog: ${prettify(clean.slice(6))}`;
  const slug = clean.replace(/^\/tools\//, '').replace(/^\//, '').replace(/\/$/, '');
  if (slugToName.has(slug)) return slugToName.get(slug)!;
  if (slug && !slug.includes('/')) return prettify(slug);
  return clean || 'Unknown page';
}

/** tool_execution slug ('merge-pdf') -> filter path ('/merge-pdf'). */
export function toolSlugToPath(slug: string | null | undefined): string {
  if (!slug) return '';
  return slug.startsWith('/') ? slug : `/${slug}`;
}
