import type { MetadataRoute } from 'next';
import { TOOLS_CONFIG } from '@/lib/tools-config';
import { getAllPostsMeta } from '@/lib/blog';

const BASE_URL = 'https://www.pdfedit.website';

/*
 * IMPORTANT:
 * Do not fake lastModified with new Date() on every deployment.
 * Only add lastModified when we have a genuine content-update date.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const corePages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/studio`,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/cv-builder`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookies`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/disclaimer`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/faq`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/embed`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/search`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  /*
   * Existing dedicated high-value PDF routes.
   * We keep these in the sitemap because they are real pages in the app.
   */
  const dedicatedPdfRoutes = [
    '/merge-pdf',
    '/split-pdf',
    '/compress-pdf',
    '/jpg-to-pdf',
    '/pdf-to-images',
    '/pdf-to-jpg',
    '/pdf-to-word',
    '/word-to-pdf',
    '/ocr-pdf',
    '/sign-pdf',
    '/rotate-pdf',
    '/organize-pdf',
    '/watermark-pdf',
    '/unlock-pdf',
    '/protect-pdf',
    '/batch-pdf',
    '/delete-pdf-pages',
    '/extract-pdf-pages',
    '/add-page-numbers',
    '/crop-pdf',
    '/pdf-to-text',
    '/flatten-pdf',
    '/redact-pdf',
    '/edit-pdf',
  ];

  const dedicatedPages: MetadataRoute.Sitemap =
    dedicatedPdfRoutes.map((route) => ({
      url: `${BASE_URL}${route}`,
      changeFrequency: 'monthly',
      priority: 0.85,
    }));

  /*
   * Dynamic utility pages.
   * The sitemap automatically expands when a new tool is added
   * to TOOLS_CONFIG, so tools can no longer silently disappear.
   */
  const dedicatedToolSlugs = new Set([
    'image-to-pdf',
    'pdf-to-images',
    'pdf-to-jpg',
    'pdf-to-word',
    'word-to-pdf',
    'ocr-pdf',
    'sign-pdf',
    'organize-pdf',
    'unlock-pdf',
    'protect-pdf',
    'rotate-pdf',
    'watermark-pdf',
    'split-pdf',
    'pdf-merger',
    'compress-pdf',
    'delete-pdf-pages',
    'extract-pdf-pages',
    'add-page-numbers',
    'crop-pdf',
    'pdf-to-text',
    'flatten-pdf',
    'redact-pdf',
    // Excluded: /tools/edit-pdf-metadata emits robots noindex and canonicalizes
    // to the dedicated /edit-pdf route, so it must not appear in the sitemap.
    'edit-pdf-metadata',
  ]);

  const dynamicTools: MetadataRoute.Sitemap =
    TOOLS_CONFIG.filter((tool) => !dedicatedToolSlugs.has(tool.slug)).map((tool) => ({
      url: `${BASE_URL}/tools/${tool.slug}`,
      changeFrequency: 'monthly',
      priority: tool.category === 'PDF' ? 0.8 : 0.7,
    }));

  /*
   * i18n pilot (branch blitz/i18n): Spanish + Arabic versions of the
   * homepage and the 5 top tool pages. hreflang itself is emitted per page
   * via metadata `alternates.languages`; the sitemap lists the URLs.
   */
  const i18nPilotRoutes = [
    '',
    '/merge-pdf',
    '/compress-pdf',
    '/pdf-to-word',
    '/word-to-pdf',
    '/sign-pdf',
  ];
  const i18nPages: MetadataRoute.Sitemap = [];
  for (const locale of ['es', 'ar'] as const) {
    for (const route of i18nPilotRoutes) {
      i18nPages.push({
        url: `${BASE_URL}/${locale}${route}`,
        changeFrequency: route === '' ? ('weekly' as const) : ('monthly' as const),
        priority: route === '' ? 0.9 : 0.75,
      });
    }
  }

  /*
   * Honest competitor comparison landing pages.
   */
  const compareRoutes = [
    '/compare/pdfedit-vs-smallpdf',
    '/compare/pdfedit-vs-ilovepdf',
    '/compare/pdfedit-vs-sejda',
  ];

  const comparePages: MetadataRoute.Sitemap = compareRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  /*
   * Remove accidental duplicate URLs before returning.
   */
  const pages = [
    ...corePages,
    ...dedicatedPages,
    ...i18nPages,
    ...dynamicTools,
    ...comparePages,
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    /*
     * Blog posts carry their real publication date as lastmod — taken from
     * each post's frontmatter, never faked. Core/tool pages omit lastmod
     * because we don't have a genuine per-page update date for them.
     */
    ...getAllPostsMeta().map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];

  return Array.from(
    new Map(pages.map((page) => [page.url, page])).values()
  );
}