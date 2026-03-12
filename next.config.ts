import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during bundling
  silent: true,
  org: "solo-sme",
  project: "solo-sme",

  // Routes all HTTP requests to Sentry through a Next.js rewrite to circumvent ad-blockers (requires additional setup)
  tunnelRoute: "/monitoring",

  // Sourcemap configuration
  sourcemaps: {
    // Automatically delete client-side source maps after uploading them to Sentry.
    deleteSourcemapsAfterUpload: true,
  },

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  // Note: These webpack-specific settings are ignored by Turbopack but kept for compatibility.
  webpack: {
    automaticVercelMonitors: true,
  },
  treeshake: {
    removeDebugLogging: true,
  },
});
