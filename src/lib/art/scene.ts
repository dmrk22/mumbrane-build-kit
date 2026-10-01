// The membrane's timeline and its drawable sheet (D-137): the facts land, three opening questions
// settle one after another, then the field rests until a visitor drops another. Pure state the
// canvas reads every frame (FieldCanvas), so the schedule is unit-tested without a browser.

import {
  atRest,
  type Ball,
  FORMED,
  height,
  nearest,
  PHYSICS,
  PRIORITY,
  QUESTIONS,
  RELIEF,
  ripple,
  type Splash,
  type Start,
  sheetAlpha,
  step,
  WELLS,
  weights,
} from './field.ts'

export type Question = {
  b: Ball
  n: number
  age: number // model seconds since release
  k: number // steps taken; every third one leaves a trail point
  trail: number[] // x, y, z triples on the sheet
  rest: boolean
  restAt: number
  end: number
  visitor: boolean
}
export type Phase = 'forming' | 'settling' | 'rest' | 'idle'
export type Scene = {
  t: number
  acc: number
  played: number
  hold: number
  count: number
  q: Question | null
  splashes: Splash[]
  candidate: { i: number; t: number }
  phase: Phase
}

export const START = 2.5 // the first question sets off once the facts have landed
export const HOLD = 3.4 // seconds an opening answer stays before the next question
export const FADE = 0.8
export const SPEED = 1.6 // model seconds per second on screen
export const LIFT = 0.012 // trails ride just above the sheet so the mesh never cuts them

export function createScene(): Scene {
  return {
    t: 0,
    acc: 0,
    played: 0,
    hold: 0,
    count: 0,
    q: null,
    splashes: [],
    candidate: { i: -1, t: -9 },
    phase: 'forming',
  }
}

const lifted = (x: number, y: number, w: readonly number[]) => height(x, y, w) * RELIEF + LIFT

/** Releases a question; a visitor's question is announced when it comes to rest. */
export function drop(s: Scene, [x, y, vx, vy]: Start, visitor: boolean): void {
  s.q = {
    b: { x, y, vx, vy },
    n: ++s.count,
    age: 0,
    k: 0,
    trail: [x, y, lifted(x, y, weights(s.t))],
    rest: false,
    restAt: 0,
    end: -1,
    visitor,
  }
  s.hold = 0
  s.acc = 0
  s.phase = 'settling'
}

/**
 * Advances the scene to time t. Returns the visitor's question in the step it comes to rest, so
 * the figure can announce it; opening questions rest silently.
 */
export function tick(s: Scene, t: number, dt: number): Question | undefined {
  s.t = t
  s.splashes = s.splashes.filter((p) => t - p.t < 2.5)
  const next = QUESTIONS[s.played]
  if (!s.q && t > START && next) {
    s.played++
    drop(s, next, false)
  }
  const q = s.q
  if (!q) return undefined
  if (q.rest) {
    s.hold += dt
    if (s.hold > HOLD + FADE && s.played < QUESTIONS.length) s.q = null
    return undefined
  }
  const w = weights(t)
  s.acc += dt * SPEED
  for (let k = 0; s.acc >= PHYSICS.dt && k < 80; k++) {
    s.acc -= PHYSICS.dt
    step(q.b, w)
    q.age += PHYSICS.dt
    const { x, y } = q.b
    if (++q.k % 3 === 0) q.trail.push(x, y, lifted(x, y, w))
    WELLS.forEach(([wx, wy], i) => {
      if (i !== PRIORITY && Math.hypot(x - wx, y - wy) < 0.09) s.candidate = { i, t }
    })
    if (atRest(q.b, q.age, w)) {
      q.rest = true
      q.restAt = t
      q.end = nearest(x, y)
      q.trail.push(x, y, lifted(x, y, w))
      s.phase = 'rest'
      return q.visitor ? q : undefined
    }
  }
  return undefined
}

/** Nothing left to animate: formed, the opening over, the last answer settled in. */
export function quiet(s: Scene): boolean {
  const q = s.q
  return (
    s.t >= FORMED &&
    s.splashes.length === 0 &&
    s.played >= QUESTIONS.length &&
    (!q || (q.rest && s.t - q.restAt > 1.4))
  )
}

/** An opening answer fades before the next question; the last one, and a visitor's, stay. */
export function trailOpacity(s: Scene): number {
  const q = s.q
  if (!q?.rest || s.played >= QUESTIONS.length || s.hold <= HOLD) return 1
  return Math.max(0, 1 - (s.hold - HOLD) / FADE)
}

export type Sheet = ReturnType<typeof createSheet>

/**
 * The sheet as a (cells + 1)² vertex grid, refreshed each frame into reusable arrays: heights
 * (cached once the field has formed — asking never changes it), screen positions through the
 * camera's projector, and opacity (the faded edge and the horizon).
 */
export function createSheet(cells: number) {
  const n = cells + 1
  const gx = new Float32Array(n * n)
  const gy = new Float32Array(n * n)
  const edge = new Float32Array(n * n)
  const base = new Float32Array(n * n)
  const h = new Float32Array(n * n)
  const sx = new Float32Array(n * n)
  const sy = new Float32Array(n * n)
  const sa = new Float32Array(n * n)
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const x = -1 + (2 * i) / cells
      const y = -1 + (2 * j) / cells
      gx[j * n + i] = x
      gy[j * n + i] = y
      edge[j * n + i] = sheetAlpha(x, y)
    }
  let formed = false
  const out = new Float64Array(3)
  return {
    cells,
    n,
    gx,
    gy,
    h,
    sx,
    sy,
    sa,
    update(
      t: number,
      splashes: readonly Splash[],
      to: (x: number, y: number, z: number, out: Float64Array) => void,
    ) {
      if (!formed && t >= FORMED) {
        for (let id = 0; id < n * n; id++) base[id] = height(gx[id] ?? 0, gy[id] ?? 0)
        formed = true
      }
      const w = weights(t)
      const rippling = !formed || splashes.length > 0
      for (let id = 0; id < n * n; id++) {
        const x = gx[id] ?? 0
        const y = gy[id] ?? 0
        let z = formed ? (base[id] ?? 0) : height(x, y, w)
        if (rippling) z += ripple(x, y, t, splashes)
        h[id] = z
        to(x, y, z * RELIEF, out)
        sx[id] = out[0] ?? 0
        sy[id] = out[1] ?? 0
        const far = Math.min(1, Math.max(0, ((out[2] ?? 0) - 0.25) / 0.95))
        sa[id] = (edge[id] ?? 0) * (1 - far * far * (3 - 2 * far))
      }
    },
    /** The vertex nearest to screen point (x, y), at least ¼ visible and within 30 px; or −1. */
    pick(x: number, y: number): number {
      let best = -1
      let bd = 30 * 30
      for (let id = 0; id < n * n; id++) {
        if ((sa[id] ?? 0) < 0.25) continue
        const d = ((sx[id] ?? 0) - x) ** 2 + ((sy[id] ?? 0) - y) ** 2
        if (d < bd) [best, bd] = [id, d]
      }
      return best
    },
  }
}
