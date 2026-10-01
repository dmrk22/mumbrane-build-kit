// Brand colours as the shaders and the manifest need them: literal sRGB, mirrored from
// brand/palette/palette.json (tests/unit/gl.test.ts keeps them equal).
export const HEX = {
  paper: '#f4f5ef',
  ink: '#0a1a13',
  deep: '#02100b',
  chalk: '#f1f2e8',
  sulfur: '#f4da57',
  verdigris: '#4cb9b0',
  cinnabar: '#eb5b3b',
  malachite: '#3baa73',
  moss: '#416a38',
} as const

export type Rgb = readonly [number, number, number]

/** '#rrggbb' → sRGB channels 0..1, as the shaders expect (hex / 255). */
export function rgb(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/** Uniforms of the string-model membrane (src/shaders/strings.ts). */
export const MEMBRANE_COLORS = {
  uChalk: rgb(HEX.chalk),
  uSulfur: rgb(HEX.sulfur),
  uVerdigris: rgb(HEX.verdigris),
  uSpark: rgb(HEX.cinnabar),
} as const
