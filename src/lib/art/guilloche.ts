// Security-print line work (DESIGN §8.4): seeded, deterministic SVG path data, coordinates
// rounded to 1 decimal, memoised. Pure: rendered by server components, never animated except the
// seal's draw-on.

/** mulberry32: a tiny seeded PRNG (the same seed always draws the same pattern). */
export function prng(seed: number): () => number {
  let a = seed >>> 0 || 0x9e3779b9
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const r1 = (n: number) => Math.round(n * 10) / 10

function polyline(points: readonly (readonly [number, number])[]): string {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${r1(x)} ${r1(y)}`).join('')
}

const cache = new Map<string, string[]>()
function memo(key: string, make: () => string[]): string[] {
  let v = cache.get(key)
  if (!v) {
    v = make()
    cache.set(key, v)
  }
  return v
}

/**
 * `band`: 24–40 sinusoids across `width`, modulated by a slow envelope, so neighbouring lines
 * cross like the engraved bands on banknotes.
 */
export function band(seed: number, width = 1440, height = 240): string[] {
  return memo(`band:${seed}:${width}:${height}`, () => {
    const rand = prng(seed)
    const lines = 24 + Math.floor(rand() * 17)
    const k1 = (2 * Math.PI) / (width * (0.35 + rand() * 0.2))
    const k2 = (2 * Math.PI) / (width * (1.1 + rand() * 0.6))
    const envPhase = rand() * Math.PI * 2
    const amp = height * 0.36
    const mid = height / 2
    const step = 6
    const out: string[] = []
    for (let i = 0; i < lines; i++) {
      const phase = (i / lines) * Math.PI * 2
      const pts: [number, number][] = []
      for (let x = 0; x <= width + step / 2; x += step) {
        const env = 0.55 + 0.45 * Math.sin(k2 * x + envPhase)
        pts.push([x, mid + amp * env * Math.sin(k1 * x + phase) * 0.9])
      }
      out.push(polyline(pts))
    }
    return out
  })
}

/**
 * `rosette`: 3–6 epitrochoid rings centred in a `size` square. Integer R:r ratios close each
 * curve after `r` turns.
 */
export function rosette(seed: number, size = 200): string[] {
  return memo(`rosette:${seed}:${size}`, () => {
    const rand = prng(seed)
    const rings = 3 + Math.floor(rand() * 4)
    const c = size / 2
    const out: string[] = []
    for (let i = 0; i < rings; i++) {
      const outer = (size / 2) * (0.98 - i * (0.5 / rings))
      const petals = 12 + Math.floor(rand() * 10) + i * 4 // R / r
      // Farthest point is R + r + d = r(petals + 1) + d, and d ≤ 2.2 r: size r for the worst case.
      const r = outer / (petals + 3.2)
      const R = r * petals
      const d = r * (1.4 + rand() * 0.8)
      const pts: [number, number][] = []
      const n = 900
      for (let s = 0; s <= n; s++) {
        const t = (s / n) * Math.PI * 2
        const k = (R + r) / r
        pts.push([
          c + (R + r) * Math.cos(t) - d * Math.cos(k * t),
          c + (R + r) * Math.sin(t) - d * Math.sin(k * t),
        ])
      }
      out.push(`${polyline(pts)}Z`)
    }
    return out
  })
}

/**
 * `border`: an interlaced frame — two sine strands per edge, half a period apart, running around
 * a `width` × `height` rectangle inset by `inset`.
 */
export function border(seed: number, width = 1200, height = 630, inset = 24): string[] {
  return memo(`border:${seed}:${width}:${height}:${inset}`, () => {
    const rand = prng(seed)
    const amp = 4 + rand() * 3
    const period = 22 + rand() * 12
    const x0 = inset
    const y0 = inset
    const w = width - inset * 2
    const h = height - inset * 2
    const perimeter = 2 * (w + h)
    // Walk the rectangle by arc length; offset perpendicular (outward normal) by the sine.
    const at = (s: number): [number, number, number, number] => {
      if (s < w) return [x0 + s, y0, 0, -1]
      if (s < w + h) return [x0 + w, y0 + (s - w), 1, 0]
      if (s < 2 * w + h) return [x0 + w - (s - w - h), y0 + h, 0, 1]
      return [x0, y0 + h - (s - 2 * w - h), -1, 0]
    }
    const out: string[] = []
    for (const shift of [0, Math.PI]) {
      const pts: [number, number][] = []
      for (let s = 0; s <= perimeter; s += 3) {
        const [x, y, nx, ny] = at(Math.min(s, perimeter - 0.001))
        const o = amp * Math.sin((s / period) * Math.PI * 2 + shift)
        pts.push([x + nx * o, y + ny * o])
      }
      out.push(`${polyline(pts)}Z`)
    }
    return out
  })
}
