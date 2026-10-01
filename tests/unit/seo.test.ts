import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { test } from 'node:test'
import { DEFAULT_OG, OG_CARDS, ogImage } from '../../src/content/og.ts'
import { REGISTRY, ROUTES } from '../../src/content/routes.ts'
import { fullTitle, pageMetadata, routeMetadata } from '../../src/lib/seo.ts'

test('pageMetadata builds canonical, Open Graph and Twitter from the site URL', () => {
  const m = pageMetadata({ title: 'Moth', description: 'D', path: '/moth' })
  assert.equal(m.title, 'Moth')
  assert.deepEqual(m.alternates, { canonical: 'https://mumbrane.com/moth' })
  const og = m.openGraph as {
    url: string
    title: string
    images: { url: string; width: number; height: number }[]
  }
  assert.equal(og.url, 'https://mumbrane.com/moth')
  assert.equal(og.title, 'Moth — Mumbrane')
  assert.deepEqual(og.images[0], {
    url: 'https://mumbrane.com/og/moth.png',
    width: 1200,
    height: 630,
    alt: 'Moth — Mumbrane',
  })
  const tw = m.twitter as { card: string; images: string[] }
  assert.equal(tw.card, 'summary_large_image')
  assert.deepEqual(tw.images, ['https://mumbrane.com/og/moth.png'])
  assert.equal(m.robots, undefined)
})

test('every route shares a card that exists: its family by prefix, articles their own', () => {
  const families = new Set(OG_CARDS.map((c) => c.family))
  assert.equal(families.size, OG_CARDS.length, 'families unique')
  // The default card is the brand's own file; pnpm og must never overwrite it (brand.test.ts).
  assert.ok(!families.has('default'))
  for (const r of REGISTRY) {
    const image = ogImage(r.path)
    const family = image.slice('/og/'.length, -'.png'.length)
    assert.ok(image === DEFAULT_OG || families.has(family), `${r.path} → ${image}`)
    assert.ok(existsSync(`public${image}`), `${image} exists (pnpm og)`)
  }
  assert.equal(ogImage('/'), DEFAULT_OG)
  assert.equal(ogImage('/developers/models'), '/og/moth.png')
  assert.equal(ogImage('/developers/docs'), '/og/developers.png')
  assert.equal(ogImage('/research'), '/og/research.png')
  assert.equal(
    ogImage('/research/toward-field-based-intelligence'),
    '/og/research-toward-field-based-intelligence.png',
  )
  assert.equal(ogImage('/legal/terms'), '/og/legal.png')
  assert.equal(ogImage('/console/keys'), '/og/default.png')
  assert.equal(ogImage('/mothy'), '/og/default.png')
})

test('home uses the absolute site title; noindex routes say so', () => {
  const home = routeMetadata('/')
  assert.deepEqual(home.title, { absolute: 'Mumbrane — Field-based intelligence' })
  assert.deepEqual(routeMetadata('/console').robots, { index: false, follow: false })
  assert.equal(routeMetadata('/moth', '/og/moth.png').twitter && 'ok', 'ok')
})

test('every registered route: title ≤ 60, description ≤ 160, unique paths', () => {
  const paths = new Set<string>()
  for (const r of ROUTES) {
    assert.ok(!paths.has(r.path), `duplicate ${r.path}`)
    paths.add(r.path)
    assert.ok(fullTitle(r.title, r.path).length <= 60, `${r.path} title`)
    assert.ok(
      r.description.length > 0 && r.description.length <= 160,
      `${r.path} description ${r.description.length}`,
    )
    assert.equal(routeMetadata(r.path).description, r.description)
  }
})

test('console routes are noindex and out of the sitemap; everything else is indexable', () => {
  for (const r of ROUTES) {
    const isConsole = r.path === '/console' || r.path.startsWith('/console/')
    assert.equal(r.sitemap, !isConsole, r.path)
    assert.equal('noindex' in r && r.noindex === true, isConsole, r.path)
  }
})

test('article routes join the registry within the same limits, once each', async () => {
  const { ARTICLE_ROUTES, REGISTRY } = await import('../../src/content/routes.ts')
  assert.equal(ARTICLE_ROUTES.length, 4)
  assert.equal(new Set(REGISTRY.map((r) => r.path)).size, REGISTRY.length)
  for (const r of ARTICLE_ROUTES) {
    assert.match(r.path, /^\/(research|news)\/[a-z0-9-]+$/)
    assert.ok(fullTitle(r.title, r.path).length <= 60, r.path)
    assert.ok(r.description.length <= 160, r.path)
  }
})

test('article metadata: OG article with dates, markdown alternate, JSON-LD', async () => {
  const { articleJsonLd, articleMetadata } = await import('../../src/lib/seo.ts')
  const { ARTICLES } = await import('../../src/content/articles.ts')
  const a = ARTICLES[0]
  const m = articleMetadata(a)
  assert.deepEqual(m.alternates, {
    canonical: 'https://mumbrane.com/research/toward-field-based-intelligence',
    types: { 'text/markdown': 'https://mumbrane.com/md/research/toward-field-based-intelligence' },
  })
  const og = m.openGraph as { type: string; publishedTime: string; modifiedTime: string }
  assert.equal(og.type, 'article')
  assert.equal(og.publishedTime, '2026-09-16')
  assert.equal(og.modifiedTime, '2026-10-01')
  const ld = articleJsonLd(a)
  assert.equal(ld.headline, a.title)
  assert.equal(ld.dateModified, '2026-10-01')
  assert.equal(ld.image, 'https://mumbrane.com/paintings/plate-field-1600.webp')
  assert.deepEqual(ld.author, { '@type': 'Organization', name: 'Mumbrane Labs' })
})
