import assert from 'node:assert/strict'
import { test } from 'node:test'
import { stringPaths, surfacePoint } from '../../src/lib/art/minimal.ts'

const close = (a: readonly number[], b: readonly number[]) =>
  a.every((x, i) => Math.abs(x - (b[i] ?? Number.NaN)) < 1e-12)

test('the associate family is the helicoid at θ = 0 and the catenoid at θ = π/2', () => {
  for (const [u, v] of [
    [0.3, -0.7],
    [-2.1, 0.4],
    [Math.PI, 1.1],
  ] as const) {
    const helicoid = [Math.sinh(v) * Math.sin(u), -Math.sinh(v) * Math.cos(u), u]
    const catenoid = [Math.cosh(v) * Math.cos(u), Math.cosh(v) * Math.sin(u), v]
    assert.ok(close(surfacePoint(u, v, 0), helicoid), `helicoid at ${u}, ${v}`)
    assert.ok(close(surfacePoint(u, v, Math.PI / 2), catenoid), `catenoid at ${u}, ${v}`)
  }
})

test('the bend is an isometry: distance along a string is the same at every θ', () => {
  // |∂x/∂v| = cosh v for every θ in the family, so a string's length never changes.
  const length = (theta: number) => {
    let sum = 0
    for (let i = 0; i < 2000; i++) {
      const a = surfacePoint(0.8, -1 + i / 1000, theta)
      const b = surfacePoint(0.8, -1 + (i + 1) / 1000, theta)
      sum += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])
    }
    return sum
  }
  const expected = 2 * Math.sinh(1)
  for (const theta of [0, 0.4, 1.2, Math.PI / 2]) assert.ok(Math.abs(length(theta) - expected) < 1e-4)
})

test('stringPaths draws one polyline per string, inside its box', () => {
  const paths = stringPaths(0.36 * Math.PI, { strings: 12, steps: 8, size: 1000 })
  assert.equal(paths.length, 12)
  for (const d of paths) {
    assert.match(d, /^M/)
    assert.equal(d.split('L').length - 1, 8)
    for (const n of d.match(/-?\d+(\.\d+)?/g) ?? []) assert.ok(Math.abs(Number(n)) <= 500, d)
  }
})
