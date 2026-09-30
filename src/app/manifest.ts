import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { HEX } from '@/lib/gl/colors'

// Manifest colours must be literal sRGB; HEX mirrors palette.json (tests/unit/gl.test.ts).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.manifest.shortName,
    description: site.description,
    start_url: '/',
    display: 'browser',
    background_color: HEX.paper,
    theme_color: HEX.ultramarine,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
