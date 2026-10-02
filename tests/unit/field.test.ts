import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  aim,
  atRest,
  FACTS,
  FORMED,
  field,
  framing,
  height,
  mesh,
  PRIORITY,
  project,
  projector,
  QUESTIONS,
  RELIEF,
  ripple,
  settle,
  WELLS,
  weights,
} from '../../src/lib/art/field.ts'
import {
  createScene,
  createSheet,
  drop,
  type Question,
  quiet,
  type Scene,
  tick,
  trailOpacity,
} from '../../src/lib/art/scene.ts'

test('the sheet is pinned at the frame and dented everywhere inside', () => {
  for (let k = -10; k <= 10; k++) {
    const u = k / 10
    for (const [x, y] of [
      [u, 1],
      [u, -1],
      [1, u],
      [-1, u],
    ] as const)
      assert.ok(Math.abs(height(x, y)) < 1e-12, `pinned at ${x},${y}`)
  }
  for (let i = 1; i < 20; i++) for (let j = 1; j < 20; j++) assert.ok(height(-1 + i / 10, -1 + j / 10) < 0)
})

test('the slope is the derivative of the height', () => {
  const e = 1e-6
  for (const [x, y] of [
    [0.3, -0.2],
    [-0.55, 0.4],
    [0.1, 0.62],
  ] as const) {
    const [h, gx, gy] = field(x, y)
    assert.ok(Math.abs(h - height(x, y)) < 1e-12)
    assert.ok(Math.abs(gx - (height(x + e, y) - height(x - e, y)) / (2 * e)) < 1e-5)
    assert.ok(Math.abs(gy - (height(x, y + e) - height(x, y - e)) / (2 * e)) < 1e-5)
  }
})

test('every fact makes a well at its own spot, and the priority well is the deepest point', () => {
  FACTS.forEach((f, i) => {
    const well = WELLS[i]
    assert.ok(well && Math.hypot(well[0] - f.x, well[1] - f.y) < 0.04, `well ${i} sits by its fact`)
    const [x, y] = well
    const bottom = height(x, y)
    for (const [dx, dy] of [
      [0.02, 0],
      [-0.02, 0],
      [0, 0.02],
      [0, -0.02],
    ] as const)
      assert.ok(bottom < height(x + dx, y + dy), `well ${i} is a local minimum`)
  })
  let min = Number.POSITIVE_INFINITY
  let at: [number, number] = [0, 0]
  for (let i = 0; i <= 200; i++)
    for (let j = 0; j <= 200; j++) {
      const z = height(-1 + i / 100, -1 + j / 100)
      if (z < min) [min, at] = [z, [-1 + i / 100, -1 + j / 100]]
    }
  const p = WELLS[PRIORITY]
  assert.ok(p && Math.hypot(at[0] - p[0], at[1] - p[1]) < 0.02, `deepest at ${at}`)
})

// Regressions: the first prototype's sheet had resting places between the facts (a 1/r tail
// swamped the light wells), and speed alone called a question "at rest" at the top of a swing
// up a well's wall, up to 0.36 from any well. A rest must be at the bottom of a fact's well.
test('a question dropped anywhere on the sheet rests at the bottom of a well', () => {
  for (let i = 1; i < 20; i++)
    for (let j = 1; j < 20; j++) {
      const run = settle([-1 + i / 10, -1 + j / 10, 0, 0])
      assert.ok(run.rested, `rests from ${i},${j}`)
      const last = run.path.at(-1)
      const well = WELLS[run.end]
      assert.ok(
        last && well && Math.hypot(last[0] - well[0], last[1] - well[1]) < 0.01,
        `rests at the bottom from ${i},${j}`,
      )
    }
})

test('a question at the top of a swing is not at rest', () => {
  const p = WELLS[PRIORITY]
  assert.ok(p)
  // Still, but on the priority well's steep wall: it will roll back down.
  assert.equal(atRest({ x: p[0] + 0.12, y: p[1], vx: 0, vy: 0 }, 3), false)
  assert.equal(atRest({ x: p[0], y: p[1], vx: 0, vy: 0 }, 3), true)
  assert.equal(atRest({ x: p[0], y: p[1], vx: 0, vy: 0 }, 1), false, 'too soon after release')
})

/** Turns around the priority well, and the narrowest radius between ¼ and 1¾ turns. */
function orbit(path: readonly (readonly [number, number])[]) {
  const p = FACTS[PRIORITY]
  assert.ok(p)
  let turns = 0
  let narrowest = Number.POSITIVE_INFINITY
  let prev: number | undefined
  for (const [x, y] of path) {
    const r = Math.hypot(x - p.x, y - p.y)
    const a = Math.atan2(y - p.y, x - p.x)
    if (prev !== undefined && r < 0.8) {
      let d = a - prev
      if (d > Math.PI) d -= 2 * Math.PI
      if (d < -Math.PI) d += 2 * Math.PI
      turns += d / (2 * Math.PI)
      const n = Math.abs(turns)
      if (n > 0.25 && n < 1.75) narrowest = Math.min(narrowest, r)
    }
    prev = a
  }
  return { turns: Math.abs(turns), narrowest }
}

