import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { test } from 'node:test'
import { pathToFileURL } from 'node:url'
import { REGISTRY } from '../../src/content/routes.ts'
import { toSafeHref } from '../../src/lib/security/links.ts'

test('toSafeHref accept/reject table', () => {
  const accept = [
    '/moth',
    '/contact?interest=research',
    '#evidence',
    'https://github.com/mumbrane',
    'https://x.com/mumbrane',
    'https://www.linkedin.com/company/mumbrane/',
    'mailto:hello@mumbrane.com',
    'mailto:hello@mumbrane.com?subject=Careers',
  ]
  const reject = [
    '',
    '   ',
    '//evil.example',
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html,<script>',
    'http://x.com',
    'https://evil.example',
    'https://x.com.evil.example',
    'https://user:pass@github.com',
    'https://github.com:8443/',
    'mailto:someone@evil.example',
    'mailto:@mumbrane.com',
    '#1bad',
    '#a b',
    '/a\\b',
    `/a${String.fromCharCode(0)}b`,
    `/a${String.fromCharCode(10)}b`,
    `/${'a'.repeat(2048)}`,
  ]
  for (const href of accept) assert.ok(toSafeHref(href), `accept ${href}`)
  for (const href of reject)
    assert.equal(toSafeHref(href), null, `reject ${JSON.stringify(href.slice(0, 40))}`)
})

// Every href in every content module: accepted by the policy, and internal ones exist.
const CONTENT = 'src/content'
const known = new Set<string>(REGISTRY.map((r) => r.path))

function contentModules(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return e.name === 'source' ? [] : contentModules(p)
    return e.name.endsWith('.ts') ? [p] : []
  })
}

function hrefsIn(value: unknown, key = ''): string[] {
  if (typeof value === 'string') {
    const found: string[] = []
    if (key === 'href' || key === 'path') found.push(value)
    // Inline markup links: [text](href)
    for (let i = value.indexOf(']('); i !== -1; i = value.indexOf('](', i + 2)) {
      const end = value.indexOf(')', i + 2)
      if (end !== -1) found.push(value.slice(i + 2, end))
    }
    return found
  }
  if (Array.isArray(value)) return value.flatMap((v) => hrefsIn(v, key))
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => hrefsIn(v, k))
  return []
}

test('every href in the content modules is accepted and internal links resolve', async () => {
  const problems: string[] = []
  for (const file of contentModules(CONTENT)) {
    const mod = (await import(pathToFileURL(file).href)) as Record<string, unknown>
    for (const href of hrefsIn(mod)) {
      const safe = toSafeHref(href)
      if (!safe) problems.push(`${relative('.', file)}: rejected ${href}`)
      else if (safe.kind === 'internal') {
        const path = safe.href.split(/[?#]/)[0] ?? ''
        if (!known.has(path)) problems.push(`${relative('.', file)}: unknown route ${href}`)
      }
    }
  }
  assert.deepEqual(problems, [])
})
