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
    expect(lede.size).toBe(24)
    expect(lede.lh).toBeCloseTo(33.6, 3)
    expect(Number.parseFloat(lede.maxWidth)).toBeCloseTo(594.229, 2)
    // WebKit reports floats (16.799999), so values compare to 3 decimals.
    const button = await styleOf(page, '[data-hero-copy] a[class*="h-13"]')
    expect(button.size).toBe(15)
    expect(button.ls).toBeCloseTo(-0.08, 3)
    for (const sel of ['footer nav h2', 'footer nav a', 'footer p']) {
      const f = await styleOf(page, sel)
      expect(f.size, sel).toBe(12)
      expect(f.lh, sel).toBeCloseTo(16.8, 3)
    }
    if (vw >= 1024) {
      const nav = await styleOf(page, 'header nav a, header nav button')
      expect(nav.size).toBe(15)
      expect(nav.ls).toBeCloseTo(-0.0375, 3)
    } else {
      // Their phone sheet: top links at headline-4's phone size; our weight stays (owner).
      const top = await styleOf(page, '.mobile-sheet summary')
      expect(top.size).toBe(23)
      expect(top.lh).toBeCloseTo(27.6, 3)
      expect(top.weight).toBe('400')
    }
    await page.goto('/moth')
    const moth = await styleOf(page, '#moth-title')
    expect(moth.size, 'product H1s are headline-1 like every Anthropic page H1').toBe(vw >= 1024 ? 52 : 32)
  })
}

// Their reading column: 640 px from 992 px, the full column below; running text caps at 640 px.
for (const vw of [768, 991, 992, 1024, 1440]) {
  test(`@smoke article text sits in anthropic.com's reading column at ${vw} px`, async ({ page }) => {
    await page.setViewportSize({ width: vw, height: 900 })
    await page.goto('/news/introducing-moth-preview-004')
    // The column is our grid span (unchanged composition); the cap only narrows it.
    const { prose, column } = await page.locator('.prose-article').evaluate((el) => {
      const prose = el.getBoundingClientRect().width
      ;(el as HTMLElement).style.maxWidth = 'none'
      const column = el.getBoundingClientRect().width
      ;(el as HTMLElement).style.removeProperty('max-width')
      return { prose, column }
    })
    expect(prose).toBeCloseTo(vw >= 992 ? Math.min(640, column) : column, 1)
    await page.goto('/news')
    expect((await styleOf(page, 'h1 + p')).maxWidth, 'a lede caps at the text column').toBe('640px')
  })
}

// Their `--site--gutter`: 28 px at 375 to 32 px at 1600, linear (29.2833 px measured at 768,
// 31.4776 px at 1440). Their 12-column grid starts at tablet width; phones get one column. Ours
// stays 12 columns on phones (stacked spans), where 11 of their gutters (308 px) would overflow a
// 256 px frame at 320, so phones keep 16 px and the gutter is theirs from 768 px.
for (const vw of [375, 767, 768, 1024, 1440, 1920]) {
  test(`@smoke the 12-column gutter is anthropic.com's at ${vw} px`, async ({ page }) => {
    await page.setViewportSize({ width: vw, height: 900 })
    await page.goto('/company')
    const gap = await page
      .locator('main .grid-cols-12')
      .first()
      .evaluate((el) => Number.parseFloat(getComputedStyle(el).columnGap))
    expect(gap).toBeCloseTo(vw < 768 ? 16 : Math.min(32, 28 + ((vw - 375) * 4) / 1225), 2)
  })
}

// Owner choice: our letters render at anthropic.com's x-height for the same px (font-size-adjust).
// Their x-height per weight, measured on canvas live 2026-10-02: Sans/Serif 0.508 at 400, 0.514
// at 500, 0.521 at 600, 0.530 at 700; Mono 0.540. The browser scales our face by target ÷ its own
// x (`from-font`, the instance's real x: weight and optical size included); the rendered x is
// then the glyph measured at that used size. Text width is no measure: opsz reshapes the serif.
const X_HEIGHT: [string, string, number][] = [
  ['div', 'text-body', 0.508], // serif 400
  ['div', 'text-small', 0.508], // Fustat 400
  ['div', 'text-small font-medium', 0.514], // Fustat 500
  ['h2', 'font-display text-display-m', 0.521], // Fustat 600
  ['h1', 'font-display text-display-l', 0.53], // Fustat 700
  ['div', 'font-mono text-label', 0.54], // Commit Mono 400
]