test('the opening: a spiral into the priority well, a light well, another spiral', () => {
  const [one, two, three] = QUESTIONS.map((q) => settle(q, 1))
  assert.ok(one && two && three)
  for (const run of [one, two, three]) assert.ok(run.rested && run.time < 12, `rests in ${run.time} s`)
  assert.equal(one.end, PRIORITY)
  assert.notEqual(two.end, PRIORITY)
  assert.equal(three.end, PRIORITY)
  const spiral = orbit(one.path)
  assert.ok(spiral.turns >= 2, `turns ${spiral.turns}`)
  assert.ok(spiral.narrowest >= 0.08, `stays wide: ${spiral.narrowest}`)
  assert.ok(orbit(three.path).turns >= 2)
})

test('the landing settles: full weights and still water once the field has formed', () => {
  assert.deepEqual(weights(0), [0, 0, 0, 0, 0])
  for (const k of weights(FORMED)) assert.ok(Math.abs(k - 1) < 1e-6)
  for (let i = 0; i <= 10; i++) assert.equal(ripple(-0.9 + i * 0.18, 0.1, FORMED), 0)
  assert.ok(Math.abs(ripple(0.3, 0.2, 2.2)) > 0, 'ripples run while the facts land')
})

test('mesh, framing and projection have the expected shape', () => {
  const lines = mesh(10, 20)
  assert.equal(lines.length, 22)
  for (const l of lines) assert.equal(l.length, 21)
  const cam = framing(900, 800)
  assert.equal(cam.cx, 540, 'a wide stage puts the field right of centre')
  assert.equal(framing(400, 400).cx, 200)
  const [x, y, depth] = project([0, 0, 0], cam)
  assert.deepEqual([x, y, depth], [cam.cx, cam.cy, 0])
})

// The timeline (scene.ts): ticked at 60 fps, as the canvas does.
function run(scene: Scene, from: number, seconds: number, onRest?: (q: Question) => void): number {
  const dt = 1 / 60
  let t = from
  for (let i = 0; i < seconds * 60; i++) {
    t += dt
    const rested = tick(scene, t, dt)
    if (rested) onRest?.(rested)
  }
  return t
}

test('the opening plays three questions once, silently, then the field goes quiet', () => {
  const scene = createScene()
  const announced: Question[] = []
  run(scene, 0, 60, (q) => announced.push(q))
  assert.equal(scene.played, QUESTIONS.length)
  assert.equal(scene.count, QUESTIONS.length, 'no fourth question on its own')
  assert.equal(scene.q?.rest, true, 'the last answer stays on the sheet')
  assert.equal(scene.q?.end, PRIORITY)
  assert.equal(trailOpacity(scene), 1, 'the last answer does not fade')
  assert.ok(quiet(scene))
  assert.deepEqual(announced, [], 'opening questions are not announced')
})

test('a visitor drop wakes the field and is announced once, where it rests', () => {
  const scene = createScene()
  const t = run(scene, 0, 60)
  const second = QUESTIONS[1]
  assert.ok(second)
  drop(scene, second, true)
  assert.equal(scene.phase, 'settling')
  assert.equal(quiet(scene), false)
  const announced: Question[] = []
  run(scene, t, 15, (q) => announced.push(q))
  assert.equal(announced.length, 1)
  assert.equal(announced[0]?.n, QUESTIONS.length + 1)
  assert.notEqual(announced[0]?.end, PRIORITY, 'the second opening path ends in a light well')
  assert.ok(quiet(scene))
})

test('the sheet freezes its heights once formed and only picks visible points', () => {
  const sheet = createSheet(8)
  const flat = projector({ yaw: 0, pitch: Math.PI / 2, dist: 1e6, scale: 100, cx: 0, cy: 0 })
  sheet.update(FORMED, [], flat)
  const formed = Array.from(sheet.h)
  sheet.update(FORMED + 10, [], flat)
  assert.deepEqual(Array.from(sheet.h), formed)
  const centre = 4 * sheet.n + 4 // the vertex at (0, 0)
  assert.equal(sheet.pick(sheet.sx[centre] ?? 0, sheet.sy[centre] ?? 0), centre)
  assert.equal(sheet.pick(5000, 5000), -1, 'nothing within reach')
  assert.equal(sheet.sa[0], 0, 'the pinned corner is faded out')
})

test('the figure shrinks by a factor, and aim centres its core on a point', () => {
  assert.ok(Math.abs(framing(1200, 860, 0.85).scale - 0.85 * framing(1200, 860).scale) < 1e-9)
  const cam = aim(framing(1200, 860, 0.85), 700, 410)
  const to = projector(cam)
  const out = new Float64Array(3)
  const xs: number[] = []
  const ys: number[] = []
  for (const [x, y] of WELLS) {
    to(x, y, height(x, y) * RELIEF, out)
    xs.push(out[0] ?? 0)
    ys.push(out[1] ?? 0)
  }
  assert.ok(Math.abs((Math.min(...xs) + Math.max(...xs)) / 2 - 700) < 1e-6, 'centred across')
  assert.ok(Math.abs((Math.min(...ys) + Math.max(...ys)) / 2 - 410) < 1e-6, 'centred down')
  const again = aim({ ...cam }, 700, 410)
  assert.ok(Math.abs(again.cx - cam.cx) < 1e-9 && Math.abs(again.cy - cam.cy) < 1e-9, 'idempotent')
})
