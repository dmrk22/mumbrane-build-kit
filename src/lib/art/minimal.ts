// The hero's surface: the associate family of the helicoid and the catenoid. For every angle θ the
// surface is minimal — a soap film, a membrane at rest — so the morph never leaves the family:
//   x = cos θ · sinh v · sin u + sin θ · cosh v · cos u
//   y = −cos θ · sinh v · cos u + sin θ · cosh v · sin u
//   z = u cos θ + v sin θ
// θ = 0 is the helicoid (a ruled surface: its u-curves are straight strings), θ = π/2 the catenoid
// (the film two rings hold). The same maths runs in the vertex shader; this copy draws the static
// SVG that stands in when WebGL does not.

export type Vec3 = readonly [number, number, number]

export const V_RANGE = 1.15 // half-height of the strip in v

export function surfacePoint(u: number, v: number, theta: number): Vec3 {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  const sh = Math.sinh(v)
  const ch = Math.cosh(v)
  return [
    c * sh * Math.sin(u) + s * ch * Math.cos(u),
    -c * sh * Math.cos(u) + s * ch * Math.sin(u),
    u * c + v * s,
  ]
}

/** Rotate about the vertical axis by `yaw`, tilt by `pitch`, then a perspective divide. */
export function project([x, y, z]: Vec3, yaw: number, pitch: number, dist = 7): [number, number, number] {
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const x1 = x * cy - y * sy
  const y1 = x * sy + y * cy
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  // z is the surface's axis; it becomes the screen's vertical.
  const depth = y1 * cp - z * sp
  const up = y1 * sp + z * cp
  const k = dist / (dist + depth)
  return [x1 * k, up * k, depth]
}

/**
 * SVG path data for the string model at one θ: `strings` u-curves (each a polyline of `steps`
 * segments). Coordinates fit a `size` × `size` box centred on the origin. Pure, so it is tested.
 */
export function stringPaths(
  theta: number,
  { strings = 72, steps = 20, yaw = 0.5, pitch = 0.38, size = 1000 } = {},
): string[] {
  const scale = size / 9.5
  const paths: string[] = []
  for (let i = 0; i < strings; i++) {
    const u = -Math.PI + ((i + 0.5) / strings) * 2 * Math.PI
    let d = ''
    for (let j = 0; j <= steps; j++) {
      const v = -V_RANGE + (j / steps) * 2 * V_RANGE
      const [px, py] = project(surfacePoint(u, v, theta), yaw, pitch)
      d += `${j === 0 ? 'M' : 'L'}${(px * scale).toFixed(1)} ${(-py * scale).toFixed(1)}`
    }
    paths.push(d)
  }
  return paths
}