test('@smoke letters render at anthropic.com x-height', async ({ page }) => {
  await page.goto('/company')
  const got = await page.evaluate(async (probes) => {
    await document.fonts.ready
    const ctx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D
    const out: Record<string, number> = {}
    for (const [tag, cls] of probes) {
      const wrap = document.createElement(tag)
      wrap.className = cls
      wrap.textContent = 'x'
      document.querySelector('main')?.append(wrap)
      const cs = getComputedStyle(wrap)
      const size = Number.parseFloat(cs.fontSize)
      await document.fonts.load(`${cs.fontWeight} ${size}px ${cs.fontFamily}`)
      const target = Number.parseFloat(cs.fontSizeAdjust)
      wrap.style.fontSizeAdjust = 'from-font'
      const own = Number.parseFloat(getComputedStyle(wrap).fontSizeAdjust)
      const used = (size * target) / own
      ctx.font = `${cs.fontWeight} ${used}px ${cs.fontFamily}`
      out[cls] = ctx.measureText('x').actualBoundingBoxAscent / size
      wrap.remove()
    }
    return out
  }, X_HEIGHT)
  // The serif gets 0.004 em: browsers read its x at the computed size but draw at the used size,
  // where its optical size sets the x lower (Chromium 0.0025 em, WebKit 0.0034; 0.07 px at 20 px).
  // Fustat and Commit Mono have no optical axis: exact in Chromium, within 0.0007 em in WebKit.
  for (const [, cls, x] of X_HEIGHT) {
    const tolerance = cls === 'text-body' ? 0.004 : 0.001
    expect(Math.abs((got[cls] ?? 0) - x), cls).toBeLessThan(tolerance)
  }
})

// Regression (D-145): at the 14 px caption size the Fig. 1 equations broke mid-term beside the
// caption prose; each equation is one line.
for (const vw of [1280, 1440, 1920]) {
  test(`@smoke the Moth figure's equations stay whole at ${vw} px`, async ({ page }) => {
    await page.setViewportSize({ width: vw, height: 900 })
    await page.goto('/moth')
    const eq = page.locator('figcaption p.font-serif-italic').first()
    // Unwrapped, the block is as tall as with wrapping forbidden (superscripts make line boxes
    // engine-dependent, so the height alone proves nothing).
    const { wrapped, unwrapped } = await eq.evaluate((el) => {
      const wrapped = el.getBoundingClientRect().height
      ;(el as HTMLElement).style.whiteSpace = 'nowrap'
      const unwrapped = el.getBoundingClientRect().height
      ;(el as HTMLElement).style.removeProperty('white-space')
      return { wrapped, unwrapped }
    })
    expect(wrapped).toBeCloseTo(unwrapped, 1)
  })
}

// Regression (D-145): at 14 px the /company counter fit one line in the fallback mono and two in
// Commit Mono at 390 px, so the font swap moved the mosaic (CLS 0.0305). Its lines are now fixed
// by width, not by font: two below 1024 px, one from 1024.
for (const [vw, lines] of [
  [390, 2],
  [768, 2],
  [1440, 1],
] as const) {
  test(`@smoke the blocks counter keeps ${lines} line(s) whatever the font at ${vw} px`, async ({ page }) => {
    await page.setViewportSize({ width: vw, height: 900 })
    await page.goto('/company')
    const count = page.locator('[data-blocks-count]')
    const heights = await count.evaluate(async (el) => {
      const lh = Number.parseFloat(getComputedStyle(el).lineHeight)
      const measure = () => Math.round(el.getBoundingClientRect().height / lh)
      const real = measure()
      ;(el as HTMLElement).style.fontFamily = 'ui-monospace, Menlo, monospace'
      const fallback = measure()
      ;(el as HTMLElement).style.removeProperty('font-family')
      return [real, fallback]
    })
    expect(heights).toEqual([lines, lines])
  })
}

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
