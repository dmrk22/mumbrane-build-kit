import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ROUTES } from '../../src/content/routes.ts'
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
    url: 'https://mumbrane.com/og/default.png',
    width: 1200,
    height: 630,
    alt: 'Moth — Mumbrane',
  })
  const tw = m.twitter as { card: string; images: string[] }
  assert.equal(tw.card, 'summary_large_image')
  assert.deepEqual(tw.images, ['https://mumbrane.com/og/default.png'])
  assert.equal(m.robots, undefined)
})

test('home uses the absolute site title; noindex routes say so', () => {
  const home = routeMetadata('/')
  assert.deepEqual(home.title, { absolute: 'Mumbrane — Intelligence for closed worlds' })
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
