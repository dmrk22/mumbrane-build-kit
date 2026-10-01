import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { collectConsole, externalRequests, settled } from './utils.ts'

// CONSOLE §14: the console preview's acceptance flows, on desktop (1440), mobile (390 × 844) and
// WebKit. Every flow is a simulation: nothing leaves the page.

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']
const ORDERONE = 'Is orderone a purchase-ready item?'

/** The evidence on screen: the side panel from 1024 px, a card's own section below. */
const evidence = (page: Page) => page.locator('#evidence, [id^="ev-"]').filter({ visible: true })
const card = (page: Page, question: string) => page.getByRole('article', { name: question, exact: true })
const badge = (page: Page) =>
  page
    .getByText(/^build [0-9a-f]{4} · active$/)
    .filter({ visible: true })
    .first()
const askBox = (page: Page) => page.getByRole('textbox', { name: 'Question' })

async function axe(page: Page) {
  await settled(page)
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

test.describe('@console', () => {
  test('@smoke three actions: open a world, click a question, read its evidence', async ({
    page,
    baseURL,
  }) => {
    const external = externalRequests(page, new URL(baseURL ?? 'http://localhost').origin)
    const messages = collectConsole(page)
    await page.goto('/console')
    await page.getByRole('link', { name: 'Purchasing' }).click()
    await page.getByRole('button', { name: ORDERONE, exact: true }).click()
    await expect(card(page, ORDERONE).getByText('Supported', { exact: true })).toBeVisible()
    await expect(evidence(page).getByText('“atlas passed inspection.”')).toBeVisible()
    await expect(page.getByText('orderone: supported')).toBeAttached()
    expect(external).toEqual([])
    expect(messages).toEqual([])
  })

  test('a negated question is refused with a rephrasing that works', async ({ page }) => {
    await page.goto('/console/playground?world=purchasing')
    await askBox(page).fill('Is ordertwo not a purchase-ready item?')
    await askBox(page).press('Enter')
    const refused = card(page, 'Is ordertwo not a purchase-ready item?')
    await expect(refused.getByText('Refused', { exact: true })).toBeVisible()
    await expect(refused.getByText(/Negated questions are not supported/)).toBeVisible()
    await expect(askBox(page)).toBeFocused()
    await expect(askBox(page)).toHaveValue('')
    await refused.getByRole('button', { name: 'Is ordertwo a purchase-ready item?' }).click()
    const rephrased = card(page, 'Is ordertwo a purchase-ready item?')
    await expect(rephrased.getByText('No supported proof', { exact: true })).toBeVisible()
    await expect(rephrased.getByText('Missing: birch passed inspection.')).toBeVisible()
  })

  test('rebuild changes the build id; replay reproduces the result against the original build', async ({
    page,
  }) => {
    await page.goto('/console/playground?world=purchasing')
    await page.getByRole('button', { name: ORDERONE, exact: true }).click()
    const before = (await badge(page).textContent())?.slice(6, 10) ?? ''
    expect(before).toMatch(/^[0-9a-f]{4}$/)

    const show = page.getByRole('button', { name: 'Show world' })
    if (await show.isVisible()) await show.click()
    const rebuild = page.getByRole('button', { name: 'Rebuild' }).filter({ visible: true })
    await expect(rebuild).toBeDisabled()
    await page.getByText('Require audit instead of inspection').filter({ visible: true }).click()
    await rebuild.click()
    await expect(page.getByText(/^Rebuilt\. Build [0-9a-f]{4} is now active\.$/)).toBeAttached()
    if (await page.locator('dialog[open]').count()) await page.keyboard.press('Escape')
    await expect(badge(page)).not.toHaveText(`build ${before} · active`)

    const original = card(page, ORDERONE).last()
    await original.getByRole('button', { name: 'Replay' }).first().click()
    await expect(original.getByText(`Replayed against build ${before} — same result.`).first()).toBeVisible()
    await expect(original.getByText('Supported', { exact: true })).toBeVisible()

    // The new build answers differently: inspection no longer approves a supplier.
    await page.getByRole('button', { name: ORDERONE, exact: true }).click()
    await expect(card(page, ORDERONE).first().getByText('No supported proof', { exact: true })).toBeVisible()
  })

  test('keyboard only: / focuses, Enter asks, Esc leaves the box, E opens the evidence', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'hardware keyboard flow')
    await page.goto('/console/playground?world=venues')
    // The shortcut listener exists once the page has hydrated; keep pressing until it answers.
    await expect(async () => {
      await page.keyboard.press('/')
      await expect(askBox(page)).toBeFocused({ timeout: 500 })
    }).toPass()
    await page.keyboard.type('Is hallone a ready venue?')
    await page.keyboard.press('Enter')
    await expect(
      card(page, 'Is hallone a ready venue?').getByText('Supported', { exact: true }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await page.keyboard.press('e')
    await expect(page.locator('#evidence')).toBeFocused()
    await expect(evidence(page).getByText('“hallone has a confirmed booking.”')).toBeVisible()
    await page.keyboard.press('?')
    await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeHidden()
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`axe is clean in the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((t) => window.localStorage.setItem('mb-console-theme', t), theme)
      await page.goto('/console')
      expect(await axe(page)).toEqual([])
      await page.goto('/console/playground?world=trails')
      for (const name of ['Is trailone a family trail?', 'Is trailthree an accessible trail?']) {
        await page.getByRole('button', { name, exact: true }).click()
      }
      await page.getByRole('button', { name: 'A question longer than 2,048 characters' }).click()
      await expect(page.getByText('Resource limit', { exact: true }).first()).toBeVisible()
      await askBox(page).fill('Is trailone not a family trail?')
      await askBox(page).press('Enter')
      await page.getByRole('button', { name: 'Show JSON' }).filter({ visible: true }).first().click()
      expect(await axe(page)).toEqual([])
      for (const route of ['/console/keys', '/console/settings']) {
        await page.goto(route)
        expect(await axe(page)).toEqual([])
      }
    })
  }

  test('@smoke the theme persists across reload and is set before the first paint', async ({ page }) => {
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.dataset.themeAtLoad =
          document.documentElement.dataset.consoleTheme ?? 'unset'
      })
    })
    await page.goto('/console/settings')
    await expect(page.locator('html')).toHaveAttribute('data-theme-at-load', 'unset')
    await page
      .locator('label')
      .filter({ hasText: /^Dark$/ })
      .click()
    await expect(page.locator('html')).toHaveAttribute('data-console-theme', 'dark')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme-at-load', 'dark')
    await page
      .locator('label')
      .filter({ hasText: /^System$/ })
      .click()
    await expect(page.locator('html')).not.toHaveAttribute('data-console-theme', /./)
  })

  test('an unknown world goes back to the entry; console pages are noindex', async ({ page }) => {
    await page.goto('/console/playground?world=elsewhere')
    await expect(page).toHaveURL(/\/console$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Console preview' })).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })

  test('keys: the create flow ends without a key; no credential fields exist', async ({ page }) => {
    await page.goto('/console/keys')
    await expect(page.getByText('No keys yet')).toBeVisible()
    await page.getByRole('button', { name: 'Create key' }).click()
    const dialog = page.getByRole('dialog', { name: 'Create a key' })
    await dialog.getByLabel('Name').fill('build server')
    await dialog.getByText('Ask and build').click()
    await dialog.getByRole('button', { name: 'Create' }).click()
    await expect(dialog.getByRole('status')).toHaveText(
      'No key was created — keys arrive with the hosted console.',
    )
    await expect(page.locator('input[type="password"]')).toHaveCount(0)
  })

  test('usage counts this session; settings reset it after an inline confirmation', async ({ page }) => {
    await page.goto('/console/usage')
    await expect(page.getByText('No questions yet in this session.')).toBeVisible()
    await page.goto('/console/playground?world=libraries')
    await page.getByRole('button', { name: 'Is bookone a recommended book?', exact: true }).click()
    await page.getByRole('button', { name: 'Is bookfour a lendable book?', exact: true }).click()
    // Client-side navigation keeps the in-memory session (a reload would discard it).
    await page.getByRole('link', { name: 'Usage' }).filter({ visible: true }).click()
    await expect(page.getByText('Questions asked').locator('..')).toContainText('2')
    await page.getByRole('link', { name: 'Settings' }).filter({ visible: true }).click()
    await page.getByRole('button', { name: 'Reset session' }).click()
    await expect(page.getByText('Clear all questions and results?')).toBeVisible()
    await page.getByRole('button', { name: 'Yes, reset' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Session cleared.' })).toBeVisible()
    await page.getByRole('link', { name: 'Usage' }).filter({ visible: true }).click()
    await expect(page.getByText('No questions yet in this session.')).toBeVisible()
  })
})
