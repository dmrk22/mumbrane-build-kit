import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { MISSING, ROUTES, settled } from './utils.ts'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']

test.describe('@a11y', () => {
  for (const route of [...ROUTES, MISSING]) {
    test(`axe finds no violations on ${route}`, async ({ page }) => {
      await page.goto(route)
      await settled(page)
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual(
        [],
      )
    })
  }

  test('axe is clean with a mega menu open', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop navigation')
    await page.goto(MISSING)
    await page.getByRole('button', { name: 'Developer' }).click()
    await expect(page.locator('#menu-developer')).toBeVisible()
    await settled(page)
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
    expect(violations.map((v) => v.id)).toEqual([])
  })

  test('axe is clean with the mobile sheet open', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(MISSING)
    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(page.locator('dialog#mobile-nav')).toBeVisible()
    await settled(page)
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
    expect(violations.map((v) => v.id)).toEqual([])
  })

  test('the skip link moves focus to main', async ({ page }) => {
    await page.goto(MISSING)
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('main#main')).toBeFocused()
  })
})
