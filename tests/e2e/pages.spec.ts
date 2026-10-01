import { expect, type Page, test } from '@playwright/test'
import { MISSING, ROUTES, visit } from './utils.ts'

// Page behaviours that are not chrome, motion or forms (PAGES §9).

test.describe('@smoke solutions', () => {
  const cards = (page: Page) => page.locator('#worlds li h3')
  const filters = (page: Page) => page.getByRole('navigation', { name: 'Filter by area' })

  test('use-cases filter: URL state, current chip, counted result', async ({ page }) => {
    await page.goto('/solutions/use-cases')
    await expect(cards(page)).toHaveCount(8)
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
    await expect(cards(page)).toHaveCount(8)
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

test.describe('@smoke docs contents', () => {
  // Regression: an IntersectionObserver missed headings that jumped from above the viewport to
  // below the line (bottom → top), so "Glossary" stayed current at the top of the page.
  test('marks the section being read, also after jumping back to the top', async ({ page, isMobile }) => {
    test.skip(isMobile, 'the sticky contents list is desktop-only')
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/developers/docs')
    const toc = page.getByRole('navigation', { name: 'Contents' })
    const current = toc.locator('[aria-current="location"]')
    await expect(current).toHaveText('Fields')
    await page.evaluate(() => document.getElementById('outcomes')?.scrollIntoView())
    await expect(current).toHaveText('Outcomes')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(current).toHaveText('Glossary')
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(current).toHaveText('Fields')
  })
})

test.describe('@smoke honest status, pricing and changelog (CONTENT §4)', () => {
  test('status: every component is "not yet monitored"; no uptime figures', async ({ page }) => {
    await page.goto('/status')
    await expect(page.locator('#components li', { hasText: 'Not yet monitored' })).toHaveCount(4)
    const text = (await page.locator('main').textContent()) ?? ''
    expect(text).not.toMatch(/operational|\d+(\.\d+)?\s?%/i)
  })

  test('pricing: no prices or currency anywhere', async ({ page }) => {
    await page.goto('/pricing')
    expect((await page.locator('main').textContent()) ?? '').not.toMatch(
      /[$€£]\s?\d|\/\s?mo(nth)?\b|per seat/i,
    )
  })

  test('changelog: every date is a real publication date', async ({ page }) => {
    const { ARTICLES } = await import('../../src/content/articles.ts')
    const real = new Set<string>(
      ARTICLES.flatMap((a) => ['updated' in a ? a.updated : a.published, a.published]),
    )
    await page.goto('/changelog')
    const dates = await page
      .locator('main time')
      .evaluateAll((els) => els.map((e) => e.getAttribute('datetime')))
    expect(dates.length).toBeGreaterThan(0)
    for (const d of dates) expect(real.has(d ?? '')).toBe(true)
  })
})

test.describe('@smoke legal (CONTENT §3.13)', () => {
  const banners = {
    terms: null,
    privacy: 'Updated — pending owner review.',
    'enterprise-terms': 'Draft — pending owner and legal review. This page is not yet in force.',
    cookies: 'Draft — pending owner and legal review. This page is not yet in force.',
    'privacy-choices': 'Draft — pending owner and legal review. This page is not yet in force.',
    'responsible-disclosure': 'Draft — pending owner and legal review. This page is not yet in force.',
  } as const
  for (const [slug, banner] of Object.entries(banners)) {
    test(`/legal/${slug}: last updated, banner where required, current page in the rail`, async ({
      page,
    }) => {
      await page.goto(`/legal/${slug}`)
      await expect(page.getByText(/^Last updated /)).toBeVisible()
      const drafts = page.getByText(/^(Draft|Updated) — pending/)
      if (banner) await expect(drafts).toHaveText(banner)
      else await expect(drafts).toHaveCount(0)
      const rail = page.getByRole('navigation', { name: 'Legal pages' })
      await expect(rail.getByRole('link')).toHaveCount(6)
      await expect(rail.locator('[aria-current="page"]')).toHaveAttribute('href', `/legal/${slug}`)
    })
  }

  test('privacy choices: the GPC notice shows only when the browser sends the signal', async ({ page }) => {
    const notice = page.getByText('Your browser’s Global Privacy Control signal is on — noted.')
    await page.goto('/legal/privacy-choices')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy choices')
    await expect(notice).toHaveCount(0)
    await page.addInitScript(() =>
      Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true }),
    )
    await page.reload()
    await expect(notice).toBeVisible()
  })

  test('an unknown legal page is a 404', async ({ request }) => {
    expect((await request.get('/legal/not-a-page')).status()).toBe(404)
  })
})

test('@smoke an article title keeps a hyphenated compound on one line', async ({ page }) => {
  await page.goto('/research/toward-field-based-intelligence')
  const compound = page.locator('h1 span', { hasText: 'field-based' })
  await expect(compound).toHaveCount(1)
  expect(await compound.evaluate((el) => el.getClientRects().length)).toBe(1)
})

// Regression: a plate absorbed the length of the gloss under it, so Plate III (one-line gloss)
// stood taller than its neighbours and its strip and gloss sat lower.
test('@smoke the research inquiry plates and their glosses line up', async ({ page, isMobile }) => {
  test.skip(isMobile, 'one column on phones')
  await page.goto('/research')
  const boxes = (sel: string) =>
    page
      .locator(`#lines-of-inquiry ${sel}`)
      .evaluateAll((els) => els.map((e) => ({ top: e.getBoundingClientRect().top, h: e.clientHeight })))
  const plates = await boxes('article.plate')
  const glosses = await boxes('div:has(> div > article.plate) > p')
  expect(plates).toHaveLength(3)
  expect(glosses).toHaveLength(3)
  expect(new Set(plates.map((b) => b.h)).size).toBe(1)
  expect(new Set(glosses.map((b) => Math.round(b.top))).size).toBe(1)
})

// Regression: the field redesign replaced Moth's butterfly figure; the owner wants it in the hero.
test('@smoke the Moth hero shows Fig. 1, the butterfly curve with its equations', async ({ page }) => {
  await page.goto('/moth')
  const fig = page.locator('main section').first().locator('figure')
  await expect(fig.locator('.moth-curve-path')).toHaveCount(1)
  await expect(fig.locator('figcaption')).toContainText('Fay’s butterfly curve')
  await expect(fig.locator('figcaption')).toContainText('x = sin t')
})

// Regression: on dark grounds the window's ink title bar, ink border and printed shadow vanished
// into the section, and the dark-ground rule lost to the window's own utilities.
test('@smoke on an ink section the release window stands off the ground', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('#current-release')
  const win = section.locator('.instrument-window')
  const ground = await section.evaluate((el) => getComputedStyle(el).backgroundColor)
  const bar = await win.locator('figcaption').evaluate((el) => getComputedStyle(el).backgroundColor)
  expect(bar).not.toBe(ground)
  await expect(win).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)')
  expect(await win.evaluate((el) => getComputedStyle(el).boxShadow)).toContain('0px 0px 0px 1px')
})

