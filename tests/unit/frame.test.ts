import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const css = readFileSync('src/app/globals.css', 'utf8')
const token = (name: string) => css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim()

// anthropic.com's `.u-container` measured in Chromium (D-142, D-144): viewport width, layout width
// (the last three beside a 15 px classic scrollbar), the frame's left edge and its width.
const MEASURED = [
  [320, 320, 32, 256],
  [375, 375, 32, 311],
  [390, 390, 32.5859375, 324.8203125],
  [414, 414, 33.53125, 346.9375],
  [600, 600, 40.8125, 518.3671875],
  [1280, 1265, 59.9609375, 1145.0703125],
  [1440, 1425, 70.234375, 1284.53125],
  [1920, 1905, 316.5, 1272],
] as const

// The tokens below at a 16 px root: the edge, then min(1432, 100vw) less two edges, centred in W.
function frame(vw: number, W: number) {
  const edge = Math.min(80, Math.max(32, 32 + ((vw - 375) * 3) / 76.5625))
  const width = Math.min(W, Math.min(1432, vw) - 2 * edge)
  return { left: (W - width) / 2, width }
}

test('the frame tokens are anthropic.com’s expression', () => {
  assert.equal(token('spacing-edge'), 'clamp(2rem, 2rem + (100vw - 23.4375rem) * 3 / 76.5625, 5rem)')
  assert.equal(token('container-site'), 'calc(min(89.5rem, 100vw) - var(--spacing-edge) * 2)')
  // Their line, 1.0816326530612246rem + 3.9183673469387754vw, is this one.
  assert.ok(Math.abs(2 - (23.4375 * 3) / 76.5625 - 1.0816326530612246) < 1e-15)
  assert.ok(Math.abs((3 / 76.5625) * 100 - 3.9183673469387754) < 1e-15)
})

test('the frame lands on anthropic.com’s measured boxes, beside a classic scrollbar too', () => {
  for (const [vw, W, left, width] of MEASURED) {
    const f = frame(vw, W)
    // One layout unit: Chromium snaps boxes to 1/64 px.
    assert.ok(Math.abs(f.left - left) < 1 / 64, `${vw}/${W}: left ${f.left} vs ${left}`)
    assert.ok(Math.abs(f.width - width) < 1 / 64, `${vw}/${W}: width ${f.width} vs ${width}`)
  }
})

test('frame numbers survive the CSS minifier (it rounds decimals to six digits)', () => {
  for (const name of ['spacing-edge', 'container-site']) {
    for (const n of token(name)?.match(/\d*\.?\d+/g) ?? [])
      assert.ok(n.replace('.', '').replace(/^0+/, '').length <= 6, `--${name}: ${n}`)
  }
})

test('no spacing token shares a container token name (Tailwind resolves max-w-* from spacing first)', () => {
  const names = (ns: string) => [...css.matchAll(new RegExp(`--${ns}-([a-z0-9-]+):`, 'g'))].map((x) => x[1])
  const containers = new Set(names('container'))
  assert.deepEqual(
    names('spacing').filter((n) => containers.has(n)),
    [],
  )
})
