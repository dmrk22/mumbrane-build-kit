import type { MetadataRoute } from 'next'
import { publicEnv } from '@/lib/env'

// CONTENT §6: allow all, keep the console preview and the lab out; /md/* stays readable.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/console', '/lab'] }],
    sitemap: new URL('/sitemap.xml', publicEnv.siteUrl).href,
  }
}
