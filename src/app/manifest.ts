import type { MetadataRoute } from 'next'
import { site } from '@/content/site'

// Literal hex is required here: paper and ultramarine from palette.json (P4 moves these to src/lib/gl/colors.ts).
const COLOURS = { background: '#f9f7f0', theme: '#1a30b3' } as const

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.manifest.shortName,
    description: site.description,
    start_url: '/',
    display: 'browser',
    background_color: COLOURS.background,
    theme_color: COLOURS.theme,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
