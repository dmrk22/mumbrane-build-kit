import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  convertMarkdown,
  generate,
  LEGAL_SOURCES,
  rewriteLinks,
  sourcePath,
  typography,
} from '../../scripts/articles.ts'
import { BODIES, LEGAL_BODIES } from '../../src/content/articleBodies.ts'
import { ARTICLES } from '../../src/content/articles.ts'
import { ArticleSchema, BlockSchema } from '../../src/content/schemas.ts'

test('articleBodies.ts is exactly what scripts/articles.ts generates from the sources', () => {
  assert.equal(readFileSync('src/content/articleBodies.ts', 'utf8'), generate())
})

test('article metadata and every block validate; slugs are unique', () => {
  for (const a of ARTICLES) ArticleSchema.parse(a)
  assert.equal(new Set(ARTICLES.map((a) => a.slug)).size, ARTICLES.length)
  for (const [slug, blocks] of Object.entries(BODIES)) {
    assert.ok(blocks.length > 5, slug)
    for (const b of blocks) BlockSchema.parse(b)
    const ids = blocks.flatMap((b) => ('id' in b ? [b.id] : []))
    assert.equal(new Set(ids).size, ids.length, `${slug}: heading ids unique`)
  }
})

// QUALITY §5.4: the authors' wording is preserved — only typography and link targets may change.
const words = (s: string) =>
  s
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/ — /g, '—')
    .split(/\s+/)
    .filter(Boolean)

test('bodies keep the source wording word for word', () => {
  for (const a of ARTICLES) {
    const src = readFileSync(sourcePath(a), 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '')
    const afterDescription = src.split('\n').slice(src.split('\n').findIndex((l) => l.startsWith('# ')) + 2)
    const expected = words(afterDescription.join('\n').replace(/^#+ |^```\w*$/gm, ''))
    const actual = words(
      BODIES[a.slug]?.map((b) => ('text' in b ? b.text : 'items' in b ? b.items.join(' ') : '')).join(' ') ??
        '',
    )
    assert.deepEqual(actual, expected, a.slug)
  }
})

test('legal bodies keep the source wording; a heading right under the title is kept', () => {
  assert.deepEqual(convertMarkdown('# T\n## First\n\nText.\n'), [
    { type: 'h2', text: 'First', id: 'first' },
    { type: 'p', text: 'Text.' },
  ])
  for (const s of LEGAL_SOURCES) {
    const src = readFileSync(`src/content/source/${s}.md`, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '')
    const afterTitle = src.split('\n').slice(src.split('\n').findIndex((l) => l.startsWith('# ')) + 1)
    const blocks = LEGAL_BODIES[s]
    for (const b of blocks) BlockSchema.parse(b)
    assert.equal(blocks[0]?.type, 'h2', s)
    assert.deepEqual(
      words(blocks.map((b) => ('text' in b ? b.text : '')).join(' ')),
      words(afterTitle.join('\n').replace(/^#+ /gm, '')),
      s,
    )
  }
})

test('typography and link rewriting', () => {
  assert.equal(typography('reasoning—and how'), 'reasoning — and how')
  assert.equal(typography('Mumbrane\'s "field"'), 'Mumbrane’s “field”')
  assert.equal(typography("keep `it's code`"), "keep `it's code`")
  assert.equal(rewriteLinks('[x](https://mumbrane.ai/releases)'), '[x](/moth#evidence)')
  assert.equal(rewriteLinks('[x](https://mumbrane.ai/releases#qualification)'), '[x](/moth#qualification)')
  assert.equal(rewriteLinks('[x](https://mumbrane.ai/moth)'), '[x](/moth)')
  assert.deepEqual(
    convertMarkdown('# T\ndesc\n\nA para\nsame para.\n\n## Head\n\n- a\n- b\n\n```text\nx\n```\n'),
    [
      { type: 'p', text: 'A para same para.' },
      { type: 'h2', text: 'Head', id: 'head' },
      { type: 'list', ordered: false, items: ['a', 'b'] },
      { type: 'code', lang: 'text', text: 'x', label: 'Example' },
    ],
  )
})
