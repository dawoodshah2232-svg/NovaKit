import type { MetadataRoute } from 'next';
import { TOOLS_CONFIG } from '@/lib/tools-config';

const BASE_URL = 'https://www.pdfedit.website';

/*
 * IMPORTANT:
 * Do not fake lastModified with new Date() on every deployment.
 * Only add lastModified when we have a genuine content-update date.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const corePages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/studio`,
      changeFrequency: 'weekly',
      priority: 0.95,
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
  ];

  /*
   * Existing dedicated high-value PDF routes.
   * We keep these in the sitemap because they are real pages in the app.
   */
  const dedicatedPdfRoutes = [
    '/merge-pdf',
    '/split-pdf',
    '/compress-pdf',
    '/edit-pdf',
    '/sign-pdf',
    '/ocr-pdf',
    '/pdf-to-jpg',
    '/jpg-to-pdf',
    '/pdf-to-images',
    '/rotate-pdf',
    '/organize-pdf',
    '/watermark-pdf',
    '/unlock-pdf',
    '/batch-pdf',
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
  const dynamicTools: MetadataRoute.Sitemap =
    TOOLS_CONFIG.map((tool) => ({
      url: `${BASE_URL}/tools/${tool.slug}`,
      changeFrequency: 'monthly',
      priority: tool.category === 'PDF' ? 0.8 : 0.7,
    }));

  /*
   * Remove accidental duplicate URLs before returning.
   */
  const pages = [
    ...corePages,
    ...dedicatedPages,
    ...dynamicTools,
  ];

  return Array.from(
    new Map(pages.map((page) => [page.url, page])).values()
  );
}