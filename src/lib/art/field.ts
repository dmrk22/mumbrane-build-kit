// The field: Mumbrane's energy landscape, after the original mumbrane.com hero. A tilted plane with
// two wells — a shallow candidate and a deep answer — drawn as a wireframe, the wells echoed as
// dotted contours on the floor, and a search path that passes the candidate and settles in the
// answer. Pure maths: the canvas animates it, the server draws its still as SVG, tests check it.

export type Pt2 = readonly [number, number]
export type Pt3 = readonly [number, number, number]
export type Camera = { yaw: number; pitch: number; scale: number; cx: number; cy: number }

export const WELLS = {
  candidate: { x: -0.3, y: 0.06, depth: 0.15, width: 0.16 },
  answer: { x: 0.36, y: -0.42, depth: 0.44, width: 0.3 },
} as const

const FLOOR = -0.82 // the plane the contours are drawn on, below the deepest well
const LIFT = 0.012 // the path rides just above the surface so the mesh never cuts it

/** Height of the field at (x, y) in [−1, 1]²: the back (y = 1) is higher than the front. */
export function height(x: number, y: number, amp = 1): number {
  let z = 0.2 * y + 0.04 * x
  for (const w of Object.values(WELLS))
    z -= w.depth * Math.exp(-((x - w.x) ** 2 + (y - w.y) ** 2) / (2 * w.width ** 2))
  return z * amp
}

/** Turn about the vertical axis, tilt towards the viewer, then a gentle perspective. */
export function project([x, y, z]: Pt3, cam: Camera): [number, number] {
  const cy = Math.cos(cam.yaw)
  const sy = Math.sin(cam.yaw)
  const xr = x * cy - y * sy
  const yr = x * sy + y * cy
  const cp = Math.cos(cam.pitch)
  const sp = Math.sin(cam.pitch)
  const up = yr * sp + z * cp
  const depth = -yr * cp + z * sp
  const k = 6 / (6 - depth)
  return [cam.cx + xr * k * cam.scale, cam.cy - up * k * cam.scale]
}

/** Grid lines across the field in both directions: `n` lines of `m` points each way. */
export function mesh(n = 22, m = 44, amp = 1): Pt3[][] {
  const lines: Pt3[][] = []
  for (let i = 0; i <= n; i++) {
    const a = -1 + (2 * i) / n
    const along: Pt3[] = []
    const across: Pt3[] = []
    for (let j = 0; j <= m; j++) {
      const b = -1 + (2 * j) / m
      along.push([b, a, height(b, a, amp)])
      across.push([a, b, height(a, b, amp)])
    }
    lines.push(along, across)
  }
  return lines
}

const lerp2 = (a: Pt2, b: Pt2, t: number): Pt2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const quad = (p0: Pt2, c: Pt2, p1: Pt2, t: number): Pt2 => lerp2(lerp2(p0, c, t), lerp2(c, p1, t), t)

// Two quadratic arcs with a shared tangent at the candidate, so the path bends past it smoothly.
const P0: Pt2 = [-0.06, 0.92]
const C1: Pt2 = [-0.46, 0.46]
const P1: Pt2 = [WELLS.candidate.x + 0.04, WELLS.candidate.y + 0.02]
const C2: Pt2 = [P1[0] + (P1[0] - C1[0]) * 0.9, P1[1] + (P1[1] - C1[1]) * 0.9]
const P2: Pt2 = [WELLS.answer.x, WELLS.answer.y]

/** The search path: `samples` points from the start, past the candidate, into the answer. */
export function searchPath(samples = 140, amp = 1): Pt3[] {
  const out: Pt3[] = []
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const [x, y] = t < 0.5 ? quad(P0, C1, P1, t * 2) : quad(P1, C2, P2, (t - 0.5) * 2)
    out.push([x, y, height(x, y, amp) + LIFT])
  }
  return out
}

/** Dotted contour rings on the floor under each well (`rings` per well, `m` points each). */
export function contours(rings = 3, m = 64): Pt3[][] {
  const out: Pt3[][] = []
  for (const w of Object.values(WELLS)) {
    for (let r = 1; r <= rings; r++) {
      const rad = w.width * 0.55 * r
      const ring: Pt3[] = []
      for (let j = 0; j <= m; j++) {
        const a = (j / m) * 2 * Math.PI
        ring.push([w.x + rad * Math.cos(a), w.y + rad * Math.sin(a), FLOOR])
      }
      out.push(ring)
    }
  }
  return out
}

/** A well's floor point and its surface point (the dotted drop line between them). */
export function wellPoints(id: keyof typeof WELLS, amp = 1): { surface: Pt3; floor: Pt3 } {
  const w = WELLS[id]
  return { surface: [w.x, w.y, height(w.x, w.y, amp) + LIFT], floor: [w.x, w.y, FLOOR] }
}

/** SVG `points` for a projected polyline. */
export function points(line: readonly Pt3[], cam: Camera): string {
  return line
    .map((p) =>
      project(p, cam)
        .map((v) => v.toFixed(1))
        .join(','),
    )
    .join(' ')
}
