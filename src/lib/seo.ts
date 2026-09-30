// Page metadata (CONTENT §6). Canonical and social URLs are absolute on publicEnv.siteUrl.
import type { Metadata } from 'next'
import { type RoutePath, routeFor } from '../content/routes.ts'
import { site } from '../content/site.ts'
import { SOCIAL } from '../content/social.ts'
import { publicEnv } from './env.ts'

export type PageMeta = {
  title: string
  description: string
  path: `/${string}`
  /** A generated card under /og (P13); every family falls back to the default card. */
  ogImage?: `/og/${string}.png`
  noindex?: boolean
}

/** The title a browser tab and a social card show: the home title, or "<title> — Mumbrane". */
export function fullTitle(title: string, path: string): string {
  return path === '/' ? site.title : site.titleTemplate.replace('%s', title)
}

export function pageMetadata({
  title,
  description,
  path,
  ogImage = '/og/default.png',
  noindex = false,
}: PageMeta): Metadata {
  const url = new URL(path, publicEnv.siteUrl).href
  const shown = fullTitle(title, path)
  const image = { url: new URL(ogImage, publicEnv.siteUrl).href, width: 1200, height: 630, alt: shown }
  return {
    // The root layout's template adds " — Mumbrane"; the home page opts out with an absolute title.
    title: path === '/' ? { absolute: site.title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: site.name,
      locale: 'en_US',
      title: shown,
      description,
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: shown, description, images: [image.url] },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  }
}

/** Metadata for a registered route, straight from the registry. */
export function routeMetadata(path: RoutePath, ogImage?: PageMeta['ogImage']): Metadata {
  const { title, description, noindex } = routeFor(path)
  return pageMetadata({
    title,
    description,
    path,
    noindex: noindex ?? false,
    ...(ogImage ? { ogImage } : {}),
  })
}

/** Organization + WebSite structured data for `/` (CONTENT §6). Built only from typed content. */
export function homeJsonLd() {
  const url = publicEnv.siteUrl.href
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${url}#organization`,
        name: site.name,
        url,
        logo: new URL('/icons/icon-512.png', publicEnv.siteUrl).href,
        sameAs: SOCIAL.map((s) => s.href),
      },
      {
        '@type': 'WebSite',
        '@id': `${url}#website`,
        name: site.name,
        url,
        description: site.description,
        publisher: { '@id': `${url}#organization` },
      },
    ],
  }
}
