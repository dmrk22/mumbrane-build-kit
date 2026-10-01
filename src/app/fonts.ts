import { Martian_Mono, Mona_Sans, Noto_Sans_Math, Source_Serif_4 } from 'next/font/google'

// next/font downloads these at build time and serves them from our origin: no runtime requests.
// Mona Sans keeps its wdth axis: headlines are set semi-expanded with `font-stretch`.
const mona = Mona_Sans({
  subsets: ['latin'],
  display: 'swap',
  axes: ['wdth'],
  variable: '--font-mona',
  preload: true,
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal'],
  axes: ['opsz'],
  variable: '--font-source-serif',
  preload: true,
})

// Italic in its own instance (math variables, theorem statements); `font-synthesis: none` in the
// base layer turns a missing italic into a visible bug instead of a faux slant.
const sourceSerifItalic = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  style: ['italic'],
  axes: ['opsz'],
  variable: '--font-source-serif-italic',
  preload: false,
})

const martian = Martian_Mono({
  subsets: ['latin'],
  display: 'swap',
  axes: ['wdth'],
  variable: '--font-martian',
  preload: false,
})

// Only the logic symbols the text faces lack (⊢ ⊬ ⊨ ⊥ ∉ ∴ ∎) fall through to this face.
const math = Noto_Sans_Math({
  weight: '400',
  display: 'swap',
  variable: '--font-math',
})

export const fontVars = [mona, sourceSerif, sourceSerifItalic, martian, math].map((f) => f.variable).join(' ')
