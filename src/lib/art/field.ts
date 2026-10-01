// The membrane (D-137): Mumbrane's field as a rubber sheet. Facts are weights that dent it, the
// priority fact the heaviest; a question rolls across it and comes to rest in a well. A ball on a
// sheet, not charges in space (D-134). Pure maths: the canvas animates it, the server draws its
// still as SVG, tests check it.

export type Pt2 = readonly [number, number]
export type Pt3 = readonly [number, number, number]
export type Camera = { yaw: number; pitch: number; scale: number; cx: number; cy: number; dist: number }
export type Fact = { x: number; y: number; m: number; w: number; priority?: true }
export type Ball = { x: number; y: number; vx: number; vy: number }
export type Start = readonly [x: number, y: number, vx: number, vy: number]
export type Splash = { x: number; y: number; t: number }

/**
 * Four light facts and the priority fact, on a sheet spanning [−1, 1]². Light wells fall off like
 * a Lorentzian; the priority well is a softened 1/r, whose 1/r² pull keeps orbits stable, so a
 * question spirals into it (under a 1/r³ pull every orbit collapses through the centre).
 */
export const FACTS: readonly Fact[] = [
  { x: -0.62, y: 0.42, m: 0.26, w: 0.13 },
  { x: 0.24, y: 0.66, m: 0.22, w: 0.12 },
  { x: 0.68, y: 0.38, m: 0.27, w: 0.13 },
  { x: -0.5, y: -0.6, m: 0.24, w: 0.12 },
  { x: 0.08, y: -0.1, m: 0.38, w: 0.12, priority: true },
]
export const PRIORITY = 4

/** When each fact appears above the sheet (s); it touches down FALL later and bobs to its weight. */
export const LANDING = [0.3, 0.55, 0.8, 1.05, 1.45] as const
export const FALL = 0.34
/** By then every weight has settled and every landing ripple has died away. */
export const FORMED = 4.8

/**
 * The opening questions: the first spirals into the priority well past a candidate, the second
 * crosses the sheet and rests at a light fact, the third spirals in from the other side.
 */
export const QUESTIONS = [
  [-0.08, 0.86, 0.851, -0.292],
  [-0.86, -0.86, -0.17, 0.782],
  [0.86, 0.57, 0.106, -0.489],
] as const satisfies readonly Start[]

/**
 * Gravity along the sheet, light drag on the open slopes and a soft floor in every well: the
 * floor catches a question once it reaches the bottom, so orbits stay wide and rests stay short.
 */
export const PHYSICS = {
  g: 9,
  drag: 0.15,
  floor: 3,
  floorR2: 0.0064,
  dt: 1 / 240,
  restSpeed: 0.02,
  restSlope: 0.1,
  minAge: 1.5,
}

/** Vertical exaggeration for drawing; the physics uses the true heights. */
export const RELIEF = 1.5
const EDGE = 0.97 // a question never reaches the pinned frame
const SETTLED: readonly number[] = FACTS.map(() => 1)

/** Each fact's weight at scene time t: 0 until it touches down, then an under-damped spring to 1. */
export function weights(t: number): number[] {
  return LANDING.map((at) => {
    const s = t - at - FALL
    return s <= 0 ? 0 : 1 - Math.exp(-6 * s) * Math.cos(12 * s)
  })
}

/** Height of the sheet at (x, y): the weighted wells, pinned to 0 at the frame. */
export function height(x: number, y: number, w: readonly number[] = SETTLED): number {
  let s = 0
  for (let i = 0; i < FACTS.length; i++) {
    const f = FACTS[i]
    const k = w[i] ?? 0
    if (!f || k === 0) continue
    const u = 1 + ((x - f.x) ** 2 + (y - f.y) ** 2) / (f.w * f.w)
    s += (k * f.m) / (f.priority ? Math.sqrt(u) : u)
  }
  return -(1 - x * x) * (1 - y * y) * s
}

