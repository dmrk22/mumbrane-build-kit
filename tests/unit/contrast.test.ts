import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// DESIGN §2.4: the only text/background pairs allowed. Thresholds: 4.5:1 for text, 3:1 where the
// table marks the pair "L" (display text ≥ 24 px only).
type Palette = {
  neutrals: Record<string, { hex: string }>
  pigments: Record<string, Record<'base' | 'soft' | 'fg' | 'glow' | 'ink', { hex: string }>>
}
const palette = JSON.parse(readFileSync('brand/palette/palette.json', 'utf8')) as Palette
const PIGMENTS = Object.keys(palette.pigments)
const VARIANTS = ['soft', 'fg', 'glow', 'ink'] as const

function hex(name: string): string {
  const neutral = palette.neutrals[name]
  if (neutral) return neutral.hex
  if (palette.pigments[name]) return palette.pigments[name].base.hex
  for (const v of VARIANTS) {
    const base = name.slice(0, -(v.length + 1))
    if (name.endsWith(`-${v}`) && palette.pigments[base]) return palette.pigments[base][v].hex
  }
  throw new Error(`unknown colour token: ${name}`)
}

function luminance(h: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(h.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(hex(a)), luminance(hex(b))].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

const fg = PIGMENTS.map((p) => `${p}-fg`)
const glow = PIGMENTS.map((p) => `${p}-glow`)
const PAIRS: [bg: string[], text: string[], min: number][] = [
  [['paper', 'paper-2'], ['text', 'text-2', 'text-3', ...fg], 4.5],
  [['paper-3'], ['text', 'text-2', 'text-3'], 4.5],
  [['ink', 'ink-2'], ['on-dark', 'on-dark-2', 'on-dark-3', ...glow], 4.5],
  [['deep'], ['on-dark', 'on-dark-2', 'on-dark-3', 'sulfur'], 4.5],
  [['sulfur'], ['ink', 'text-2', 'sulfur-ink'], 4.5],
  // Company blocks and outcome chips: pigment grounds with ink text, or on-dark on the deep ones.
  [['malachite', 'cinnabar', 'madder', 'ochre', 'verdigris'], ['ink'], 4.5],
  [['moss', 'iris-fg'], ['on-dark'], 4.5],
  ...PIGMENTS.map((p): [string[], string[], number] => [[`${p}-soft`], [`${p}-ink`, 'text'], 4.5]),
]

test('every allowed text/background pair meets its contrast threshold', () => {
  const failures: string[] = []
  for (const [bgs, texts, min] of PAIRS)
    for (const bg of bgs)
      for (const t of texts) {
        const ratio = contrast(t, bg)
        if (ratio < min) failures.push(`${t} on ${bg}: ${ratio.toFixed(2)} < ${min}`)
      }
  assert.deepEqual(failures, [])
})

test('the contrast maths matches known WCAG values', () => {
  // palette.json records these ratios (text, text-2, text-3 on paper).
  assert.equal(contrast('text', 'paper').toFixed(1), '16.4')
  assert.equal(contrast('text-2', 'paper').toFixed(1), '8.3')
  assert.equal(contrast('text-3', 'paper').toFixed(1), '5.8')
})

test('pairs the design forbids really do fail (the table is not vacuous)', () => {
  assert.ok(contrast('on-dark-3', 'moss') < 4.5)
  assert.ok(contrast('ink', 'iris') < 4.5)
})

test('hex comments in tokens.css match palette.json', () => {
  const css = readFileSync('brand/palette/tokens.css', 'utf8')
  const re = /--color-([a-z0-9-]+):\s*oklch\([^)]*\);\s*\/\*\s*(#[0-9a-f]{6})/g
  const seen: string[] = []
  for (const [, name, commented] of css.matchAll(re)) {
    assert.equal(commented, hex(name as string), `--color-${name}`)
    seen.push(name as string)
  }
  const expected = Object.keys(palette.neutrals).length + PIGMENTS.length * 5
  assert.equal(seen.length, expected, 'every palette colour has a token with a hex comment')
})
