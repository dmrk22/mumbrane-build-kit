import { expect, type Page, test } from '@playwright/test'

// SECURITY §6 / PAGES §7: real, accessible forms whose submissions go nowhere yet.

async function fillContact(page: Page) {
  await page.getByLabel('Name', { exact: true }).fill('Ada Lovelace')
  await page.getByLabel('Email', { exact: true }).fill('ada@example.com')
  await page.getByLabel('Topic').selectOption('research')
  await page
    .getByLabel('Message', { exact: true })
    .fill('How do compiled definitions handle missing facts? '.repeat(3))
}

test.describe('@forms with JavaScript', () => {
  test('empty submit: inline errors, a counted summary, focus on the first field, no request', async ({
    page,
  }) => {
    await page.goto('/contact')
    const posts: string[] = []
    page.on('request', (r) => {
      if (r.method() === 'POST') posts.push(r.url())
    })
    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Please fix' })).toHaveText(
      'Please fix 4 fields.',
    )
    await expect(page.getByLabel('Name', { exact: true })).toBeFocused()
    await expect(page.getByLabel('Name', { exact: true })).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText('Enter an email address like name@example.com.')).toBeVisible()
    await expect(page.getByText('Choose a topic.')).toBeVisible()
    // The error is part of the field's accessible description.
    await expect(page.getByLabel('Message', { exact: true })).toHaveAccessibleDescription(
      /at least 20 characters/i,
    )
    expect(posts).toEqual([])
  })

  test('fixing a flagged field clears its error when you leave it', async ({ page }) => {
    await page.goto('/contact')
    await page.getByRole('button', { name: 'Send message' }).click()
    await page.getByLabel('Name', { exact: true }).fill('Ada')
    await page.getByLabel('Email', { exact: true }).focus()
    await expect(page.getByLabel('Name', { exact: true })).not.toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('status').filter({ hasText: 'Please fix' })).toHaveText(
      'Please fix 3 fields.',
    )
  })

  test('a valid message shows the preview state with a capped, prefilled email', async ({ page }) => {
    await page.goto('/contact')
    await fillContact(page)
    const requests: string[] = []
    page.on('request', (r) => requests.push(new URL(r.url()).origin))
    await page.getByRole('button', { name: 'Send message' }).click()
    const heading = page.getByRole('heading', { name: 'Thanks — nearly there.' })
    await expect(heading).toBeFocused()
    await expect(page.getByText('this message has not been sent')).toBeVisible()
    const href = await page.getByRole('link', { name: 'Send it by email instead' }).getAttribute('href')
    expect(href).toMatch(/^mailto:hello@mumbrane\.com\?subject=Contact%20%E2%80%94%20Research&body=/)
    expect(href?.length).toBeLessThanOrEqual(1800)
    expect(decodeURIComponent(href ?? '')).toContain('Name: Ada Lovelace')
    // Same-origin action POST only; nothing personal lands in the URL.
    expect(new Set(requests)).toEqual(new Set([new URL(page.url()).origin]))
    expect(page.url()).not.toContain('Ada')
    await page.getByRole('link', { name: 'Edit message' }).click()
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Ada Lovelace')
  })

  test('?interest preselects a known topic and ignores anything else', async ({ page }) => {
    await page.goto('/contact?interest=careers')
    await expect(page.getByLabel('Topic')).toHaveValue('careers')
    await page.goto('/contact?interest=%3Cscript%3E')
    await expect(page.getByLabel('Topic')).toHaveValue('')
    expect(await page.content()).not.toContain('&lt;script&gt;')
  })

  test('sales: required selects and work email', async ({ page }) => {
    await page.goto('/contact/sales')
    await page.getByRole('button', { name: 'Contact sales' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Please fix' })).toHaveText(
      'Please fix 7 fields.',
    )
    await expect(page.getByText('Choose a company size.')).toBeVisible()
  })

  test('the honeypot is out of the tab order and hidden from assistive tech', async ({ page }) => {
    await page.goto('/contact')
    const trap = page.locator('input[name="website"]')
    await expect(trap).toHaveAttribute('tabindex', '-1')
    await expect(trap).toBeAttached()
    expect(await trap.evaluate((el) => getComputedStyle(el).display)).not.toBe('none')
    await expect(page.getByRole('textbox', { name: /leave this field empty/i })).toHaveCount(0)
  })
})

test.describe('@forms without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the server action validates and answers with the same states', async ({ page }) => {
    await page.goto('/contact')
    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByText('Please fix 4 fields.')).toBeVisible()
    await expect(page.getByLabel('Name', { exact: true })).toBeFocused()
    await fillContact(page)
    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByRole('heading', { name: 'Thanks — nearly there.' })).toBeVisible()
    expect(page.url()).not.toContain('Ada')
  })

  test('a filled honeypot gets the ordinary success state', async ({ page }) => {
    await page.goto('/contact')
    await fillContact(page)
    await page.locator('input[name="website"]').fill('https://spam.example')
    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByRole('heading', { name: 'Thanks — nearly there.' })).toBeVisible()
    const href = await page.getByRole('link', { name: 'Send it by email instead' }).getAttribute('href')
    expect(href).not.toContain('Ada')
  })
})
