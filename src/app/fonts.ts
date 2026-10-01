import { Geist_Mono, Mona_Sans, Source_Serif_4 } from 'next/font/google'

// next/font downloads these at build time and serves them from our origin: no runtime requests.
// Mona Sans keeps its wdth axis: headlines are set semi-expanded with `font-stretch`.
const mona = Mona_Sans({
  subsets: ['latin'],
  display: 'swap',
  axes: ['wdth'],
  variable: '--font-mona',
  preload: true,
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
  preload: false,
})

// The serif is for long-form article prose only, so neither instance is preloaded.
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal'],
  axes: ['opsz'],
  variable: '--font-source-serif',
  preload: false,
})

const sourceSerifItalic = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  style: ['italic'],
  axes: ['opsz'],
  variable: '--font-source-serif-italic',
  preload: false,
})

export const fontVars = [mona, geistMono, sourceSerif, sourceSerifItalic].map((f) => f.variable).join(' ')