// One corner radius for the whole site (owner request, D-133): every rounded box, pseudo-element
// and corner computes to exactly 10 px, the footer card included. Measured, not grepped.
for (const route of [...ROUTES, MISSING]) {
  test(`one corner radius on ${route}`, async ({ page }) => {
    await page.goto(visit(route))
    const off = await page.evaluate(() => {
      const bad: string[] = []
      const corners = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'] as const
      for (const el of document.querySelectorAll('body *')) {
        if (el instanceof SVGElement && !(el instanceof SVGSVGElement)) continue
        const allowed = '10px'
        for (const pseudo of [null, '::before', '::after']) {
          const cs = getComputedStyle(el, pseudo)
          for (const c of corners) {
            const v = cs.getPropertyValue(
              `border-${c.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`).slice(1)}-radius`,
            )
            if (v !== '0px' && v !== allowed) {
              bad.push(
                `${el.tagName.toLowerCase()}.${String(el.getAttribute('class')).slice(0, 60)}${pseudo ?? ''} ${c}=${v}`,
              )
              break
            }
          }
        }
        // A box framed on all four sides and larger than 32 px must be rounded too, not square.
        if (el instanceof SVGElement) continue
        const cs = getComputedStyle(el)
        const framed = ['top', 'right', 'bottom', 'left'].every(
          (s) =>
            Number.parseFloat(cs.getPropertyValue(`border-${s}-width`)) > 0 &&
            cs.getPropertyValue(`border-${s}-color`) !== 'rgba(0, 0, 0, 0)',
        )
        const box = el.getBoundingClientRect()
        if (framed && box.width > 32 && box.height > 32 && cs.borderTopLeftRadius !== allowed)
          bad.push(`square box ${el.tagName.toLowerCase()}.${String(el.getAttribute('class')).slice(0, 60)}`)
      }
      // SVG boxes: the site radius in drawing units (10), or the glyph-scale 4.5; never a pill.
      for (const r of document.querySelectorAll('svg rect[rx]')) {
        const [rx, w, h] = ['rx', 'width', 'height'].map((a) => Number(r.getAttribute(a)))
        if (!(rx === 10 || rx === 4.5) || 2 * (rx ?? 0) >= Math.min(w ?? 0, h ?? 0))
          bad.push(`svg rect rx=${rx} ${w}x${h}`)
      }
      return [...new Set(bad)]
    })
    expect(off).toEqual([])
  })
}
