import { expect, type Page, test } from '@playwright/test'

// Page behaviours that are not chrome, motion or forms (PAGES §9).

test.describe('@smoke solutions', () => {
  const cards = (page: Page) => page.locator('#worlds li h3')
  const filters = (page: Page) => page.getByRole('navigation', { name: 'Filter by area' })

  test('use-cases filter: URL state, current chip, counted result', async ({ page }) => {
    await page.goto('/solutions/use-cases')
    await expect(cards(page)).toHaveCount(10)
    await filters(page).getByRole('link', { name: 'Legal', exact: true }).click()
    await expect(page).toHaveURL(/\?domain=legal$/)
    await expect(cards(page)).toHaveText(['Clause conditions'])
    await expect(filters(page).getByRole('link', { name: 'Legal', exact: true })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(page.getByRole('status')).toHaveText('Showing 1 example world.')
  })

  test('an unknown ?domain falls back to all, never reflected', async ({ page }) => {
    await page.goto('/solutions/use-cases?domain=%3Cb%3Ex')
    await expect(cards(page)).toHaveCount(10)
    await expect(filters(page).getByRole('link', { name: 'All', exact: true })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(await page.content()).not.toContain('&lt;b&gt;x')
  })

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false })
    test('the filter works as plain links', async ({ page }) => {
      await page.goto('/solutions/use-cases')
      await filters(page).getByRole('link', { name: 'Security', exact: true }).click()
      await expect(cards(page)).toHaveText(['Privileged access'])
    })
  })

  test('each solution page labels its world and preselects its topic on contact', async ({ page }) => {
    for (const slug of ['business', 'customer-support', 'legal', 'security']) {
      await page.goto(`/solutions/${slug}`)
      await expect(page.locator('#illustrative-world figcaption')).toContainText(/illustrative/i)
      await expect(page.getByRole('link', { name: 'Talk to us' })).toHaveAttribute(
        'href',
        `/contact?interest=${slug}`,
      )
    }
    await page.goto('/solutions/legal')
    await expect(page.getByText('Not legal advice. Illustrative only.')).toBeVisible()
  })

  test('an unknown solution is a 404', async ({ request }) => {
    expect((await request.get('/solutions/not-a-solution')).status()).toBe(404)
  })
})
