import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { CLAIMS } from '../../src/content/claims.ts'

const releases = readFileSync('src/content/source/releases.md', 'utf8')

test('every claim appears verbatim in releases.md, inside its recorded line', () => {
  for (const c of CLAIMS) {
    assert.ok(releases.includes(c.line), `${c.id}: line not in releases.md`)
    assert.ok(c.line.includes(c.value), `${c.id}: value not in its line`)
  }
})

// CONTENT §4 forbidden patterns. Source sentences kept verbatim that negate a claim (e.g. "not
// measured capacity guarantees") are the only exceptions, listed exactly.
const FORBIDDEN = [
  /\d+(\.\d+)?\s?%/,
  /\b\d+(\.\d+)?\s?x faster\b/i,
  /\buptime\b(?! numbers we do not measure)/i,
  /\bSOC ?2\b/,
  /production-ready/i,
  /\bguarantee/i,
  /hallucination/i,
  // "Customer support" is a solution area; claims about customers are what is forbidden.
  /\bcustomers\b|\bour customer\b/i,
  /trusted by/i,
]
const VERBATIM_NEGATIONS = ['These safeguards are not measured capacity guarantees.']

function contentFiles(dir = 'src/content'): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return e.name === 'source' ? [] : contentFiles(p)
    return e.name.endsWith('.ts') && e.name !== 'claims.ts' ? [p] : []
  })
}

test('content modules carry none of the forbidden claim patterns', () => {
  const hits: string[] = []
  for (const file of contentFiles()) {
    let text = readFileSync(file, 'utf8')
    for (const ok of VERBATIM_NEGATIONS) text = text.replaceAll(ok, '')
    // Comments explain; they are not rendered.
    text = text.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
    for (const re of FORBIDDEN) if (re.test(text)) hits.push(`${file}: ${re}`)
  }
  assert.deepEqual(hits, [])
})
