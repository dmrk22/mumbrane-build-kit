import { expect, test } from '@playwright/test'
import { SECURITY_HEADERS } from '../../src/lib/security/headers.ts'
import { collectConsole, collectViolations, externalRequests, MISSING, prod, ROUTES } from './utils.ts'

const NONCE = /'nonce-([A-Za-z0-9+/]{22}==)'/

function cspOf(headers: Record<string, string>): string {
  const csp = headers['content-security-policy']
  expect(csp, 'CSP header present').toBeTruthy()
  return csp ?? ''
}

function expectStaticHeaders(headers: Record<string, string>, what: string) {
  for (const { key, value } of SECURITY_HEADERS)
    expect(headers[key.toLowerCase()], `${key} on ${what}`).toBe(value)
  expect(headers['x-powered-by'], `X-Powered-By on ${what}`).toBeUndefined()
}

test.describe('@security', () => {
  for (const route of [...ROUTES, MISSING]) {
    test(`CSP, nonce and markup on ${route}`, async ({ request }) => {
      const res = await request.get(route)
      expect(res.status()).toBe(route === MISSING ? 404 : 200)
      const csp = cspOf(res.headers())
      const nonce = NONCE.exec(csp)?.[1]
      expect(nonce, 'nonce in CSP').toBeTruthy()
      for (const part of [
        "'strict-dynamic'",
        "object-src 'none'",
        "base-uri 'none'",
        "frame-ancestors 'none'",
      ]) {
        expect(csp).toContain(part)
      }
      if (prod) {
        expect(csp).not.toContain('unsafe-')
        expect(csp, 'no upgrade over plain-HTTP localhost').not.toContain('upgrade-insecure-requests')
      }

      const html = await res.text()
      const scripts = html.match(/<script\b[^>]*>/g) ?? []
      expect(scripts.length).toBeGreaterThan(0)
      for (const tag of scripts) {
        const ok = tag.includes(`nonce="${nonce}"`) || /type="application\/ld\+json"/.test(tag)
        expect(ok, `script without the response nonce: ${tag}`).toBe(true)
      }
      expect(html, 'no inline style attributes').not.toMatch(/\sstyle="/)
      expect(html, 'no inline event handlers').not.toMatch(/<[^>]+\son[a-z]+=/i)
      expectStaticHeaders(res.headers(), route)
    })

    test(`two requests to ${route} get different nonces`, async ({ request }) => {
      const a = NONCE.exec(cspOf((await request.get(route)).headers()))?.[1]
      const b = NONCE.exec(cspOf((await request.get(route)).headers()))?.[1]
      expect(a).toBeTruthy()
      expect(a).not.toBe(b)
    })
  }

  test('static headers on JS, CSS, public files and a 404', async ({ page, request }) => {
    const assets: string[] = []
    page.on('response', (r) => {
      if (/\/_next\/static\/.+\.(js|css)$/.test(new URL(r.url()).pathname)) assets.push(r.url())
    })
    await page.goto('/')
    const js = assets.find((u) => u.endsWith('.js'))
    const css = assets.find((u) => u.endsWith('.css'))
    expect(js, 'a _next/static JS file').toBeTruthy()
    expect(css, 'a _next/static CSS file').toBeTruthy()
    // /paintings arrives in P5; the icon and security.txt stand in for public images and files.
    for (const url of [js, css, '/icons/icon-192.png', '/.well-known/security.txt', '/robots.txt', MISSING]) {
      const res = await request.get(url ?? '')
      expectStaticHeaders(res.headers(), url ?? '')
    }
  })

  for (const route of ROUTES) {
    test(`no violations, console errors or third-party requests on ${route}`, async ({ page, baseURL }) => {
      const violations = await collectViolations(page)
      const consoleMessages = collectConsole(page)
      const external = externalRequests(page, new URL(baseURL ?? '').origin)
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForLoadState('networkidle')
      expect((await violations()).filter((v) => v.disposition === 'enforce')).toEqual([])
      expect(consoleMessages.filter((m) => m.startsWith('error') || m.startsWith('pageerror'))).toEqual([])
      expect(consoleMessages.filter((m) => m.includes('Permissions-Policy'))).toEqual([])
      expect(external).toEqual([])
    })
  }

  if (prod) {
    test('/lab is not served in production', async ({ request }) => {
      expect((await request.get('/lab')).status()).toBe(404)
    })
  }

  // Next's App Router serialises the request URL into its own router payload
  // (`self.__next_f.push(...)`), JSON- and URL-escaped. That copy is framework state, not markup
  // (D-103): the marker must appear nowhere else, and never unescaped anywhere.
  test('hostile query strings are never reflected', async ({ request }) => {
    const marker = 'zq9hostile'
    const values = [
      `<script>${marker}</script>`,
      `javascript:alert('${marker}')`,
      `${marker}${'a'.repeat(10_000)}`,
    ]
    for (const value of values) {
      const html = await (await request.get(`/?interest=${encodeURIComponent(value)}`)).text()
      // Inside a script only a raw `<` could break out; it must always arrive escaped.
      expect(html).not.toContain(`<script>${marker}`)
      expect(html).not.toContain(`${marker}</script>`)
      const outsideRouterPayload = html.replace(
        /<script nonce="[^"]+">self\.__next_f\.push\(.*?<\/script>/gs,
        '',
      )
      expect(outsideRouterPayload).not.toContain(marker)
    }
  })
})
