// Brand colours where CSS cannot reach (the web manifest): literal sRGB, mirrored from
// brand/palette/palette.json (tests/unit/gl.test.ts keeps them equal).
export const HEX = {
  paper: '#f7f6f3',
  ink: '#0b0c0d',
  deep: '#050607',
  chalk: '#f2f2ef',
  ice: '#9fc7fb',
} as const

export type Rgb = readonly [number, number, number]

/** '#rrggbb' → sRGB channels 0..1. */
export function rgb(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}
