import assert from 'node:assert/strict'
import { test } from 'node:test'
import { BUTTERFLY_T, butterfly, butterflyPath } from '../../src/lib/art/curves.ts'

test('the butterfly curve starts at (0, e − 2) and closes after 12π', () => {
  const [x0, y0] = butterfly(0)
  assert.ok(Math.abs(x0) < 1e-12)
  assert.ok(Math.abs(y0 - (Math.E - 2)) < 1e-12)
  const [x1, y1] = butterfly(BUTTERFLY_T)
  assert.ok(Math.hypot(x1 - x0, y1 - y0) < 1e-9)
})

test('the path is one polyline inside the figure box', () => {
  const d = butterflyPath(400)
  assert.equal(d.split('L').length - 1, 400)
  const n = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)
  for (let i = 0; i < n.length; i += 2) {
    assert.ok(Math.abs(n[i] ?? 0) <= 400, `x ${n[i]}`)
    assert.ok((n[i + 1] ?? 0) >= -470 && (n[i + 1] ?? 0) <= 310, `y ${n[i + 1]}`)
  }
})
