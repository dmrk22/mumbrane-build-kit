import type { MetadataRoute } from 'next'
import { ARTICLES, articlePath } from '@/content/articles'
import { REGISTRY } from '@/content/routes'
import { publicEnv } from '@/lib/env'

// Every indexable route in the registry; articles carry their last change (CONTENT §6).
export default function sitemap(): MetadataRoute.Sitemap {
  const changed = new Map<string, string>(
    ARTICLES.map((a) => [articlePath(a), 'updated' in a ? a.updated : a.published]),
  )
  return REGISTRY.filter((r) => r.sitemap).map((r) => {
    const lastModified = changed.get(r.path)
    return { url: new URL(r.path, publicEnv.siteUrl).href, ...(lastModified ? { lastModified } : {}) }
  })
}
