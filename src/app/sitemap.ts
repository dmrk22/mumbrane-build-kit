import type { MetadataRoute } from 'next'
import { REGISTRY } from '@/content/routes'
import { publicEnv } from '@/lib/env'

// Every indexable route in the registry, articles included (they gain lastModified in P8).
export default function sitemap(): MetadataRoute.Sitemap {
  return REGISTRY.filter((r) => r.sitemap).map((r) => ({ url: new URL(r.path, publicEnv.siteUrl).href }))
}
