// Temple H. Fay's butterfly curve (1989), the emblem of Moth:
//   x = sin t · (e^cos t − 2 cos 4t − sin⁵(t / 12))
//   y = cos t · (e^cos t − 2 cos 4t − sin⁵(t / 12)),   0 ≤ t ≤ 12π
// Pure, so the server draws it as SVG and the tests can check it.

export const BUTTERFLY_T = 12 * Math.PI

export function butterfly(t: number): [number, number] {
  const r = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.sin(t / 12) ** 5
  return [Math.sin(t) * r, Math.cos(t) * r]
}

/** SVG path data for the whole curve, scaled so one unit is `unit` px, y pointing up. */
export function butterflyPath(samples = 1600, unit = 100): string {
  let d = ''
  for (let i = 0; i <= samples; i++) {
    const [x, y] = butterfly((i / samples) * BUTTERFLY_T)
    d += `${i === 0 ? 'M' : 'L'}${(x * unit).toFixed(1)} ${(-y * unit).toFixed(1)}`
  }
  return d
}
