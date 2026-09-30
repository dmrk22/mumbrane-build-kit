import assert from 'node:assert/strict'
import { test } from 'node:test'
import { band, border, prng, rosette } from '../../src/lib/art/guilloche.ts'

const numbers = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)

test('prng is deterministic per seed and uniform-ish in [0, 1)', () => {
  const a = prng(3)
  const b = prng(3)
  const xs = Array.from({ length: 1000 }, () => a())
  assert.deepEqual(
    xs.slice(0, 5),
    Array.from({ length: 5 }, () => b()),
  )
  assert.ok(xs.every((x) => x >= 0 && x < 1))
  const mean = xs.reduce((s, x) => s + x, 0) / xs.length
  assert.ok(Math.abs(mean - 0.5) < 0.05)
  assert.notDeepEqual(prng(4)(), prng(3)())
})

test('band: 24–40 lines spanning the width, 1-decimal coordinates, inside the box', () => {
  for (const seed of [1, 2, 3, 99]) {
    const lines = band(seed, 1440, 240)
    assert.ok(lines.length >= 24 && lines.length <= 40, `seed ${seed}: ${lines.length}`)
    for (const d of lines) {
      assert.match(d, /^M0 /)
      for (const n of numbers(d))
        assert.ok(Number.isInteger(n * 10) || Math.abs(n * 10 - Math.round(n * 10)) < 1e-9)
      const ys = numbers(d).filter((_, i) => i % 2 === 1)
      assert.ok(Math.min(...ys) >= 0 && Math.max(...ys) <= 240)
    }
  }
  assert.equal(band(5), band(5), 'memoised: the same array for the same arguments')
})

test('rosette: 3–6 closed rings inside the square', () => {
  const rings = rosette(7, 200)
  assert.ok(rings.length >= 3 && rings.length <= 6)
  for (const d of rings) {
    assert.ok(d.endsWith('Z'))
    const n = numbers(d)
    assert.ok(Math.min(...n) >= 0 && Math.max(...n) <= 200, 'within the square')
  }
})

test('border: two interlaced strands around the frame', () => {
  const strands = border(1, 1200, 630, 24)
  assert.equal(strands.length, 2)
  assert.notEqual(strands[0], strands[1])
  for (const d of strands) {
    const xs = numbers(d).filter((_, i) => i % 2 === 0)
    assert.ok(Math.min(...xs) < 24 + 8 && Math.max(...xs) > 1200 - 24 - 8, 'reaches both sides')
  }
})
