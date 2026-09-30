import { expect, test } from '@playwright/test'
import { prod, ROUTES } from './utils.ts'

// BUILD_PLAN budgets: first-load JS per route (scripts loaded before `load`), compressed.
const KB = 1024
function jsBudget(route: string): number {
  if (route === '/') return 220 * KB
  if (route === '/console' || route.startsWith('/console/')) return 230 * KB
  return 190 * KB
}
const CSS_BUDGET = 60 * KB

test.describe('@perf first-load bytes', () => {
  test.skip(!prod, 'measured on the production server (compression, no dev chunks)')

  for (const route of ROUTES) {
    test(`first-load JS and CSS within budget on ${route}`, async ({ page, browserName, isMobile }) => {
      test.skip(browserName !== 'chromium' || isMobile, 'CDP byte counts: desktop Chromium')
      const cdp = await page.context().newCDPSession(page)
      await cdp.send('Network.enable')
      const types = new Map<string, string>()
      const bytes = { script: 0, stylesheet: 0 }
      const scripts: string[] = []
      let loaded = false
      cdp.on('Network.responseReceived', (e) => types.set(e.requestId, `${e.type}|${e.response.url}`))
      cdp.on('Network.loadingFinished', (e) => {
        if (loaded) return
        const [type, url] = (types.get(e.requestId) ?? '').split('|')
        if (type === 'Script') {
          bytes.script += e.encodedDataLength
          scripts.push(url ?? '')
        } else if (type === 'Stylesheet') bytes.stylesheet += e.encodedDataLength
      })
      await page.goto(route, { waitUntil: 'load' })
      loaded = true
      test.info().annotations.push(
        {
          type: 'first-load JS',
          description: `${(bytes.script / KB).toFixed(1)} KB (${scripts.length} files)`,
        },
        { type: 'CSS', description: `${(bytes.stylesheet / KB).toFixed(1)} KB` },
      )
      expect(bytes.script, `JS on ${route}`).toBeLessThanOrEqual(jsBudget(route))
      expect(bytes.stylesheet, `CSS on ${route}`).toBeLessThanOrEqual(CSS_BUDGET)
    })
  }

  test('motion libraries load after first paint, never before load', async ({
    page,
    browserName,
    isMobile,
  }) => {
    test.skip(browserName !== 'chromium' || isMobile, 'desktop Chromium')
    const early: string[] = []
    let loaded = false
    page.on('response', async (r) => {
      if (loaded || r.request().resourceType() !== 'script') return
      const body = await r.text().catch(() => '')
      // Strings that survive minification only inside the libraries themselves (GSAP's `._gsap`
      // cache, Lenis's `lenis-scrolling` class) — never in our own wrappers.
      if (/\._gsap\b|lenis-scrolling/.test(body)) early.push(r.url())
    })
    await page.goto('/', { waitUntil: 'load' })
    loaded = true
    expect(early).toEqual([])
  })
})
