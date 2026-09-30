// Copies the locked logo files and icons into public/ and generates
// src/components/brand/mark-geometry.ts from the SVG path data (BUILD_PLAN §P0.scripts-spec).
// Reads brand/ only; never writes there. Idempotent: re-running produces byte-identical output.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

export const LOGO_DIR = 'brand/logo'
export const LOGO_FILES = [
  'mumbrane-mark.svg',
  'mumbrane-mark-compact.svg',
  'mumbrane-lockup.svg',
  'mumbrane-wordmark.svg',
] as const
export const ICON_COPIES: ReadonlyArray<readonly [string, string]> = [
  ['brand/icons/favicon.ico', 'public/favicon.ico'],
  ['brand/icons/icon.svg', 'public/icon.svg'],
  ['brand/icons/apple-touch-icon.png', 'public/apple-touch-icon.png'],
  ['brand/icons/icon-192.png', 'public/icons/icon-192.png'],
  ['brand/icons/icon-512.png', 'public/icons/icon-512.png'],
  ['brand/icons/icon-maskable-512.png', 'public/icons/icon-maskable-512.png'],
  ['brand/og-default.png', 'public/og/default.png'],
]
export const GEOMETRY_FILE = 'src/components/brand/mark-geometry.ts'

const read = (file: string) => readFileSync(`${LOGO_DIR}/${file}`, 'utf8')

/** Every d="…" value in document order (the LOCK.json geometry digest input). */
export function pathData(svg: string): string[] {
  return [...svg.matchAll(/\sd="([^"]*)"/g)].map((m) => m[1] ?? '')
}

function attr(tag: string, name: string): string {
  const value = new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1]
  if (value === undefined) throw new Error(`Missing ${name} in ${tag}`)
  return value
}

function openTag(svg: string, selector: RegExp): string {
  const tag = svg.match(selector)?.[0]
  if (!tag) throw new Error(`No element matching ${selector}`)
  return tag
}

function markWeights(svg: string) {
  return {
    edge: Number(attr(openTag(svg, /<g class="mb-edges"[^>]*>/), 'stroke-width')),
    strut: Number(attr(openTag(svg, /<g class="mb-struts"[^>]*>/), 'stroke-width')),
  }
}

export function buildGeometry() {
  const mark = read('mumbrane-mark.svg')
  const compact = read('mumbrane-mark-compact.svg')
  const wordmark = read('mumbrane-wordmark.svg')
  const lockup = read('mumbrane-lockup.svg')

  const struts = pathData(openTag(mark, /<g class="mb-struts"[\s\S]*?<\/g>/))
  const letters = [...wordmark.matchAll(/<path data-letter="\d+" data-char="([^"]+)" d="([^"]*)"/g)].map(
    (m) => ({
      char: m[1] ?? '',
      d: m[2] ?? '',
    }),
  )
  return {
    MARK: {
      viewBox: attr(openTag(mark, /<svg[^>]*>/), 'viewBox'),
      struts,
      band: attr(openTag(mark, /<path class="mb-band"[^>]*>/), 'd'),
      rim: attr(openTag(mark, /<path class="mb-rim"[^>]*>/), 'd'),
      weights: { display: markWeights(mark), compact: markWeights(compact) },
    },
    WORDMARK: {
      viewBox: attr(openTag(wordmark, /<svg[^>]*>/), 'viewBox'),
      transform: attr(openTag(wordmark, /<g class="mb-wordmark"[^>]*>/), 'transform'),
      letters,
    },
    LOCKUP: {
      viewBox: attr(openTag(lockup, /<svg[^>]*>/), 'viewBox'),
      markTransform: attr(openTag(lockup, /<g class="mb-mark"[^>]*>/), 'transform'),
      wordmarkTransform: attr(openTag(lockup, /<g class="mb-wordmark"[^>]*>/), 'transform'),
    },
  }
}

// Minimal serializer whose output already matches the Biome formatter (single quotes,
// trailing commas, one property per line), so `pnpm lint` never wants to rewrite the file.
function serialize(value: unknown, indent: string): string {
  const inner = `${indent}  `
  if (typeof value === 'string') return `'${value}'`
  if (typeof value === 'number') return String(value)
  if (Array.isArray(value))
    return `[\n${value.map((v) => `${inner}${serialize(v, inner)},\n`).join('')}${indent}]`
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).map(([k, v]) => `${inner}${k}: ${serialize(v, inner)},\n`)
    return `{\n${entries.join('')}${indent}}`
  }
  throw new TypeError(`Cannot serialise ${typeof value}`)
}

export function renderGeometry(): string {
  const geometry = buildGeometry()
  const blocks = Object.entries(geometry).map(
    ([name, value]) => `export const ${name} = ${serialize(value, '')} as const\n`,
  )
  return `// GENERATED — do not edit. Source: brand/logo/*.svg via scripts/brand.ts (pnpm brand).\n\n${blocks.join('\n')}`
}

function copy(from: string, to: string) {
  mkdirSync(dirname(to), { recursive: true })
  copyFileSync(from, to)
}

if (import.meta.main) {
  for (const file of LOGO_FILES) copy(`${LOGO_DIR}/${file}`, `public/brand/${file}`)
  for (const [from, to] of ICON_COPIES) copy(from, to)
  mkdirSync(dirname(GEOMETRY_FILE), { recursive: true })
  writeFileSync(GEOMETRY_FILE, renderGeometry())
  process.stdout.write(
    `brand: copied ${LOGO_FILES.length + ICON_COPIES.length} files, wrote ${GEOMETRY_FILE}\n`,
  )
}
