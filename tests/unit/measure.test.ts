import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

// D-145: running text takes anthropic.com's 640 px text column (`max-w-text`); a `ch` measure is
// left only on headings, where it sets our line breaks. The console keeps its own (owner), and the
// hero figure's caption is an overlay inside the art, sized to sit clear of the field.
const HEADING = /text-(hero|display-|title)|<h[1-6]|<Heading|size="/
const EXEMPT = /^src\/(app|components)\/console\/|^src\/components\/sections\/HomeHero\.tsx$/

function tsx(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? tsx(join(dir, e.name)) : e.name.endsWith('.tsx') ? [join(dir, e.name)] : [],
  )
}

test('a ch measure sits on a heading, never on running text', () => {
  const offenders: string[] = []
  for (const file of tsx('src')) {
    if (EXEMPT.test(file)) continue
    const lines = readFileSync(file, 'utf8').split('\n')
    lines.forEach((line, i) => {
      if (!/max-w-\[\d+ch\]/.test(line)) return
      // A class list can span lines (cx(...)): the heading token may sit just above.
      if (!HEADING.test(lines.slice(Math.max(0, i - 2), i + 1).join('\n'))) offenders.push(`${file}:${i + 1}`)
    })
  }
  assert.deepEqual(offenders, [])
})
