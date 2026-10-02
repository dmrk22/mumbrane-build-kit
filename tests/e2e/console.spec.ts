import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { collectConsole, externalRequests, settled } from './utils.ts'

// D-147: the console app is parked. /console is a coming-soon page in the site's chrome and every
// console page redirects to it. The app's acceptance flows (CONSOLE §14) are in git history with
// the app; restore them together.

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']

test.describe('@console', () => {
  test('@smoke /console is a coming-soon page in the site chrome, noindex', async ({ page, baseURL }) => {
    const external = externalRequests(page, new URL(baseURL ?? 'http://localhost').origin)
    const messages = collectConsole(page)
    await page.goto('/console')
    await expect(page.getByRole('heading', { level: 1, name: 'The console is coming soon.' })).toBeVisible()
    await expect(page.locator('header').first()).toBeVisible()
    await expect(page.locator('footer')).toBeAttached()
    await expect(page.getByRole('link', { name: 'Talk to the lab' })).toHaveAttribute('href', '/contact')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await settled(page)
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
    expect(violations.map((v) => v.id)).toEqual([])
    expect(external).toEqual([])
    expect(messages).toEqual([])
  })

  for (const path of ['/console/playground', '/console/keys', '/console/usage', '/console/settings']) {
    test(`${path} redirects to the coming-soon page`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 })
      expect(res.status()).toBe(307)
      expect(res.headers().location).toBe('/console')
    })
  }
})