/** The height and its slope at (x, y): [h, ∂h/∂x, ∂h/∂y]. */
export function field(x: number, y: number, w: readonly number[] = SETTLED): [number, number, number] {
  let s = 0
  let sx = 0
  let sy = 0
  for (let i = 0; i < FACTS.length; i++) {
    const f = FACTS[i]
    const k = w[i] ?? 0
    if (!f || k === 0) continue
    const dx = x - f.x
    const dy = y - f.y
    const u = 1 + (dx * dx + dy * dy) / (f.w * f.w)
    const m = k * f.m
    // d/dx of m/√u is −m·dx/(w²·u^1.5); of m/u it is −2m·dx/(w²·u²).
    const d = f.priority ? -m / (f.w * f.w * u * Math.sqrt(u)) : (-2 * m) / (f.w * f.w * u * u)
    s += f.priority ? m / Math.sqrt(u) : m / u
    sx += d * dx
    sy += d * dy
  }
  const bx = 1 - x * x
  const by = 1 - y * y
  return [-bx * by * s, 2 * x * by * s - bx * by * sx, 2 * y * bx * s - bx * by * sy]
}

/** Rings sent out by each landing and by every drop. Drawn, never felt by a question. */
export function ripple(x: number, y: number, t: number, splashes: readonly Splash[] = []): number {
  let z = 0
  for (let i = 0; i < FACTS.length; i++) {
    const f = FACTS[i]
    const s = t - (LANDING[i] ?? 0) - FALL
    if (!f || s <= 0 || s > 3) continue
    const d = Math.hypot(x - f.x, y - f.y) - 1.1 * s
    z += 0.16 * f.m * Math.exp(-s / 0.75) * Math.sin(11 * d) * Math.exp((-d * d) / 0.06)
  }
  for (const p of splashes) {
    const s = t - p.t
    if (s <= 0 || s > 2.5) continue
    const d = Math.hypot(x - p.x, y - p.y) - 1.1 * s
    z += 0.025 * Math.exp(-s / 0.6) * Math.sin(11 * d) * Math.exp((-d * d) / 0.05)
  }
  return z * (1 - x * x) * (1 - y * y)
}

/**
 * Where each fact's dent bottoms out on the settled sheet: the frame pin and the neighbours shift
 * it up to 0.03 from the fact. Beads sit here, and questions come to rest here.
 */
export const WELLS: readonly Pt2[] = FACTS.map((f) => {
  let x = f.x
  let y = f.y
  for (let k = 0; k < 300; k++) {
    const [, gx, gy] = field(x, y)
    x -= 0.01 * gx
    y -= 0.01 * gy
  }
  return [x, y] as const
})

/** The well nearest to (x, y), by fact index. */
export function nearest(x: number, y: number): number {
  let best = 0
  let bd = Number.POSITIVE_INFINITY
  WELLS.forEach(([wx, wy], i) => {
    const d = (x - wx) ** 2 + (y - wy) ** 2
    if (d < bd) [best, bd] = [i, d]
  })
  return best
}

/** One fixed step (PHYSICS.dt): semi-implicit Euler, slope-normalised gravity, drag, soft floors. */
export function step(b: Ball, w: readonly number[] = SETTLED): void {
  const [, gx, gy] = field(b.x, b.y, w)
  const n = 1 + gx * gx + gy * gy
  let d2 = Number.POSITIVE_INFINITY
  for (const [wx, wy] of WELLS) d2 = Math.min(d2, (b.x - wx) ** 2 + (b.y - wy) ** 2)
  const c = PHYSICS.drag + PHYSICS.floor * Math.exp(-d2 / PHYSICS.floorR2)
  b.vx += ((-PHYSICS.g * gx) / n - c * b.vx) * PHYSICS.dt
  b.vy += ((-PHYSICS.g * gy) / n - c * b.vy) * PHYSICS.dt
  b.x = Math.min(EDGE, Math.max(-EDGE, b.x + b.vx * PHYSICS.dt))
  b.y = Math.min(EDGE, Math.max(-EDGE, b.y + b.vy * PHYSICS.dt))
}

/**
 * At rest: still, on level ground, after long enough to have left the rim. Speed alone is not
 * enough: a question swinging up a well's wall stops for an instant at the top of every swing.
 */
