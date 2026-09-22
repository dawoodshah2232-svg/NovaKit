import type { NextConfig } from "next";

/**
 * Security hardening for PDFEdit (pdfedit.website).
 *
 * - HSTS: force HTTPS for 2 years, include subdomains, preload-ready.
 * - Content-Security-Policy: first-party scripts only (+ 'unsafe-inline' which
 *   Next.js requires for its bootstrap). Google Ad/Analytics domains are
 *   allow-listed because the privacy policy discloses AdSense/DoubleClick;
 *   nothing else may load scripts, objects, or frames. No site may frame us.
 * - X-Content-Type-Options / X-Frame-Options / Referrer-Policy /
 *   Permissions-Policy: lock down MIME sniffing, clickjacking, referrer
 *   leakage, and device APIs (camera/mic/location are never needed).
 * - Cross-Origin-Opener-Policy + Origin-Agent-Cluster: isolate the browsing
 *   context against cross-origin attacks.
 * - poweredByHeader: false — do not advertise the framework version.
 */
const csp = [
  "default-src 'self'",
  // 'unsafe-inline' is required by Next.js inline bootstrap scripts.
  "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.googletagservices.com https://www.google-analytics.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
  "font-src 'self'",
  "connect-src 'self' https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
  "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
      "ambient-light-sensor=()",
      "autoplay=()",
      "encrypted-media=()",
      "fullscreen=(self)",
      "picture-in-picture=()",
    ].join(", "),
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Origin-Agent-Cluster", value: "?1" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Applies to pages, assets, and API routes.
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
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
