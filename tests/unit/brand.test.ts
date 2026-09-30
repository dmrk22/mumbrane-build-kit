import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  GEOMETRY_FILE,
  ICON_COPIES,
  LOGO_DIR,
  LOGO_FILES,
  pathData,
  renderGeometry,
} from '../../scripts/brand.ts'
import { LOCKUP, MARK, WORDMARK } from '../../src/components/brand/mark-geometry.ts'

type Lock = {
  files: Record<string, string>
  geometry: Record<string, { paths: number; sha256_of_d: string }>
}
const lock = JSON.parse(readFileSync(`${LOGO_DIR}/LOCK.json`, 'utf8')) as Lock
const sha = (data: string | Buffer) => createHash('sha256').update(data).digest('hex')
const svg = (file: string) => readFileSync(`${LOGO_DIR}/${file}`, 'utf8')

test('every locked logo file matches its sha256', () => {
  for (const [file, hash] of Object.entries(lock.files)) {
    assert.equal(sha(readFileSync(`${LOGO_DIR}/${file}`)), hash, file)
  }
})

test('every SVG in brand/logo is listed in LOCK.json', () => {
  for (const file of readdirSync(LOGO_DIR).filter((f) => f.endsWith('.svg'))) {
    assert.ok(lock.files[file], `${file} is not locked`)
  }
})

test('path-data digest of each SVG matches LOCK.json geometry', () => {
  for (const [file, geometry] of Object.entries(lock.geometry)) {
    const d = pathData(svg(file))
    assert.equal(d.length, geometry.paths, file)
    assert.equal(sha(d.join('\n')), geometry.sha256_of_d, file)
  }
})

test('public/brand SVGs are byte-identical copies', () => {
  for (const file of LOGO_FILES) {
    assert.deepEqual(readFileSync(`public/brand/${file}`), readFileSync(`${LOGO_DIR}/${file}`), file)
  }
})

test('generated mark geometry carries exactly the SVG path data, in order', () => {
  assert.deepEqual([...MARK.struts, MARK.band, MARK.rim], pathData(svg('mumbrane-mark.svg')))
  assert.deepEqual([...MARK.struts, MARK.band, MARK.rim], pathData(svg('mumbrane-mark-compact.svg')))
  assert.deepEqual(
    WORDMARK.letters.map((l) => l.d),
    pathData(svg('mumbrane-wordmark.svg')),
  )
  assert.equal(WORDMARK.letters.map((l) => l.char).join(''), 'MUMBRANE')
  assert.deepEqual(
    [...MARK.struts, MARK.band, MARK.rim, ...WORDMARK.letters.map((l) => l.d)],
    pathData(svg('mumbrane-lockup.svg')),
  )
})

test('generated lockup transforms and weights match the SVGs', () => {
  const lockup = svg('mumbrane-lockup.svg')
  assert.ok(lockup.includes(`class="mb-mark" transform="${LOCKUP.markTransform}"`))
  assert.ok(
    lockup.includes(
      `class="mb-wordmark" fill="currentColor" stroke="none" transform="${LOCKUP.wordmarkTransform}"`,
    ),
  )
  assert.ok(lockup.includes(`viewBox="${LOCKUP.viewBox}"`))
  assert.deepEqual(MARK.weights, {
    display: { edge: 4.9, strut: 1.57 },
    compact: { edge: 11.19, strut: 3.16 },
  })
})

test('mark-geometry.ts is exactly what scripts/brand.ts generates (no hand edits)', () => {
  assert.equal(readFileSync(GEOMETRY_FILE, 'utf8'), renderGeometry())
})

test('favicon, icons and default OG card exist in public/', () => {
  for (const [from, to] of ICON_COPIES) {
    assert.ok(existsSync(to), to)
    assert.deepEqual(readFileSync(to), readFileSync(from), to)
  }
})
