// Joins the registry with the generated manifest (scripts/images.ts). Data only.
import manifest from './paintings.manifest.json' with { type: 'json' }
import { PAINTINGS, type PaintingId, type PaintingSpec } from './paintings.ts'

export type Swatch = { hex: string; weight: number }
export type PaintingData = PaintingSpec & { width: number; height: number; palette: Swatch[] }

export function painting(id: PaintingId): PaintingData {
  const spec = PAINTINGS.find((p) => p.id === id)
  const built = manifest.find((m) => m.id === id)
  // Unreachable once `pnpm art` has run; paintings.test.ts asserts every id is in both.
  if (!spec || !built) throw new Error(`painting ${id} is not built — run pnpm art`)
  return { ...spec, width: built.width, height: built.height, palette: built.palette }
}
