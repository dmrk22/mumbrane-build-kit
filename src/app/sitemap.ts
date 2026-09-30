import type { MetadataRoute } from 'next'
import { ROUTES } from '@/content/routes'
import { publicEnv } from '@/lib/env'

// Every indexable route in the registry; article slugs join in P8 with their lastModified dates.
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.filter((r) => r.sitemap).map((r) => ({ url: new URL(r.path, publicEnv.siteUrl).href }))
}
