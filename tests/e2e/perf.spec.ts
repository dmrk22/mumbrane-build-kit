import { expect, test } from '@playwright/test'
import { prod, ROUTES, visit } from './utils.ts'

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
    test(`first-load JS and CSS within budget on ${route}`, async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'CDP byte counts: desktop Chromium')
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
      await page.goto(visit(route), { waitUntil: 'load' })
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

  test('motion libraries load after first paint, never before load', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'desktop Chromium')
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

// QUALITY §4: mobile emulation, CPU 4×, Fast 4G. Routes named in QUALITY §3.2 as they are built.
const VITALS_ROUTES = ['/', '/moth', '/research', '/company', '/console/playground'].filter((r) =>
  (ROUTES as readonly string[]).includes(r),
)

test.describe('@perf core web vitals (mobile emulation)', () => {
  test.skip(!prod, 'measured on the production server')

  for (const route of VITALS_ROUTES) {
    test(`LCP ≤ 2.0 s, CLS ≤ 0.02, no long task > 200 ms after load on ${route}`, async ({
      browser,
      browserName,
    }) => {
      test.skip(browserName !== 'chromium', 'CDP throttling: Chromium')
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      })
      const page = await context.newPage()
      const cdp = await context.newCDPSession(page)
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
      await cdp.send('Network.enable')
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 150,
        downloadThroughput: (1.6 * 1024 * 1024) / 8,
        uploadThroughput: (750 * 1024) / 8,
      })
      await page.addInitScript(() => {
        const w = window as unknown as { __v: { lcp: number; lcpTag: string; cls: number; long: number[] } }
        w.__v = { lcp: 0, lcpTag: '', cls: 0, long: [] }
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as (PerformanceEntry & { element?: Element })[]) {
            w.__v.lcp = e.startTime
            w.__v.lcpTag = e.element?.tagName ?? ''
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true })
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as (PerformanceEntry & {
            value: number
            hadRecentInput: boolean
          })[])
            if (!e.hadRecentInput) w.__v.cls += e.value
        }).observe({ type: 'layout-shift', buffered: true })
        let loaded = false
        window.addEventListener('load', () => {
          loaded = true
        })
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) if (loaded) w.__v.long.push(e.duration)
        }).observe({ type: 'longtask', buffered: true })
      })
      await page.goto(visit(route), { waitUntil: 'load' })
      // Observe 3 s of after-load work (idle callback → motion libraries → reveals attach → the
      // membrane running): long tasks there are what INP would feel.
      await page.evaluate(() => new Promise((r) => setTimeout(r, 3000)))
      const v = await page.evaluate(
        () =>
          (window as unknown as { __v: { lcp: number; lcpTag: string; cls: number; long: number[] } }).__v,
      )
      test
        .info()
        .annotations.push(
          { type: 'LCP', description: `${Math.round(v.lcp)} ms (${v.lcpTag})` },
          { type: 'CLS', description: v.cls.toFixed(4) },
          { type: 'long tasks after load', description: v.long.map(Math.round).join(', ') || 'none' },
        )
      expect(v.lcp).toBeLessThanOrEqual(2000)
      // At 390 px the H1 and the lede are near-equal text boxes (D-112): either is fine, as long as
      // the LCP is hero text — never the canvas or the poster image. Desktop asserts the H1 below.
      if (route === '/') expect(['H1', 'P']).toContain(v.lcpTag)
      expect(v.cls).toBeLessThanOrEqual(0.02)
      expect(Math.max(0, ...v.long)).toBeLessThanOrEqual(200)
      await context.close()
    })
  }
})

test.describe('@perf LCP element (desktop)', () => {
  test.skip(!prod, 'measured on the production server')

  test('the home H1 is the largest contentful paint at 1440 × 900', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'desktop Chromium')
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.addInitScript(() => {
      const w = window as unknown as { __lcp: string }
      w.__lcp = ''
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as (PerformanceEntry & { element?: Element })[])
          w.__lcp = e.element?.closest('h1') ? 'H1' : (e.element?.tagName ?? '')
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    })
    await page.goto('/', { waitUntil: 'load' })
    await page.evaluate(() => new Promise((r) => setTimeout(r, 1500)))
    expect(await page.evaluate(() => (window as unknown as { __lcp: string }).__lcp)).toBe('H1')
  })
})
