import { expect, test } from '@playwright/test'
import { MISSING, ROUTES, visit } from './utils.ts'

const header = 'header[data-collapsed]'

test.describe('@smoke layout', () => {
  // DESIGN §4.4: nothing may overflow horizontally at 320 px. (Regression: a `hidden` class lost to
  // Button's own `inline-flex` and pushed the 375 px header to 453 px.)
  for (const route of [...ROUTES, MISSING]) {
    test(`no horizontal overflow at 320 px on ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 })
      await page.goto(visit(route))
      const width = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(width).toBeLessThanOrEqual(320)
    })
  }
})

// Owner request (D-143): the header row measures what anthropic.com's does, 16 px above and below
// a 36 px row on desktop (68 px), 64 px on phones; it sat too high at 56 px.
for (const [width, height] of [
  [1440, 68],
  [375, 64],
] as const) {
  test(`@smoke the header is ${height} px tall at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')
    expect((await page.locator(header).boundingBox())?.height).toBe(height)
    const cta = await page.locator(header).getByRole('link', { name: 'Try for free' }).boundingBox()
    expect(cta?.y).toBe((height - 36) / 2) // the 36 px button, centred: 16 px from the top on desktop
  })
}

// Regression: the hero's single grid track grew to its widest child, so the lede and the second
// button ran past a phone's edge; the section's overflow-hidden kept scrollWidth at 320, so the
// overflow test above could not see it.
test('@smoke the home hero text fits a 320 px phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/')
  for (const box of [
    await page.locator('#home-title + p').boundingBox(),
    await page.getByRole('link', { name: 'Read the research' }).first().boundingBox(),
  ]) {
    expect(box).not.toBeNull()
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320)
  }
})

// D-135/D-136: headlines and interface in Fustat (the hero bold), ledes in the serif, data in
// Commit Mono; all from our origin, and only the hero's face preloaded.
test('@smoke fonts follow their roles and load from our origin', async ({ page }) => {
  await page.goto('/')
  const result = await page.evaluate(async () => {
    await document.fonts.ready
    const family = (sel: string) => {
      const el = document.querySelector(sel)
      return el ? getComputedStyle(el).fontFamily.split(',')[0]?.replaceAll('"', '') : 'missing'
    }
    const preloads = [...document.querySelectorAll('link[rel=preload][as=font]')].map((l) =>
      (l.getAttribute('href') ?? '').split('/').pop(),
    )
    const preloaded = [...document.styleSheets]
      .flatMap((s) => [...s.cssRules])
      .filter((r): r is CSSFontFaceRule => r instanceof CSSFontFaceRule)
      .filter((r) => preloads.some((p) => p && r.cssText.includes(p)))
      .map(
        (r) =>
          `${r.style.getPropertyValue('font-family').replaceAll('"', '')} ${r.style.getPropertyValue('font-style')}`,
      )
    const origins = performance
      .getEntriesByType('resource')
      .filter((r) => r.name.includes('.woff2'))
      .map((r) => new URL(r.name).origin)
    return {
      headline: family('#home-title'),
      headlineWeight: getComputedStyle(document.querySelector('#home-title') ?? document.body).fontWeight,
      lede: family('#home-title + p'),
      nav: family('header a[href]:not([href="/"])'),
      label: family('main .font-mono'),
      preloaded,
      foreign: origins.filter((o) => o !== location.origin),
    }
  })
  expect(result).toEqual({
    headline: 'Fustat',
    headlineWeight: '700',
    lede: 'Source Serif 4',
    nav: 'Fustat',
    label: 'commitMono',
    preloaded: ['Fustat normal'],
    foreign: [],
  })
})

