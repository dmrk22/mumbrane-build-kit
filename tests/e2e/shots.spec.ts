import { type Page, test } from '@playwright/test'
import { routeDir, WIDTHS } from '../../scripts/shots.ts'

const routes = (process.env.SHOTS_ROUTES ?? '/').split(',').filter(Boolean)

async function settle(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  // Scroll through once so scroll-triggered reveals reach their final state.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.evaluate(() => window.scrollTo(0, 0))
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
      await page.screenshot({ path: `${dir}/${width}.png`, fullPage: true })
    })
  }

  test(`shot ${route} @ 1440 reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(route)
    await settle(page)
    await page.screenshot({ path: `${dir}/1440-reduced.png`, fullPage: true })
  })
}
