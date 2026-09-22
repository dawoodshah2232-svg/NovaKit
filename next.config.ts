import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/google-sitemap.xml', destination: '/sitemap.xml', permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: '/compress-pdf', destination: '/tools/compress-pdf' },
      { source: '/split-pdf', destination: '/tools/split-pdf' },
      { source: '/pdf-to-jpg', destination: '/tools/pdf-to-images' },
      { source: '/jpg-to-pdf', destination: '/tools/image-to-pdf' },
      { source: '/rotate-pdf', destination: '/tools/rotate-pdf' },
      { source: '/organize-pdf', destination: '/tools/organize-pdf' },
      { source: '/watermark-pdf', destination: '/tools/watermark-pdf' },
      { source: '/unlock-pdf', destination: '/tools/unlock-pdf' },
      { source: '/pdf-to-images', destination: '/tools/pdf-to-images' },
    ];
  },
};

export default nextConfig;