test.describe('@smoke layout with motion', () => {
  // Regression: a hidden-until-its-step window, translated 24 px further right, pushed the pinned
  // Moth demo 8 px past the 1440 px viewport. Checked with motion on, after scrolling through.
  for (const route of ROUTES) {
    test(`no horizontal overflow at 1440 px with motion on ${route}`, async ({ page, isMobile }) => {
      test.skip(isMobile, 'desktop layout')
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(visit(route))
      await page.waitForLoadState('load')
      await page.evaluate(async () => {
        const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
        for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
          window.scrollTo(0, y)
          await frames()
        }
      })
      const width = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(width).toBeLessThanOrEqual(1440)
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
  test('the scrolled header has no dividing line under it', async ({ page }) => {
    await page.goto(MISSING)
    await page.evaluate(() => window.scrollTo(0, 400))
    const h = page.locator(header)
    await expect(h).toHaveAttribute('data-scrolled', 'true')
    await expect(h).toHaveCSS('border-bottom-width', '0px')
  })

  test('the header adopts the surface under it', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 400 }) // short enough that the footer passes under the header
    await page.goto(MISSING)
    const h = page.locator(header)
    await expect(h).toHaveAttribute('data-surface', 'paper')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(h).toHaveAttribute('data-surface', 'deep')
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
    await page.getByRole('button', { name: 'Developer' }).click()
    await expect(page.locator('#menu-developer')).toBeVisible()
    await page.getByRole('link', { name: 'Research', exact: true }).last().focus() // outside: in main
    await expect(page.locator('#menu-developer')).toBeHidden()
  })

  test('every dropdown has one width and is centred under its trigger', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop navigation')
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(MISSING)
    const widths = new Set<number>()
    for (const id of ['solutions', 'developer']) {
      await page.locator(`#menu-trigger-${id}`).click()
      const card = page.locator(`#menu-${id} > div`)
      await expect(card).toBeVisible()
      await expect(card).toHaveCSS('opacity', '1')
      const t = await page.locator(`#menu-trigger-${id}`).boundingBox()
      const c = await card.boundingBox()
      if (!t || !c) throw new Error(`no box for ${id}`)
      widths.add(Math.round(c.width))
      expect(Math.abs(t.x + t.width / 2 - (c.x + c.width / 2))).toBeLessThan(1)
    }
    expect(widths.size).toBe(1)
  })

  // Regression: the wrapper carried data-surface, so its hover gap painted a paper strip above the card.
  test('only the dropdown card paints; its wrapper is transparent', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop navigation')
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(MISSING)
    await page.locator('#menu-trigger-solutions').click()
    await expect(page.locator('#menu-solutions')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(page.locator('#menu-solutions > div')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  })

  test('the footer lists the six owner columns', async ({ page }) => {
    await page.goto(MISSING)
    await expect(page.locator('footer nav h2')).toHaveText([
      'Solutions',
      'Company',
      'Developer',
      'Enterprise',
      'Legal',
      'Social',
    ])
  })

  test('no Company menu; current page underlined, not boxed', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop navigation')
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(visit('/research'))
    const header = page.locator('header')
    await expect(header.getByRole('button', { name: 'Company' })).toHaveCount(0)
    const current = header.locator('nav a[aria-current="page"]', { hasText: 'Research' }).first() // the desktop nav; the mobile sheet holds a copy
    await expect(current).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(current).toHaveCSS('text-decoration-line', 'underline')
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

  // Regression: a -15 % bottom root margin meant a reveal at the very end of the page could never
  // enter the zone and stayed in its hidden start state.
  test('the footer mark reveals even though the footer ends the page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 400 })
    await page.goto(MISSING)
    const mark = page.locator('footer [data-reveal]').last()
    await expect(mark).toHaveAttribute('data-reveal', 'pending')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(mark).toHaveAttribute('data-reveal', 'done')
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

test.describe('@smoke figures', () => {
  // Regression: the light-cone labels were SVG text, so they scaled with the drawing to ~7 px at
  // 375, and "can reach it" sat across the dashed time axis.
  for (const width of [320, 375, 1440]) {
    test(`light-cone labels stay legible and clear of the time axis at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/research')
      const figure = page.locator('[data-figure="light-cone"]')
      await figure.scrollIntoViewIfNeeded()
      const labels = await figure.evaluate((el) => {
        const box = el.getBoundingClientRect()
        const axis = box.left + box.width / 2
        return [...el.querySelectorAll('span')].map((s) => {
          const r = s.getBoundingClientRect()
          return {
            text: s.textContent,
            px: Number.parseFloat(getComputedStyle(s).fontSize),
            crossesAxis: r.left < axis && r.right > axis,
          }
        })
      })
      expect(labels).toHaveLength(4)
      for (const l of labels) {
        expect(l.px, l.text ?? '').toBeGreaterThanOrEqual(11)
        expect(l.crossesAxis, l.text ?? '').toBe(false)
      }
    })
  }
})

test.describe('@smoke print', () => {
  // Regression: there was no print stylesheet, so an article printed with the sticky header, the
  // ink footer and tinted surfaces, and its links printed without their targets (DESIGN §10).
  test('an article prints black on white without chrome and shows link targets', async ({ page }) => {
    await page.goto('/news/introducing-moth-preview-004')
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('header[data-collapsed]')).toBeHidden()
    await expect(page.locator('footer')).toBeHidden()
    const printed = await page.evaluate(() => {
      const section = document.querySelector('article [data-surface]')
      const link = document.querySelector('.prose-article a[href]:not([href^="#"])')
      return {
        bg: section ? getComputedStyle(section).backgroundColor : '',
        fg: section ? getComputedStyle(section).color : '',
        href: link?.getAttribute('href') ?? '',
        after: link ? getComputedStyle(link, '::after').content : '',
      }
    })
    expect(printed.bg).toBe('rgb(255, 255, 255)')
    expect(printed.fg).toBe('rgb(0, 0, 0)')
    expect(printed.href).not.toBe('')
    expect(printed.after).toContain(printed.href)
  })
})

test.describe('@smoke current section', () => {
  // Regression: /solutions is the Solutions menu's feature card, not one of its links, so the
  // trigger showed no current mark on the section's own overview page.
  for (const [route, current] of [
    ['/solutions', 'true'],
    ['/solutions/legal', 'true'],
    ['/company', 'false'],
  ] as const) {
    test(`Solutions trigger current=${current} on ${route}`, async ({ page, isMobile }) => {
      test.skip(isMobile, 'desktop menus')
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(visit(route))
      await expect(page.locator('header button[data-current]', { hasText: 'Solutions' })).toHaveAttribute(
        'data-current',
        current,
      )
    })
  }
})
