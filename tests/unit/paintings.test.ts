import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { test } from 'node:test'
import { BUDGET_1600, lqipCss, medianCut, toHex } from '../../scripts/images.ts'
import { passesFor, sizeOf } from '../../scripts/paint.ts'
import { PAINTINGS, WIDTHS } from '../../src/content/paintings.ts'
import { monoDate, proseDate, roman, shortDate } from '../../src/lib/format.ts'

const manifest = JSON.parse(readFileSync('src/content/paintings.manifest.json', 'utf8')) as {
  id: string
  width: number
  height: number
  palette: { hex: string; weight: number }[]
  lqip: string
}[]

test('every registered painting is built at every width, within the AVIF budget', () => {
  assert.deepEqual(
    manifest.map((m) => m.id),
    PAINTINGS.map((p) => p.id),
  )
  for (const p of PAINTINGS) {
    for (const w of WIDTHS)
      for (const ext of ['avif', 'webp'])
        assert.ok(existsSync(`public/paintings/${p.id}-${w}.${ext}`), `${p.id}-${w}.${ext}`)
    const budget = p.scene === 'membrane' ? BUDGET_1600.poster : BUDGET_1600.painting
    assert.ok(statSync(`public/paintings/${p.id}-1600.avif`).size <= budget, `${p.id} 1600w AVIF over budget`)
  }
})

test('manifest entries: real sizes in the registry aspect, 8–10 swatch palettes, a webp LQIP', () => {
  for (const m of manifest) {
    const spec = PAINTINGS.find((p) => p.id === m.id)
    assert.ok(spec)
    assert.deepEqual({ width: m.width, height: m.height }, sizeOf(spec))
    assert.ok(m.palette.length >= 8 && m.palette.length <= 10, `${m.id}: ${m.palette.length} swatches`)
    const total = m.palette.reduce((s, x) => s + x.weight, 0)
    assert.ok(Math.abs(total - 1) < 0.01, `${m.id} weights sum ${total}`)
    for (const s of m.palette) assert.match(s.hex, /^#[0-9a-f]{6}$/)
    assert.match(m.lqip, /^data:image\/webp;base64,[A-Za-z0-9+/=]+$/)
    assert.ok(m.lqip.length < 2000, `${m.id} LQIP stays tiny`)
  }
})

test('seeds are integers (plates print them) and alt text describes every visible painting', () => {
  for (const p of PAINTINGS) {
    if (p.scene !== 'membrane') {
      assert.ok(Number.isInteger(p.seed), p.id)
      assert.match(p.alt, /^Oil-on-code study/, p.id)
    }
  }
  assert.equal(new Set(PAINTINGS.map((p) => p.id)).size, PAINTINGS.length)
})

test('lqip.css is exactly what the manifest generates', () => {
  assert.equal(readFileSync('src/app/lqip.css', 'utf8'), lqipCss(manifest))
})

test('medianCut: finds the colours of a known image, weighted by area', () => {
  // 75 % pure red, 25 % pure blue.
  const px = new Uint8Array(400 * 3)
  for (let i = 0; i < 400; i++) px.set(i < 300 ? [255, 0, 0] : [0, 0, 255], i * 3)
  const swatches = medianCut(px, 4)
  const red = swatches.filter((s) => s.hex === '#ff0000').reduce((a, s) => a + s.weight, 0)
  const blue = swatches.filter((s) => s.hex === '#0000ff').reduce((a, s) => a + s.weight, 0)
  assert.equal(red, 0.75)
  assert.equal(blue, 0.25)
  assert.equal(toHex([255, 128, 0]), '#ff8000')
})

test('paint scaling: stroke and slice pixels scale with width / 1440; seed and flags applied', () => {
  const preset = {
    width: 1440,
    height: 900,
    passes: [
      { fsFile: 'scene.frag', target: 'scene', scale: 0.5, uniforms: { uSeed: 1, uSkyTop: [0, 0, 0] } },
      {
        fsFile: 'paint.frag',
        uniforms: { uSeed: 1, uStroke: 30, uSliceBand: [0.1, 0.2, 7, 10], uSlices: 0, uBlocks: 0 },
      },
    ],
  }
  const spec = {
    id: 'x',
    scene: 'range',
    seed: 9,
    aspect: [16, 10],
    slices: true,
    blocks: false,
    alt: '',
    palette: { uSkyTop: [1, 1, 1] },
  } as const
  const [scene, paint] = passesFor(spec, preset, 2400)
  assert.equal(scene?.uniforms.uSeed, 9)
  assert.deepEqual(scene?.uniforms.uSkyTop, [1, 1, 1])
  assert.equal(paint?.uniforms.uStroke, 50)
  assert.deepEqual(paint?.uniforms.uSliceBand, [0.1, 0.2, 7 * (2400 / 1440), 10 * (2400 / 1440)])
  assert.equal(paint?.uniforms.uSlices, 1)
  assert.equal(paint?.uniforms.uBlocks, 0)
  assert.deepEqual(preset.passes[1]?.uniforms.uStroke, 30, 'the preset itself is not mutated')
})

test('formats: mono, prose and short dates; Roman numerals', () => {
  assert.equal(monoDate('2026-09-22'), '2026·09·22')
  assert.equal(proseDate('2026-09-22'), 'September 22, 2026')
  assert.equal(shortDate('2026-09-02'), 'Sep 2, 2026')
  assert.throws(() => monoDate('22/09/2026'))
  assert.throws(() => proseDate('2026-13-01'))
  assert.deepEqual([1, 2, 3, 4, 9, 14, 40].map(roman), ['I', 'II', 'III', 'IV', 'IX', 'XIV', 'XL'])
  assert.throws(() => roman(0))
})

test('keepNumberUnits joins numbers to their units with a no-break space', async () => {
  const { keepNumberUnits } = await import('../../src/lib/format.ts')
  assert.equal(keepNumberUnits('0.781 seconds'), '0.781 seconds')
  assert.equal(
    keepNumberUnits('Median 0.559 seconds across seven observations'),
    'Median 0.559 seconds across seven observations',
  )
  assert.equal(keepNumberUnits('2,115 tests passed'), '2,115 tests passed')
  assert.equal(keepNumberUnits('Preview 004 is local'), 'Preview 004 is local')
  assert.equal(keepNumberUnits('no numbers here'), 'no numbers here')
})
