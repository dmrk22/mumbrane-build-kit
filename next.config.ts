import type { NextConfig } from 'next'
import { SECURITY_HEADERS, SHAREABLE_HEADERS } from './src/lib/security/headers.ts'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  productionBrowserSourceMaps: false,
  images: { unoptimized: true },
  // `next dev` otherwise appends its own agent notes to the protected CLAUDE.md (D-105).
  agentRules: false,
  // Screenshots are taken against `next dev`; the floating dev badge would land in every review shot.
  devIndicators: false,
  experimental: { serverActions: { bodySizeLimit: '64kb' } },
  async headers() {
    return [
      { source: '/:path*', headers: [...SECURITY_HEADERS] },
      { source: '/og/:path*', headers: [...SHAREABLE_HEADERS] }, // later rule wins for the same key
      {
        source: '/paintings/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ]
  },
  // Legacy URLs of the current site (PAGES §0.6); constant internal destinations only.
  async redirects() {
    return [
      { source: '/releases', destination: '/moth#evidence', permanent: true },
      { source: '/privacy', destination: '/legal/privacy', permanent: true },
      { source: '/terms', destination: '/legal/terms', permanent: true },
      { source: '/login', destination: '/console', permanent: false },
      { source: '/:path*.md', destination: '/md/:path*', permanent: true },
    ]
  },
}

export default nextConfig
