import { expect, test } from '@playwright/test'
import { OG_CARDS } from '../../src/content/og.ts'

// `pnpm og` (BUILD_PLAN P13): every social card family at 1200 × 630 into public/og/<family>.png,
// with the real fonts and painting loaded. Runs on the dev server: /lab/og is development only.
for (const { family } of OG_CARDS) {
  test(`og card: ${family}`, async ({ page }) => {
    await page.goto(`/lab/og/${family}`)
    const card = page.locator('[data-og-card]')
    await expect(card).toHaveCount(1)
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all([...document.images].map((img) => img.decode()))
    })
    expect(await card.boundingBox()).toEqual({ x: 0, y: 0, width: 1200, height: 630 })
    await card.screenshot({ path: `public/og/${family}.png`, animations: 'disabled' })
  })
}
