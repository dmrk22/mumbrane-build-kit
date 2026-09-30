import { type Page, test } from '@playwright/test'
import { routeDir, WIDTHS } from '../../scripts/shots.ts'

const routes = (process.env.SHOTS_ROUTES ?? '/').split(',').filter(Boolean)

// A full-page capture grows the viewport to the page height, so no scrollbar fills the reserved
// `scrollbar-gutter`; it would show as a strip of the root background along the right edge.
const FULL = { fullPage: true, style: 'html { scrollbar-gutter: auto; }' }

async function settle(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  // Scroll through a viewport at a time, as a reader would, so every scroll-triggered reveal sees
  // its box on screen (a jump to the bottom skips the ones in between).
  await page.evaluate(async () => {
    const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.7) {
      window.scrollTo(0, y)
      await frames()
    }
    window.scrollTo(0, 0)
    await frames()
  })
  // Documented exception (QUALITY §2): let motion settle before capturing.
  await page.waitForTimeout(1000)
}

for (const route of routes) {
  const dir = `.shots/${routeDir(route)}`

  for (const width of WIDTHS) {
    test(`shot ${route} @ ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(route)
      await settle(page)
      await page.screenshot({ path: `${dir}/${width}.png`, ...FULL })
    })
  }

  test(`shot ${route} @ 1440 reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(route)
    await settle(page)
    await page.screenshot({ path: `${dir}/1440-reduced.png`, ...FULL })
  })
}
