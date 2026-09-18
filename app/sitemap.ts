import type { MetadataRoute } from 'next';
import { TOOLS_CONFIG } from '@/lib/tools-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://novakit.app';
  const currentDate = new Date().toISOString();

  const toolRoutes: MetadataRoute.Sitemap = TOOLS_CONFIG.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
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
