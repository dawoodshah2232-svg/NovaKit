import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.pdfedit.website';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/ui-preview',
          '/api',
          '/studio-v2-preview',
          '/cv-builder-preview',
        ],
      },
    ],

    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}