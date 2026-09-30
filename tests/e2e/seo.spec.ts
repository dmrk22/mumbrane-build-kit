import { expect, test } from '@playwright/test'
import { ROUTES as REGISTRY } from '../../src/content/routes.ts'
import { ROUTES } from './utils.ts'

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
      await page.goto(route)
      const entry = REGISTRY.find((r) => r.path === route)
      await expect(page).toHaveTitle(
        route === '/' ? 'Mumbrane — Intelligence for closed worlds' : `${entry?.title} — Mumbrane`,
      )
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        entry?.description ?? '',
      )
      // Next writes the root canonical without its trailing slash; compare parsed URLs.
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(new URL(canonical ?? '').href).toBe(new URL(route, SITE).href)
      await expect(page.locator('h1')).toHaveCount(1)
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