export function atRest(b: Ball, age: number, w: readonly number[] = SETTLED): boolean {
  if (age <= PHYSICS.minAge || Math.hypot(b.vx, b.vy) >= PHYSICS.restSpeed) return false
  const [, gx, gy] = field(b.x, b.y, w)
  return Math.hypot(gx, gy) < PHYSICS.restSlope
}

/** Runs a question until it rests (or 20 s of model time pass): its path, every `every` steps. */
export function settle(
  [x, y, vx, vy]: Start,
  every = 3,
): { path: Pt2[]; end: number; time: number; rested: boolean } {
  const b: Ball = { x, y, vx, vy }
  const path: Pt2[] = [[x, y]]
  const steps = Math.round(20 / PHYSICS.dt)
  for (let k = 1; k <= steps; k++) {
    step(b)
    if (k % every === 0) path.push([b.x, b.y])
    if (atRest(b, k * PHYSICS.dt)) {
      path.push([b.x, b.y])
      return { path, end: nearest(b.x, b.y), time: k * PHYSICS.dt, rested: true }
    }
  }
  return { path, end: nearest(b.x, b.y), time: 20, rested: false }
}

/** Opacity near the sheet's edge: the pinned frame fades out, so the sheet never shows a border. */
export function sheetAlpha(x: number, y: number): number {
  const e = Math.min(1, Math.max(0, (1 - Math.max(Math.abs(x), Math.abs(y))) / 0.35))
  return e * e * (3 - 2 * e)
}

/** The camera for a stage of w × h px: on a wide stage (the desktop layer) the field sits right. */
export function framing(w: number, h: number): Camera {
  const wide = w > h * 1.05
  return {
    yaw: -0.5,
    pitch: 0.55,
    dist: 3.4,
    scale: 430 * Math.min(w / 900, h / 800),
    cx: w * (wide ? 0.6 : 0.5),
    cy: h * (wide ? 0.42 : 0.44),
  }
}

/**
 * Turn about the vertical axis, tilt toward the viewer, perspective from `dist`. The returned
 * function writes the screen point and how far into the scene it lies (positive is toward the
 * horizon) into `out`: the trigonometry is worked out once per camera, and nothing is allocated,
 * so the canvas can project its whole mesh every frame.
 */
export function projector(cam: Camera): (x: number, y: number, z: number, out: Float64Array) => void {
  const cy = Math.cos(cam.yaw)
  const sy = Math.sin(cam.yaw)
  const cp = Math.cos(cam.pitch)
  const sp = Math.sin(cam.pitch)
  return (x, y, z, out) => {
    const xr = x * cy - y * sy
    const yr = x * sy + y * cy
    const k = cam.dist / (cam.dist + yr * cp - z * sp)
    out[0] = cam.cx + xr * k * cam.scale
    out[1] = cam.cy - (yr * sp + z * cp) * k * cam.scale
    out[2] = yr
  }
}

/** One point through `projector`: [screen x, screen y, depth]. */
export function project([x, y, z]: Pt3, cam: Camera): [number, number, number] {
  const out = new Float64Array(3)
  projector(cam)(x, y, z, out)
  return [out[0] ?? 0, out[1] ?? 0, out[2] ?? 0]
}

/** A fact's bead radius in px: the priority fact reads as the heaviest. */
export function bead(f: Fact): number {
  return f.priority ? 6 : 2.4 + (1.6 * f.m) / 0.22
}

/** The settled sheet as `lines` lines each way of `samples` points, inside the faded edge. */
export function mesh(lines = 24, samples = 48, inset = 0.86): Pt3[][] {
  const out: Pt3[][] = []
  for (let i = 0; i <= lines; i++) {
    const a = -inset + (2 * inset * i) / lines
    const along: Pt3[] = []
    const across: Pt3[] = []
    for (let j = 0; j <= samples; j++) {
      const b = -inset + (2 * inset * j) / samples
      along.push([b, a, height(b, a) * RELIEF])
      across.push([a, b, height(a, b) * RELIEF])
    }
    out.push(along, across)
  }
  return out
}

/** SVG `points` for a projected polyline. */
export function points(line: readonly Pt3[], cam: Camera): string {
  return line
    .map((p) =>
      project(p, cam)
        .slice(0, 2)
        .map((v) => v.toFixed(1))
        .join(','),
    )
    .join(' ')
}
