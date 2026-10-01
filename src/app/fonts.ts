import { Fustat, Source_Serif_4 } from 'next/font/google'
import localFont from 'next/font/local'

// next/font serves every face from our origin with a size-adjusted fallback: no runtime requests,
// no layout jump on swap. Roles (D-135, D-136): headlines and interface in Fustat, ledes and body
// in the serif, data in mono. Fustat carries the hero headline (LCP), so it is the only face
// preloaded.
const fustat = Fustat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fustat',
  preload: true,
})

// Not on Google Fonts: the official v1.143 variable file (brand/fonts, SIL OFL 1.1).
const commitMono = localFont({
  src: '../../brand/fonts/CommitMono-VF.woff2',
  weight: '200 700',
  display: 'swap',
  variable: '--font-commit-mono',
  preload: false,
})

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

export const fontVars = [fustat, commitMono, sourceSerif, sourceSerifItalic].map((f) => f.variable).join(' ')
