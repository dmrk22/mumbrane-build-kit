import assert from 'node:assert/strict'
import { test } from 'node:test'
import { blockToMarkdown, mdText, toMarkdown } from '../../src/lib/markdown.ts'

test('blocks → markdown: headings, lists, quotes, tables, notes', () => {
  assert.equal(blockToMarkdown({ type: 'h2', text: 'Keep it', id: 'keep-it' }), '## Keep it')
  assert.equal(blockToMarkdown({ type: 'list', ordered: true, items: ['a', 'b'] }), '1. a\n2. b')
  assert.equal(blockToMarkdown({ type: 'list', ordered: false, items: ['a'] }), '- a')
  assert.equal(blockToMarkdown({ type: 'quote', text: 'q' }), '> q')
  assert.equal(
    blockToMarkdown({ type: 'table', caption: 'C', columns: ['A', 'B'], rows: [['1', 'x|y']] }),
    '*C*\n\n| A | B |\n| --- | --- |\n| 1 | x\\|y |',
  )
  assert.equal(blockToMarkdown({ type: 'note', tone: 'caveat', text: 'n' }), '> **Note:** n')
})

test('code fences are longer than any backtick run inside them', () => {
  assert.equal(blockToMarkdown({ type: 'code', lang: 'text', text: 'a' }), '```text\na\n```')
  assert.equal(blockToMarkdown({ type: 'code', lang: 'md', text: 'x ```` y' }), '`````md\nx ```` y\n`````')
})

test('no raw HTML: < is escaped; internal links become absolute', () => {
  assert.equal(mdText('<script>x</script>'), '&lt;script>x&lt;/script>')
  assert.equal(mdText('see [Moth](/moth#evidence)'), 'see [Moth](https://mumbrane.com/moth#evidence)')
  assert.equal(mdText('[X](https://x.com/mumbrane)'), '[X](https://x.com/mumbrane)')
})

test('document: YAML frontmatter (quoted, escaped), title and description, then blocks', () => {
  const md = toMarkdown(
    {
      title: 'A "quoted" title',
      description: 'D',
      canonical: 'https://mumbrane.com/a',
      published: '2026-09-22',
      authors: ['Mumbrane Labs'],
    },
    [{ type: 'p', text: 'Body' }],
  )
  assert.equal(
    md,
    '---\ntitle: "A \\"quoted\\" title"\ndescription: "D"\ncanonical: "https://mumbrane.com/a"\npublished: "2026-09-22"\nauthors:\n  - "Mumbrane Labs"\n---\n\n# A "quoted" title\n\nD\n\nBody\n',
  )
  assert.ok(!/<(?!\/?script)[a-z]/i.test(md))
})
