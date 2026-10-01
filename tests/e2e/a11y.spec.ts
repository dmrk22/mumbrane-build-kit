import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { MISSING, ROUTES, settled, visit } from './utils.ts'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']

test.describe('@a11y', () => {
  for (const route of [...ROUTES, MISSING]) {
    test(`axe finds no violations on ${route}`, async ({ page }) => {
      await page.goto(visit(route))
      await settled(page)
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual(
        [],
      )
    })
  }

  // @smoke, so WebKit runs it too: an icon-only button is named by the icon's aria-label, which
  // WebKit honours (it ignored the SVG <title> the icons used to carry).
  for (const route of ['/moth', '/console/settings']) {
    test(`@smoke icon-only buttons have a name in every engine on ${route}`, async ({ page }) => {
      await page.goto(route)
      await settled(page)
      const { violations } = await new AxeBuilder({ page }).withRules(['button-name']).analyze()
      expect(violations.flatMap((v) => v.nodes.map((n) => n.target.join(' ')))).toEqual([])
    })
  }

  test('forced colors: the decorative membrane canvas steps aside for system colours', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await page.goto('/')
    await expect(page.locator('canvas.membrane-canvas')).toBeHidden()
  })

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

  // QUALITY §3.2: every element reached by Tab shows a visible focus indicator — the viewport
  // differs between focused and blurred. Site chrome is the same everywhere, so it is checked on
  // the 404 page; console routes check their own chrome too.
  for (const route of [...ROUTES, MISSING]) {
    test(`every element reached by Tab shows its focus on ${route}`, async ({ page, isMobile }) => {
      test.skip(isMobile, 'keyboard navigation: desktop')
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(visit(route))
      await settled(page)
      const everything = route === MISSING || route.startsWith('/console')
      const unseen: string[] = []
      for (let i = 0; i < 250; i++) {
        await page.keyboard.press('Tab')
        const el = await page.evaluate((everything) => {
          const a = document.activeElement
          if (!(a instanceof HTMLElement) || a === document.body || a.dataset.tabbed) return null
          a.dataset.tabbed = '1'
          const label = (a.getAttribute('aria-label') ?? a.textContent ?? '').trim().slice(0, 40)
          return { name: `${a.tagName.toLowerCase()} "${label}"`, check: everything || !!a.closest('main') }
        }, everything)
        if (!el) break
        if (!el.check) continue
        const focused = await page.screenshot()
        await page.evaluate(() => (document.activeElement as HTMLElement).blur())
        if (focused.equals(await page.screenshot())) unseen.push(el.name)
      }
      expect(unseen).toEqual([])
    })
  }

  test('the skip link moves focus to main', async ({ page }) => {
    await page.goto(MISSING)
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('main#main')).toBeFocused()
  })
})
