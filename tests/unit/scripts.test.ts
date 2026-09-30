import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { checkDeps, checkShape, isCounted } from '../../scripts/budgets.ts'
import { packageName, scanConfig, scanText } from '../../scripts/guard.ts'
import { routeDir, shotPaths } from '../../scripts/shots.ts'

const allowed = new Set(['next', 'react', 'zod', '@gsap/react'])
const rules = (file: string, text: string) => scanText(file, text, allowed).map((f) => f.rule)

test('guard flags unsafe rendering and styling in app code', () => {
  assert.deepEqual(rules('src/app/x.tsx', '<div style={{ color: 1 }} />'), ['no-style-prop'])
  assert.deepEqual(rules('src/app/x.tsx', '<div dangerouslySetInnerHTML={x} />'), [
    'no-dangerously-set-inner-html',
  ])
  assert.deepEqual(rules('src/lib/security/json-ld.tsx', '<script dangerouslySetInnerHTML={x} />'), [])
  assert.deepEqual(rules('src/components/ui/A.tsx', '<p className="text-gray-500" />'), [
    'no-default-palette',
  ])
  assert.deepEqual(rules('src/components/ui/A.tsx', "const c = '#1a30b3'"), ['no-raw-colour'])
  assert.deepEqual(rules('src/lib/a.ts', 'el.innerHTML = s'), ['no-html-sinks'])
  assert.deepEqual(rules('src/lib/a.ts', "fetch('https://evil.example')"), ['no-cross-origin-requests'])
  assert.deepEqual(rules('src/app/x.tsx', '<a target="_blank" href="/">x</a>'), ['blank-needs-noopener'])
  assert.deepEqual(rules('src/app/x.tsx', '<a target="_blank" rel="noopener noreferrer">x</a>'), [])
})

test('guard rejects raw line/paragraph separators in any source file', () => {
  for (const code of [0x2028, 0x2029]) {
    const raw = `const re = /[<${String.fromCharCode(code)}]/g`
    assert.deepEqual(rules('src/lib/security/serialize.ts', raw), ['no-raw-line-separators'])
    assert.deepEqual(rules('tests/unit/a.test.ts', raw), ['no-raw-line-separators'])
  }
})

test('guard reports the right line number', () => {
  const [finding] = scanText('src/lib/a.ts', 'const a = 1\n\neval(a)\n', allowed)
  assert.equal(finding?.line, 3)
})

test('guard enforces the import allowlist and bans database clients', () => {
  assert.deepEqual(rules('src/lib/a.ts', "import { z } from 'zod'"), [])
  assert.deepEqual(rules('src/lib/a.ts', "import { readFileSync } from 'node:fs'"), [])
  assert.deepEqual(rules('src/lib/a.ts', "import x from '@/lib/cx'"), [])
  assert.deepEqual(rules('src/lib/a.ts', "import { useGSAP } from '@gsap/react'"), [])
  // Disallowed specifiers are swapped in at runtime: `pnpm guard` scans this file too, and a
  // relative placeholder keeps its own import check quiet.
  const withPkg = (source: string, pkg: string) => source.replace('./PKG', pkg)
  assert.deepEqual(rules('src/lib/a.ts', withPkg("import pad from './PKG'", 'left-pad')), [
    'import-allowlist',
  ])
  assert.deepEqual(
    rules('src/lib/a.ts', withPkg("import { neon } from './PKG'", '@neondatabase/serverless')),
    ['no-db-client'],
  )
  assert.deepEqual(rules('src/lib/a.ts', withPkg("const pg = await import('./PKG')", 'pg')), ['no-db-client'])
  assert.equal(packageName('next/font/google'), 'next')
  assert.equal(packageName('@scope/pkg/sub'), '@scope/pkg')
  assert.equal(packageName('./x.ts'), null)
})

test('tests and the guard itself only get credential, import and protected-path checks', () => {
  assert.deepEqual(rules('tests/e2e/a.spec.ts', "page.goto('/?q=<script>javascript:alert(1)')"), [])
  // Assembled at runtime so this file itself never contains a credential-shaped literal.
  const fakeKey = `AKIA${'0123456789ABCDEF'}`
  assert.deepEqual(rules('tests/unit/a.test.ts', `const k = '${fakeKey}'`), ['no-credentials'])
})

test('guard config checks', () => {
  const good = 'poweredByHeader: false,\nimages: { unoptimized: true },\nagentRules: false,'
  assert.deepEqual(scanConfig(good, 'NEXT_PUBLIC_BACKEND_ENABLED=false\n'), [])
  assert.deepEqual(
    scanConfig('images: {}', 'NEXT_PUBLIC_BACKEND_ENABLED=true\n').map((f) => f.rule),
    ['powered-by', 'images-unoptimized', 'agent-rules-off', 'backend-disabled'],
  )
  // The real config passes (D-105 regression: next dev must not write into CLAUDE.md).
  assert.deepEqual(
    scanConfig(readFileSync('next.config.ts', 'utf8'), 'NEXT_PUBLIC_BACKEND_ENABLED=false'),
    [],
  )
})

test('e2e web server runs Next directly so Playwright can stop it (D-104)', () => {
  const config = readFileSync('playwright.config.ts', 'utf8')
  assert.match(config, /const next = 'node node_modules\/next\/dist\/bin\/next'/)
  assert.doesNotMatch(config, /command:[^\n]*pnpm (start|dev)/)
})

test('budgets: dependencies must be allowlisted and exactly pinned', () => {
  const list = { runtime: ['next'], dev: ['typescript'] }
  assert.deepEqual(checkDeps({ next: '16.3.8' }, { typescript: '7.0.2' }, list), [])
  assert.equal(checkDeps({ next: '^16.3.8' }, {}, list).length, 1)
  // Not allowlisted + one runtime dependency over the allowlist size.
  assert.equal(checkDeps({ next: '16.3.8', lodash: '4.17.21' }, {}, list).length, 2)
  assert.equal(checkDeps({}, { typescript: 'latest' }, list).length, 1)
})

test('budgets: depth, barrels, file length and generated exclusions', () => {
  assert.deepEqual(
    checkShape(['src/a/b/c/d/e.ts'], () => 10),
    [],
  )
  assert.equal(checkShape(['src/a/b/c/d/e/f.ts'], () => 10).length, 1)
  assert.equal(checkShape(['src/components/ui/index.ts'], () => 10).length, 1)
  assert.equal(checkShape(['src/lib/big.ts'], () => 401).length, 1)
  assert.equal(isCounted('src/components/brand/mark-geometry.ts'), false)
  assert.equal(isCounted('src/content/source/index.md'), false)
  assert.equal(isCounted('src/lib/cx.ts'), true)
})

test('shots: route folders and output paths', () => {
  assert.equal(routeDir('/'), 'home')
  assert.equal(routeDir('/research/toward'), 'research_toward')
  assert.deepEqual(shotPaths('/moth'), [
    '.shots/moth/375.png',
    '.shots/moth/768.png',
    '.shots/moth/1440.png',
    '.shots/moth/1440-reduced.png',
  ])
})
