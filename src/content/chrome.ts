// Props the site chrome needs from the registry, computed once on the server.
import type { Surface } from '../lib/surface.ts'
import { REGISTRY } from './routes.ts'

export const SURFACE_TOP: Readonly<Record<string, Surface>> = Object.fromEntries(
  REGISTRY.map((r) => [r.path, r.surfaceTop]),
)
