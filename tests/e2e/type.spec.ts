import { expect, type Page, test } from '@playwright/test'

// D-145: the type is anthropic.com's, measured live 2026-10-02 (computed styles and their CSS).
// Their content pages (/news, articles, /research, /company, /careers, /legal…) step at 992 and
// 1024 px. Per class: [size <992, 992–1023, ≥1024] px, line-height, tracking px.
const SCALE: Record<string, [readonly [number, number, number], number, number]> = {
  'text-display-l': [[32, 44, 52], 1.1, 0], // headline-1
  'text-display-m': [[23, 23, 32], 1.2, 0], // headline-4
  'text-display-s': [[20, 20, 25], 1.2, 0], // headline-5
  'text-title': [[17, 17, 19], 1.2, 0], // headline-6
  'text-lede': [[19, 19, 20], 1.55, 0], // body-1
  'text-body': [[17, 17, 17], 1.55, 0], // body-2
  'prose-article': [[17, 17, 17], 1.55, 0], // body-2 .post-text
  'text-small': [[15, 15, 15], 1.4, 0], // body-3
  'text-caption': [[14, 14, 14], 1.2, 0.15], // caption
  'text-label': [[14, 14, 14], 1.2, 0.15], // caption (owner: the mono labels take it)
  'text-code': [[15, 15, 15], 1.4, -0.6], // mono
  'text-fine': [[12, 12, 12], 1.4, 0], // body-4, the footer
  'text-hero-lede': [[24, 24, 24], 1.4, 0], // their home page's u-paragraph-l
}
// Their home H1 (u-display-xl): 40 px at 375 to 64 px at 1600, linear.
const hero = (vw: number) => Math.min(64, Math.max(40, 40 + ((vw - 375) * 24) / 1225))

/** Computed [size, line-height, tracking] of a <p> inside a wrapper carrying each class. */
function probe(page: Page, classes: string[], root = 'main') {
  return page.evaluate(
    ([list, sel]) => {
      const out: Record<string, number[]> = {}
      for (const c of list) {
        const wrap = document.createElement('div')
        wrap.className = c
        const p = document.createElement('p')
        p.textContent = 'x'
        wrap.append(p)
        document.querySelector(sel)?.append(wrap)
        const cs = getComputedStyle(p)
        out[c] = [cs.fontSize, cs.lineHeight, cs.letterSpacing].map((v) => Number.parseFloat(v) || 0)
        wrap.remove()
      }
      return out
    },
    [classes, root] as const,
  )
}

/** Computed font-size, line-height, letter-spacing and max-width of the first match. */
async function styleOf(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        size: Number.parseFloat(cs.fontSize),
        lh: Number.parseFloat(cs.lineHeight),
        ls: Number.parseFloat(cs.letterSpacing) || 0,
        weight: cs.fontWeight,
        maxWidth: cs.maxWidth,
      }
    })
}

// Each element takes the size its anthropic.com counterpart uses (D-145).
for (const vw of [375, 1440]) {
  test(`@smoke components take their anthropic.com counterpart's type at ${vw} px`, async ({ page }) => {
    await page.setViewportSize({ width: vw, height: 900 })
    await page.goto('/')
    const h1 = await styleOf(page, '#home-title')
    expect(h1.size, 'home H1: their home u-display-xl at every width').toBeCloseTo(hero(vw), 1)
    const lede = await styleOf(page, '#home-title + p')
    expect([lede.size, lede.lh, lede.maxWidth]).toEqual([24, 33.6, '594.229px'])
    const button = await styleOf(page, '[data-hero-copy] a[class*="h-13"]')
    expect([button.size, button.ls]).toEqual([15, -0.08])
    for (const sel of ['footer nav h2', 'footer nav a', 'footer p']) {
      const f = await styleOf(page, sel)
      expect([f.size, f.lh], sel).toEqual([12, 16.8])
    }
    if (vw >= 1024) {
      const nav = await styleOf(page, 'header nav a, header nav button')
      expect([nav.size, nav.ls]).toEqual([15, -0.0375])
    } else {
      // Their phone sheet: top links at headline-4's phone size; our weight stays (owner).
      const top = await styleOf(page, '.mobile-sheet summary')
      expect([top.size, top.lh, top.weight]).toEqual([23, 27.6, '400'])
    }
    await page.goto('/moth')
    const moth = await styleOf(page, '#moth-title')
    expect(moth.size, 'product H1s are headline-1 like every Anthropic page H1').toBe(vw >= 1024 ? 52 : 32)
  })
}

// Owner choice: the console keeps its pre-D-145 type, inside its own surface.
test('@smoke the console keeps its own type scale', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/console')
  const got = await probe(
    page,
    ['text-small', 'text-label', 'text-caption', 'text-code', 'text-display-s'],
    '[data-console-surface]',
  )
  expect(got['text-small']).toEqual([15, 22.5, 0])
  expect(got['text-label']?.[0]).toBe(11)
  expect(got['text-caption']?.[0]).toBe(13)
  expect(got['text-code']).toEqual([13, 22.1, 0])
  expect(got['text-display-s']?.[0]).toBeCloseTo(37.2, 1) // 1.2rem + 1.25vw
})

for (const vw of [375, 768, 991, 992, 1023, 1024, 1440, 1600, 1920]) {
  test(`@smoke type matches anthropic.com at ${vw} px`, async ({ page }) => {
    await page.setViewportSize({ width: vw, height: 900 })
    await page.goto('/company')
    const got = await probe(page, [...Object.keys(SCALE), 'text-hero'])
    const step = vw >= 1024 ? 2 : vw >= 992 ? 1 : 0
    for (const [c, [sizes, lh, ls]] of Object.entries(SCALE)) {
      const size = sizes[step] as number
      expect(got[c]?.[0], `${c} size`).toBeCloseTo(size, 2)
      expect(got[c]?.[1], `${c} line-height`).toBeCloseTo(size * lh, 1)
      expect(got[c]?.[2], `${c} tracking`).toBeCloseTo(ls, 2)
    }
    expect(got['text-hero']?.[0], 'hero size').toBeCloseTo(hero(vw), 1)
    expect(got['text-hero']?.[1], 'hero line-height').toBeCloseTo(hero(vw) * 1.1, 1)
    expect(got['text-hero']?.[2], 'hero tracking').toBe(0)
  })
}
