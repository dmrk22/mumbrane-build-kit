import assert from 'node:assert/strict'
import { test } from 'node:test'
import { contours, height, mesh, project, searchPath, WELLS } from '../../src/lib/art/field.ts'

test('the answer is the deepest point of the field; the candidate is a real local minimum', () => {
  let min = Number.POSITIVE_INFINITY
  let at: [number, number] = [0, 0]
  for (let i = 0; i <= 200; i++)
    for (let j = 0; j <= 200; j++) {
      const x = -1 + i / 100
      const y = -1 + j / 100
      const z = height(x, y)
      if (z < min) [min, at] = [z, [x, y]]
    }
  assert.ok(Math.hypot(at[0] - WELLS.answer.x, at[1] - WELLS.answer.y) < 0.06, `minimum at ${at}`)
  const c = WELLS.candidate
  const centre = height(c.x, c.y)
  for (const [dx, dy] of [
    [0.12, 0],
    [-0.12, 0],
    [0, 0.12],
    [0, -0.12],
  ] as const)
    assert.ok(centre < height(c.x + dx, c.y + dy), 'the candidate dips below its surroundings')
})

test('the search path starts high, passes the candidate and ends in the answer', () => {
  const path = searchPath(140)
  const first = path[0]
  const last = path.at(-1)
  assert.ok(first && last)
  assert.ok(first[2] > last[2], 'it descends')
  assert.ok(Math.hypot(last[0] - WELLS.answer.x, last[1] - WELLS.answer.y) < 1e-9)
  const nearest = Math.min(...path.map(([x, y]) => Math.hypot(x - WELLS.candidate.x, y - WELLS.candidate.y)))
  assert.ok(nearest < 0.06, `closest approach to the candidate ${nearest}`)
})

test('mesh, contours and projection have the expected shape', () => {
  const lines = mesh(10, 20)
  assert.equal(lines.length, 22)
  for (const l of lines) assert.equal(l.length, 21)
  assert.equal(contours(3, 32).length, 6)
  const cam = { yaw: 0.3, pitch: 0.5, scale: 100, cx: 320, cy: 260 }
  assert.deepEqual(project([0, 0, 0], cam), [320, 260])
})
