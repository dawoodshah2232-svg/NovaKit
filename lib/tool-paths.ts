// Canonical public path for every tool slug. Single source of truth — also
// used by app/tools/[slug]/page.tsx for canonical URLs and by the admin
// analytics product ranking for drill-down filters.
export const canonicalPathBySlug: Record<string, string> = {
  'image-to-pdf': '/jpg-to-pdf',
  'pdf-to-images': '/pdf-to-images',
  'organize-pdf': '/organize-pdf',
  'unlock-pdf': '/unlock-pdf',
  'protect-pdf': '/protect-pdf',
  'rotate-pdf': '/rotate-pdf',
  'watermark-pdf': '/watermark-pdf',
  'split-pdf': '/split-pdf',
  'pdf-merger': '/merge-pdf',
  'compress-pdf': '/compress-pdf',
  'pdf-to-jpg': '/pdf-to-jpg',
  'pdf-to-word': '/pdf-to-word',
  'word-to-pdf': '/word-to-pdf',
  'ocr-pdf': '/ocr-pdf',
  'sign-pdf': '/sign-pdf',
  'delete-pdf-pages': '/delete-pdf-pages',
  'extract-pdf-pages': '/extract-pdf-pages',
  'add-page-numbers': '/add-page-numbers',
  'crop-pdf': '/crop-pdf',
  'pdf-to-text': '/pdf-to-text',
  'flatten-pdf': '/flatten-pdf',
  'redact-pdf': '/redact-pdf',
  'edit-pdf-metadata': '/edit-pdf',
  'studio': '/studio',
  'cv-builder': '/cv-builder',
  'batch-pdf': '/batch-pdf',
};

/** tool slug ('merge-pdf', 'color-extractor', 'studio') -> canonical page path. */
export function toolSlugToCanonicalPath(slug: string | null | undefined): string {
  if (!slug) return '';
  if (slug.startsWith('/')) return slug;
  return canonicalPathBySlug[slug] || `/tools/${slug}`;
}
