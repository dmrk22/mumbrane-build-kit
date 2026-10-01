// The paintings registry (DESIGN §8.2). `pnpm art` renders every entry at build time with the
// tested shaders (scripts/paint.ts → scripts/images.ts). Seeds are integers because plates print
// them ("SEED 17") and the printed seed must be the real one. Data only.

export type Scene = 'range' | 'sky' | 'meadow' | 'sea'

export type PaintingSpec = {
  id: string
  scene: Scene | 'membrane'
  seed: number
  /** Output aspect, width : height. */
  aspect: readonly [number, number]
  /** Describes the painting itself (DESIGN §10); '' only for the decorative poster. */
  alt: string
  /** Scene-colour overrides (sRGB 0..1), for a plate that would otherwise repeat another. */
  palette?: Readonly<Partial<Record<SceneColour, readonly [number, number, number]>>>
}

export type SceneColour =
  | 'uSkyTop'
  | 'uSkyLow'
  | 'uCloud'
  | 'uFar'
  | 'uMid'
  | 'uNear'
  | 'uGround'
  | 'uAccent'
  | 'uAccent2'

export const PAINTINGS = [
  {
    id: 'research-hero',
    scene: 'range',
    seed: 3,
    aspect: [21, 9],
    alt: 'Oil-on-code study: cobalt mountains under a cadmium sky, above a dark green tree line.',
  },
  {
    id: 'plate-field',
    scene: 'range',
    seed: 11,
    aspect: [16, 10],
    alt: 'Oil-on-code study: a blue mountain range under a warm yellow sky.',
  },
  {
    id: 'plate-wording',
    scene: 'meadow',
    seed: 17,
    aspect: [16, 10],
    alt: 'Oil-on-code study: a green meadow below a dark tree line and a pale sky.',
  },
  {
    id: 'plate-evidence',
    scene: 'sea',
    seed: 24,
    aspect: [16, 10],
    alt: 'Oil-on-code study: an ultramarine sea at dusk under an orange sky, light glinting on the water.',
  },
  {
    id: 'plate-preview',
    scene: 'sky',
    seed: 5,
    aspect: [16, 10],
    alt: 'Oil-on-code study: cumulus clouds over a dark horizon.',
  },
  {
    id: 'inquiry-representation',
    scene: 'range',
    seed: 29,
    aspect: [4, 5],
    alt: 'Oil-on-code study, portrait: layered blue ridges under a cadmium sky.',
  },
  {
    id: 'inquiry-dynamics',
    scene: 'sea',
    seed: 31,
    aspect: [4, 5],
    alt: 'Oil-on-code study, portrait: a low sun over a dusk sea, its glints running down the water.',
  },
  {
    id: 'inquiry-causality',
    scene: 'sky',
    seed: 44,
    aspect: [4, 5],
    alt: 'Oil-on-code study, portrait: towering clouds over a dark horizon.',
  },
  {
    id: 'company-plate',
    scene: 'meadow',
    seed: 47,
    aspect: [16, 10],
    alt: 'Oil-on-code study: an evening meadow under an apricot sky, violet haze above the tree line.',
    // Every meadow seed shares one composition, so an evening palette keeps this plate apart
    // from plate-wording. Values stay in the token families (cadmium, madder, violet, viridian).
    palette: {
      uSkyTop: [0.99, 0.84, 0.58],
      uSkyLow: [0.98, 0.66, 0.55],
      uCloud: [0.99, 0.93, 0.85],
      uFar: [0.6, 0.52, 0.76],
      uMid: [0.34, 0.42, 0.55],
      uNear: [0.06, 0.3, 0.25],
      uGround: [0.2, 0.52, 0.4],
      uAccent: [0.98, 0.8, 0.3],
      uAccent2: [0.86, 0.4, 0.52],
    },
  },
  {
    id: 'membrane-poster',
    scene: 'membrane',
    seed: 1.37,
    aspect: [16, 9],
    alt: '',
  },
] as const satisfies readonly PaintingSpec[]

export type PaintingId = (typeof PAINTINGS)[number]['id']

/** Rendered width of every source image (DESIGN §8.2); the poster is 2560 × 1440. */
export const RENDER_WIDTH = 2400
export const POSTER_SIZE = [2560, 1440] as const
/** Encoded widths (DESIGN §8.3). */
export const WIDTHS = [640, 1024, 1600, 2400] as const
