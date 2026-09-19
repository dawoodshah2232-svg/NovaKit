import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/merge-pdf', destination: '/tools/pdf-merger' },
      { source: '/compress-pdf', destination: '/tools/compress-pdf' },
      { source: '/edit-pdf', destination: '/tools/edit-pdf-metadata' },
      { source: '/split-pdf', destination: '/tools/split-pdf' },
      { source: '/sign-pdf', destination: '/tools/protect-pdf' },
      { source: '/ocr-pdf', destination: '/tools/pdf-to-images' },
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
