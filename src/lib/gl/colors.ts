// Brand colours as the shaders and the manifest need them: literal sRGB, mirrored from
// brand/palette/palette.json (tests/unit/gl.test.ts keeps them equal).
export const HEX = {
  paper: '#f9f7f0',
  ultramarine: '#1a30b3',
  ultramarineDeep: '#151580',
  cherenkov: '#7fc7f9',
  vermilion: '#f15d35',
  cadmium: '#facd56',
} as const

export type Rgb = readonly [number, number, number]

/** '#rrggbb' → sRGB channels 0..1, as the shaders expect (hex / 255). */
export function rgb(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/** Uniforms of membrane.frag (DESIGN §7.2). */
export const MEMBRANE_COLORS = {
  uBgA: rgb(HEX.ultramarine),
  uBgB: rgb(HEX.ultramarineDeep),
  uLine: rgb(HEX.cherenkov),
  uSpark: rgb(HEX.vermilion),
  uWarm: rgb(HEX.cadmium),
} as const
