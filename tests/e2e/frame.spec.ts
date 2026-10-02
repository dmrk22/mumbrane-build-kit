import { expect, type Page, test } from '@playwright/test'
import { MISSING, ROUTES, visit } from './utils.ts'

// D-142/D-144: every page sits in anthropic.com's frame, centred in the layout width W:
// min(W, min(1432, 100vw) − 2 × edge), the edge rising linearly from 32 px at 375 to 80 px at
// 1600. Nothing readable leaves it. Full-bleed art (SVG drawings, the research painting) is not
// text, so the text check below skips SVG. The console is an app shell with its own layout.
const LU = 1 / 64 // Chromium's layout unit

// Real scrollbars, so the classic-scrollbar tests below can show one. Every check reads the layout
// width W and 100vw separately, so it holds with or without one.
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } })

async function frame(page: Page) {
  return page.evaluate(() => {
    const W = document.documentElement.clientWidth
    const vw = window.innerWidth
    const edge = Math.min(80, Math.max(32, 32 + ((vw - 375) * 3) / 76.5625))
    const C = Math.min(W, Math.min(1432, vw) - 2 * edge)
    const L = (W - C) / 2
    const frames = [...document.querySelectorAll('.max-w-site')]
      .map((e) => e.getBoundingClientRect())
      .filter((b) => b.width > 0)
      .map((b) => `${b.left}/${b.width}`)
    const outside: string[] = []
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const el = n.parentElement
      const text = n.textContent?.trim()
      if (!el || !text || el.closest('.sr-only, svg, dialog:not([open])')) continue
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue
      // Display headings hang 0.04em left (optical alignment, globals.css). Right: under 1 px is
      // allowed for one known case, /careers' "intelligence" at exactly 320 px (0.78 px of advance,
      // 0.43 px of ink; D-144, open).
      const hang = Number.parseFloat(getComputedStyle(el).fontSize) * 0.05
      const range = document.createRange()
      range.selectNodeContents(n)
      for (const r of range.getClientRects()) {
        let [left, right] = [r.left, r.right]
        for (let a: Element | null = el; a; a = a.parentElement) {
          if (getComputedStyle(a).overflowX === 'visible') continue
          const b = a.getBoundingClientRect()
          left = Math.max(left, b.left)
          right = Math.min(right, b.right)
        }
        // A 1 px clip window is the visually-hidden pattern (the forms' off-screen honeypot).
        if (right - left > 1 && (left < L - hang || right > L + C + 1))
          outside.push(`${text.slice(0, 30)}: ${left.toFixed(1)}–${right.toFixed(1)}`)
      }
    }
    const icons = [...document.querySelectorAll('header .max-w-site svg')]
      .map((s) => s.getBoundingClientRect())
      .filter((b) => b.width > 0)
    return { W, L, C, R: L + C, frames, outside, headerRight: Math.max(...icons.map((b) => b.right)) }
  })
}

test.describe('frame', () => {
  test.use({ reducedMotion: 'reduce' })
  for (const route of [...ROUTES.filter((r) => !r.startsWith('/console')), MISSING]) {
    test(`content stays in the frame on ${route}`, async ({ page, isMobile }) => {
      // 320: the narrowest frame (256 px); 1920: wider than the 1432 px cap.
      for (const width of isMobile ? [320, 390] : [1440, 1920]) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(visit(route))
        const f = await frame(page)
        // Every frame identical to the layout unit (regression: a flex parent put one 1/128 px off).
        expect(new Set(f.frames).size, `${width}: ${f.frames.join(', ')}`).toBe(1)
        const [left, w] = (f.frames[0] ?? '').split('/').map(Number)
        expect(Math.abs((left ?? 0) - f.L), `${width}: left`).toBeLessThan(LU)
        expect(Math.abs((w ?? 0) - f.C), `${width}: width`).toBeLessThan(LU)
        expect(f.outside, `${width}`).toEqual([])
        expect(f.headerRight, `${width}: header icons`).toBeLessThanOrEqual(f.R + 0.5)
      }
    })
  }
})

// Regression: the caption and the keyboard "drop" chip were inset from the viewport edge, not the
// frame, so above 1432 px they sat up to 540 px outside it.
test('the hero caption and drop chip end on the frame’s right edge at 1920 px', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'desktop layer')
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/')
  const f = await frame(page)
  const caption = await page.locator('section.hero figcaption').boundingBox()
  const chip = await page.locator('section.hero .field > button').boundingBox()
  expect(Math.abs((caption?.x ?? 0) + (caption?.width ?? 0) - f.R)).toBeLessThan(LU)
  expect(Math.abs((chip?.x ?? 0) + (chip?.width ?? 0) - f.R)).toBeLessThan(LU)
})

// Beside a classic scrollbar (Windows, Linux, a Mac with a mouse) the frame stays 100vw-based like
// anthropic.com's, so its box is theirs, not one narrowed by the scrollbar (regression: 7 px).
test.describe('beside a classic scrollbar', () => {
  // The injected scrollbar style is test scaffolding, not page CSS, so it needs the CSP lifted.
  test.use({ bypassCSP: true, reducedMotion: 'reduce' })
  test.skip(
    ({ browserName, isMobile }) => browserName !== 'chromium' || isMobile,
    'Chromium scrollbar styling',
  )
  // A styled scrollbar takes layout space like Windows' does. `overflow-y: scroll` keeps it while
  // the menu sheet locks scrolling, as `scrollbar-gutter: stable` holds a native one's gutter.
  const scrollbar = async (page: Page) => {
    await page.addStyleTag({
      content: '::-webkit-scrollbar { width: 15px; background: #eee } html { overflow-y: scroll !important }',
    })
  }

  test('the frame is anthropic.com’s measured box at 1440 px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await scrollbar(page)
    const f = await frame(page)
    expect(f.W).toBe(1425)
    const [left, width] = (f.frames[0] ?? '').split('/').map(Number)
    expect(Math.abs((left ?? 0) - 70.234375)).toBeLessThan(LU)
    expect(Math.abs((width ?? 0) - 1284.53125)).toBeLessThan(LU)
    const caption = await page.locator('section.hero figcaption').boundingBox()
    expect(Math.abs((caption?.x ?? 0) + (caption?.width ?? 0) - f.R)).toBeLessThan(LU)
  })

  test('the menu sheet opens on the header’s frame at 900 px', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 900 })
    await page.goto('/')
    await scrollbar(page)
    expect((await frame(page)).W).toBe(885)
    const logo = await page.locator('header a svg').first().boundingBox()
    const menu = await page.locator('button[aria-controls="mobile-nav"] svg').boundingBox()
    await page.locator('button[aria-controls="mobile-nav"]').click()
    const sheet = page.locator('#mobile-nav')
    const sheetLogo = await sheet.locator('a svg').first().boundingBox()
    const close = await sheet.locator('button svg').first().boundingBox()
    // Auto margins place the header's frame, a calc() padding the sheet's: equal to a layout unit.
    expect(Math.abs((sheetLogo?.x ?? 0) - (logo?.x ?? 0))).toBeLessThanOrEqual(LU)
    const right = (b: typeof close) => (b?.x ?? 0) + (b?.width ?? 0)
    expect(Math.abs(right(close) - right(menu))).toBeLessThanOrEqual(LU)
  })
})
