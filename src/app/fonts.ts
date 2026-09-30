import { Host_Grotesk, JetBrains_Mono, Newsreader } from 'next/font/google'

// next/font downloads these at build time and serves them from our origin: no runtime requests.
const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  preload: true,
})

const newsreaderItalic = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  style: ['italic'],
  variable: '--font-newsreader-italic',
  preload: false,
})

const hostGrotesk = Host_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-host-grotesk',
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  preload: false,
})

export const fontVars = [newsreader, newsreaderItalic, hostGrotesk, jetbrainsMono]
  .map((f) => f.variable)
  .join(' ')
