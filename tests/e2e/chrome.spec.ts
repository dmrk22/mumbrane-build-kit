import { expect, test } from '@playwright/test'
import { MISSING, ROUTES } from './utils.ts'

const header = 'header[data-collapsed]'

test.describe('@smoke layout', () => {
  // DESIGN §4.4: nothing may overflow horizontally at 320 px. (Regression: a `hidden` class lost to
  // Button's own `inline-flex` and pushed the 375 px header to 453 px.)
  for (const route of [...ROUTES, MISSING]) {
    test(`no horizontal overflow at 320 px on ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 })
      await page.goto(route)
      const width = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(width).toBeLessThanOrEqual(320)
    })
  }
})

test.describe('@motion header collapse', () => {
  test('collapses after 80 px, stays collapsed until back above 24 px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 400 })
    await page.goto(MISSING)
    const h = page.locator(header)
    await expect(h).toHaveAttribute('data-collapsed', 'false')
    await page.evaluate(() => window.scrollTo(0, 200))
    await expect(h).toHaveAttribute('data-collapsed', 'true')
    await expect(h).toHaveAttribute('data-scrolled', 'true')
    await page.evaluate(() => window.scrollTo(0, 50)) // between 24 and 80: hysteresis holds
    await page.waitForTimeout(150) // no event is expected; give a wrong one time to arrive
    await expect(h).toHaveAttribute('data-collapsed', 'true')
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(h).toHaveAttribute('data-collapsed', 'false')
    await expect(h).toHaveAttribute('data-scrolled', 'false')
  })

  test('reduced motion swaps the letters instantly', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(MISSING)
    const durations = await page.evaluate(() => {
      const letter = document.querySelector('header .lockup-collapsible .mb-letter')
      if (!letter) return null
      const cs = getComputedStyle(letter)
      return { duration: cs.transitionDuration, delay: cs.transitionDelay }
    })
    expect(durations).not.toBeNull()
    for (const v of durations?.duration.split(',') ?? [])
      expect(Number.parseFloat(v)).toBeLessThanOrEqual(0.00001)
    for (const v of durations?.delay.split(',') ?? []) expect(Number.parseFloat(v)).toBe(0)
  })
})

test.describe('header theming', () => {
  test('the header adopts the surface under it', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 400 }) // short enough that the footer passes under the header
    await page.goto(MISSING)
    const h = page.locator(header)
    await expect(h).toHaveAttribute('data-surface', 'paper')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(h).toHaveAttribute('data-surface', 'ink')
  })
})

test.describe('@a11y menus', () => {
  test('mega menus open and close from the keyboard and return focus', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop navigation')
    await page.goto(MISSING)
    const trigger = page.getByRole('button', { name: 'Solutions' })
    const panel = page.locator('#menu-solutions')
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(panel).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(page.locator('#menu-solutions a').first()).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
    await expect(panel).toBeHidden()
    await page.keyboard.press('Space')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    // Opening another closes the first: one open at a time.
    await page.getByRole('button', { name: 'Developer' }).click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('#menu-developer')).toBeVisible()
    // An outside click closes it.
    await page.mouse.click(700, 600)
    await expect(page.locator('#menu-developer')).toBeHidden()
  })

  test('focus leaving the header closes the open menu', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop navigation')
    await page.goto(MISSING)
    await page.getByRole('button', { name: 'Company' }).click()
    await expect(page.locator('#menu-company')).toBeVisible()
    await page.getByRole('link', { name: 'Research', exact: true }).last().focus() // outside: in main
    await expect(page.locator('#menu-company')).toBeHidden()
  })

  test('the mobile sheet traps focus, closes on Escape and returns focus', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(MISSING)
    const open = page.getByRole('button', { name: 'Open menu' })
    await open.click()
    const sheet = page.locator('dialog#mobile-nav')
    await expect(sheet).toBeVisible()
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab')
      const inside = await page.evaluate(() => {
        const a = document.activeElement
        return !a || a === document.body || !!a.closest('dialog#mobile-nav')
      })
      expect(inside).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
    await expect(open).toBeFocused()
  })
})

test.describe('@motion brand reveals', () => {
  // Regression: the `animation` shorthand on `… path` out-ranked the band/rim delays, so every
  // stroke drew at once.
  test('the 404 mark draws struts → band → rim over 1.4 s', async ({ page }) => {
    await page.goto(MISSING)
    // Poll: the stylesheet may apply a moment after the markup exists.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const t = (sel: string) => {
            const a = document.querySelector(sel)?.getAnimations()[0]?.effect?.getTiming()
            return a ? [Number(a.delay), Number(a.duration)] : null
          }
          return {
            strut: t('.mark-draw .mb-struts path'),
            band: t('.mark-draw .mb-band'),
            rim: t('.mark-draw .mb-rim'),
          }
        }),
      )
      .toEqual({ strut: [0, 700], band: [450, 700], rim: [950, 450] })
  })

  // Regression: a -15 % bottom root margin meant the giant wordmark (the last thing on the page)
  // could never enter the zone and stayed in its hidden start state.
  test('the footer wordmark reveals even though it ends the page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(MISSING)
    const wordmark = page.locator('footer [data-reveal]').last()
    await expect(wordmark).toHaveAttribute('data-reveal', 'pending')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(wordmark).toHaveAttribute('data-reveal', 'done')
  })

  test('reduced motion: nothing is armed hidden and the mark does not animate', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(MISSING)
    await expect(page.locator('[data-reveal]')).toHaveCount(0)
    const animated = await page.evaluate(() =>
      [...document.querySelectorAll('.mb-mark path')].some((p) => p.getAnimations().length > 0),
    )
    expect(animated).toBe(false)
  })
})
