import { expect, test } from '@playwright/test'
import { MD_DOCS } from '../../src/content/mdDocs.ts'
import { ogImage } from '../../src/content/og.ts'
import { REGISTRY } from '../../src/content/routes.ts'
import { ROUTES, visit } from './utils.ts'

const SITE = 'https://mumbrane.com'

test.describe('@seo', () => {
  test('robots.txt allows all, keeps /console and /lab out, names the sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.status()).toBe(200)
    const body = await res.text()
    expect(body).toContain('User-Agent: *')
    expect(body).toContain('Allow: /')
    expect(body).toContain('Disallow: /console')
    expect(body).toContain('Disallow: /lab')
    expect(body).toContain(`Sitemap: ${SITE}/sitemap.xml`)
  })

  test('sitemap lists every indexable registry route and no console or lab', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text()
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    const expected = REGISTRY.filter((r) => r.sitemap).map((r) => new URL(r.path, SITE).href)
    expect(urls.sort()).toEqual(expected.sort())
    expect(urls.some((u) => u?.includes('/console') || u?.includes('/lab'))).toBe(false)
  })

  test('manifest is valid JSON with icons that exist', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest')
    expect(res.status()).toBe(200)
    const m = (await res.json()) as { name: string; start_url: string; icons: { src: string }[] }
    expect(m.name).toBe('Mumbrane')
    expect(m.start_url).toBe('/')
    for (const icon of m.icons) expect((await request.get(icon.src)).status(), icon.src).toBe(200)
  })

  test('home carries Organization and WebSite JSON-LD', async ({ page }) => {
    await page.goto('/')
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(blocks).toHaveLength(1)
    const data = JSON.parse(blocks[0] ?? '') as { '@graph': Record<string, unknown>[] }
    const org = data['@graph'].find((n) => n['@type'] === 'Organization')
    const site = data['@graph'].find((n) => n['@type'] === 'WebSite')
    expect(org).toMatchObject({ name: 'Mumbrane', url: `${SITE}/`, logo: `${SITE}/icons/icon-512.png` })
    expect(org?.sameAs).toEqual([
      'https://x.com/mumbrane',
      'https://www.instagram.com/mumbrane/',
      'https://www.linkedin.com/company/mumbrane/',
    ])
    expect(site).toMatchObject({ name: 'Mumbrane', url: `${SITE}/` })
  })

  for (const route of ROUTES) {
    test(`title, description and canonical on ${route}`, async ({ page }) => {
      await page.goto(visit(route))
      const entry = REGISTRY.find((r) => r.path === route)
      await expect(page).toHaveTitle(
        route === '/' ? 'Mumbrane — Field-based intelligence' : `${entry?.title} — Mumbrane`,
      )
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        entry?.description ?? '',
      )
      // Next writes the root canonical without its trailing slash; compare parsed URLs.
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(new URL(canonical ?? '').href).toBe(new URL(route, SITE).href)
      await expect(page.locator('h1')).toHaveCount(1)
      // Its family's social card (CONTENT §6), and the card exists.
      const card = ogImage(route)
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${SITE}${card}`)
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', `${SITE}${card}`)
      const image = await page.request.get(card)
      expect(image.status(), card).toBe(200)
      expect(image.headers()['content-type']).toBe('image/png')
    })
  }

  const redirects: [from: string, to: string, status: number][] = [
    ['/releases', '/moth#evidence', 308],
    ['/privacy', '/legal/privacy', 308],
    ['/terms', '/legal/terms', 308],
    ['/login', '/console', 307],
    ['/research.md', '/md/research', 308],
    ['/news/introducing-moth-preview-004.md', '/md/news/introducing-moth-preview-004', 308],
  ]
  for (const [from, to, status] of redirects) {
    test(`legacy ${from} redirects to ${to}`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 })
      expect(res.status()).toBe(status)
      expect(res.headers().location).toBe(to)
    })
  }
})

test.describe('@seo articles and markdown alternates', () => {
  for (const [path, title] of [
    ['/research/toward-field-based-intelligence', 'Towards field-based intelligence'],
    ['/news/introducing-moth-preview-004', 'Introducing Moth Preview 004'],
  ] as const) {
    test(`${path}: markdown alternate linked, served as text/markdown, noindex`, async ({
      page,
      request,
    }) => {
      await page.goto(path)
      const alt = await page.locator('link[rel="alternate"][type="text/markdown"]').getAttribute('href')
      expect(alt).toBe(`${SITE}/md${path}`)
      const res = await request.get(`/md${path}`)
      expect(res.status()).toBe(200)
      expect(res.headers()['content-type']).toBe('text/markdown; charset=utf-8')
      expect(res.headers()['x-robots-tag']).toBe('noindex')
      const md = await res.text()
      expect(md.startsWith('---\ntitle: ')).toBe(true)
      expect(md).toContain(`# ${title}`)
      expect(md).not.toMatch(/<(?!\/)[a-z]/i)
      const jsonLd = JSON.parse(
        (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}',
      )
      expect(jsonLd['@type']).toBe('Article')
    })
  }

  test('unknown slugs and markdown paths are 404; a slug under the wrong section is 404', async ({
    request,
  }) => {
    expect((await request.get('/research/not-a-real-article')).status()).toBe(404)
    expect((await request.get('/news/toward-field-based-intelligence')).status()).toBe(404)
    const md = await request.get('/md/research/not-a-real-article')
    expect(md.status()).toBe(404)
    expect(md.headers()['content-type']).toContain('text/plain')
  })

  test('sitemap gives articles their last change', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text()
    expect(xml).toMatch(
      /<loc>https:\/\/mumbrane\.com\/research\/toward-field-based-intelligence<\/loc>\s*<lastmod>2026-10-01/,
    )
  })
})

test.describe('@seo llms.txt and markdown documents (CONTENT §6)', () => {
  test('llms.txt lists every markdown document; each is markdown whose canonical page exists', async ({
    request,
  }) => {
    const res = await request.get('/llms.txt')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toBe('text/plain; charset=utf-8')
    const body = await res.text()
    expect(body.startsWith('# Mumbrane\n\n> ')).toBe(true)
    expect(body).toContain('\n## Core pages\n')
    expect(body).toContain('\n## Publications\n')
    const links = [...body.matchAll(/\]\((https:\/\/mumbrane\.com\/md\/[^)]+)\)/g)].map((m) => m[1] ?? '')
    expect(links).toHaveLength(MD_DOCS.length)
    for (const key of [
      'index',
      'moth',
      'research',
      'news',
      'contact',
      'changelog',
      'legal/terms',
      'legal/privacy',
    ])
      expect(links).toContain(`${SITE}/md/${key}`)
    for (const href of links) {
      const md = await request.get(new URL(href).pathname)
      expect(md.status(), href).toBe(200)
      expect(md.headers()['content-type']).toBe('text/markdown; charset=utf-8')
      expect(md.headers()['x-robots-tag']).toBe('noindex')
      const text = await md.text()
      expect(text, href).not.toMatch(/<(?!\/)[a-z]/i)
      const canonical = text.match(/^canonical: "([^"]+)"$/m)?.[1] ?? ''
      expect((await request.get(new URL(canonical).pathname)).status(), canonical).toBe(200)
    }
  })
})
