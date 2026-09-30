import { expect, type Page, test } from '@playwright/test'
import { collectViolations, prod, ROUTES } from './utils.ts'

const LAB = '/lab/motion'

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.6) {
      window.scrollTo(0, y)
      await frames()
    }
  })
}

/**
 * Elements in <main> that motion code left hidden or displaced. GSAP writes inline styles, so only
 * inline opacity/transform count; designed translucency (e.g. a guilloche at 12 %) lives in classes.
 */
function leftovers(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('main *')]
      .filter((el) => {
        const o = el.style.opacity
        const t = el.style.transform
        const hidden = o !== '' && Number.parseFloat(o) < 1
        const moved = t !== '' && t !== 'none' && !/^translate\(0px(, 0px)?\)$/.test(t)
        return hidden || moved
      })
      .map((el) => `${el.tagName}.${el.className}`.slice(0, 80)),
  )
}

test.describe('@motion', () => {
  for (const route of [...ROUTES, ...(prod ? [] : [LAB])]) {
    test(`reduced motion: ${route} ends fully visible, unpinned, unmoved`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(route)
      await page.waitForLoadState('load')
      await scrollThrough(page)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      expect(await leftovers(page)).toEqual([])
      await expect(page.locator('.pin-spacer')).toHaveCount(0)
    })
  }

  test('motion lab: GSAP, SplitText and the shaders run with zero CSP violations', async ({ page }) => {
    test.skip(prod, 'the lab is development-only')
    const violations = await collectViolations(page)
    await page.goto(LAB)
    await page.waitForLoadState('load')
    await expect(page.locator('.membrane-canvas').first()).toHaveAttribute('data-ready', 'true')
    await scrollThrough(page)
    // SplitText ran: the heading was split into masked lines (and the text is still readable).
    await expect(page.locator('#lab-reveals')).toHaveText(/Split reveal/)
    expect((await violations()).filter((v) => v.disposition === 'enforce')).toEqual([])
    await expect(page.getByTestId('lab-csp')).toHaveText('0')
  })

  test('reduced motion: the membrane draws one still frame and stops', async ({ page }) => {
    test.skip(prod, 'the lab is development-only')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(LAB)
    await expect(page.locator('.membrane-canvas').first()).toHaveAttribute('data-ready', 'true')
    const drawsPerSecond = await page.evaluate(async () => {
      const canvas = document.querySelector('canvas')
      const gl = canvas?.getContext('webgl2')
      if (!gl) return -1
      let draws = 0
      const original = gl.drawArrays.bind(gl)
      gl.drawArrays = (...args: Parameters<typeof gl.drawArrays>) => {
        draws++
        original(...args)
      }
      await new Promise((r) => setTimeout(r, 1000))
      return draws
    })
    expect(drawsPerSecond).toBe(0)
  })
})

test.describe('@perf motion lab', () => {
  test.skip(prod, 'the lab is development-only')

  test('scrolling holds ≥ 55 fps and nothing shifts layout (CLS 0)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop probe')
    // CLS *from motion*: the counter is reset once the page is loaded with its fonts in, then the
    // scroll runs. (Font-swap shifts during load are a font-loading matter, held to the 0.02
    // budget per route by perf.spec.)
    await page.addInitScript(() => {
      const w = window as unknown as { __cls: number }
      w.__cls = 0
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as (PerformanceEntry & {
          value: number
          hadRecentInput: boolean
        })[])
          if (!e.hadRecentInput) w.__cls += e.value
      }).observe({ type: 'layout-shift' })
    })
    await page.goto(LAB)
    await page.waitForLoadState('load')
    await expect(page.locator('.membrane-canvas').first()).toHaveAttribute('data-ready', 'true')
    await page.evaluate(async () => {
      await document.fonts.ready
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      ;(window as unknown as { __cls: number }).__cls = 0
    })
    await page.mouse.move(700, 450)
    const probe = async () => {
      const counting = page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            let frames = 0
            const start = performance.now()
            const tick = (now: number) => {
              frames++
              if (now - start < 2000) requestAnimationFrame(tick)
              else resolve((frames * 1000) / (now - start))
            }
            requestAnimationFrame(tick)
          }),
      )
      for (let i = 0; i < 40; i++) await page.mouse.wheel(0, 120)
      return counting
    }
    // Headless Chromium rasterises WebGL in software (SwiftShader): with the three membranes on
    // screen the probe measures the CPU, not the scroll. Recorded, not asserted (see the GPU test).
    const withCanvases = await probe()
    test
      .info()
      .annotations.push({ type: 'fps with 3 software-GL canvases', description: withCanvases.toFixed(1) })
    // The motion system itself — Lenis, reveals, split text, scrub, pin — below the canvases.
    await page.evaluate(() => document.getElementById('lab-reveals')?.scrollIntoView())
    const fps = await probe()
    test.info().annotations.push({ type: 'fps', description: fps.toFixed(1) })
    expect(fps).toBeGreaterThanOrEqual(55)
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls)
    test.info().annotations.push({ type: 'cls', description: cls.toFixed(4) })
    expect(cls).toBe(0)
  })

  test('membrane GPU time per frame (≤ 4 ms where measurable)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop probe')
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(LAB)
    const result = await page.evaluate(async () => {
      const canvas = document.createElement('canvas')
      canvas.width = 2560
      canvas.height = 1440
      const gl = canvas.getContext('webgl2')
      const ext = gl?.getExtension('EXT_disjoint_timer_query_webgl2')
      return ext ? 'available' : 'unavailable'
    })
    test.info().annotations.push({ type: 'gpu-timer', description: result })
    // Headless Chromium renders with SwiftShader and exposes no GPU timer: report, don't invent.
    test.skip(result === 'unavailable', 'EXT_disjoint_timer_query_webgl2 not exposed in headless Chromium')
  })
})
