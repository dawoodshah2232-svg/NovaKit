import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.pdfedit.website';
  const currentDate = new Date().toISOString();

  const canonicalRoutes = [
    '/merge-pdf',
    '/compress-pdf',
    '/edit-pdf',
    '/split-pdf',
    '/sign-pdf',
    '/ocr-pdf',
    '/pdf-to-jpg',
    '/jpg-to-pdf',
    '/rotate-pdf',
    '/organize-pdf',
    '/watermark-pdf',
    '/unlock-pdf',
    '/pdf-to-images',
  ];

  const toolRoutes: MetadataRoute.Sitemap = canonicalRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...toolRoutes,
  ];
}
