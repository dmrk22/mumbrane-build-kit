// Safe inline markup for content strings (SECURITY §2.1): **bold**, *em*, `code`, [text](href).
// Returns a small typed AST that <Inline> renders as React nodes — never HTML. Links pass through
// toSafeHref; a rejected link keeps its text and loses the link.
//
// Linear time: every "where does this marker close?" lookup reads a table precomputed in one
// backwards pass, so an unclosed opener costs O(1) instead of a rescan (no quadratic blow-up on
// strings like "[[[[…" or "****…"). Nothing here is a RegExp over the input.
import { toSafeHref } from './security/links.ts'

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'em'; children: InlineNode[] }
  | { type: 'link'; href: string; children: InlineNode[] }

const MAX_DEPTH = 8
const NONE = Number.MAX_SAFE_INTEGER

type Tables = Record<'tick' | 'double' | 'single' | 'close' | 'paren', number[]>

/** next[i] = the smallest j ≥ i where test(j) holds, else NONE. */
function nextWhere(n: number, test: (j: number) => boolean): number[] {
  const next = new Array<number>(n + 1).fill(NONE)
  for (let j = n - 1; j >= 0; j--) next[j] = test(j) ? j : (next[j + 1] ?? NONE)
  return next
}

function tables(s: string): Tables {
  const n = s.length
  const at = (j: number) => s[j]
  return {
    tick: nextWhere(n, (j) => at(j) === '`'),
    double: nextWhere(n, (j) => at(j) === '*' && at(j + 1) === '*'),
    // A lone '*' (not part of '**') closes emphasis.
    single: nextWhere(n, (j) => at(j) === '*' && at(j + 1) !== '*' && at(j - 1) !== '*'),
    close: nextWhere(n, (j) => at(j) === ']'),
    paren: nextWhere(n, (j) => at(j) === ')'),
  }
}

function lookup(table: ArrayLike<number>, from: number): number {
  return table[from] ?? NONE
}

export function parseInline(input: string): InlineNode[] {
  const t = tables(input)

  function parse(start: number, end: number, depth: number, inLink: boolean): InlineNode[] {
    const out: InlineNode[] = []
    let text = ''
    const flush = () => {
      if (text) out.push({ type: 'text', value: text })
      text = ''
    }
    let i = start
    while (i < end) {
      const ch = input[i]
      if (depth < MAX_DEPTH) {
        if (ch === '`') {
          const j = lookup(t.tick, i + 1)
          if (j < end && j > i + 1) {
            flush()
            out.push({ type: 'code', value: input.slice(i + 1, j) })
            i = j + 1
            continue
          }
        } else if (ch === '*' && input[i + 1] === '*') {
          const j = lookup(t.double, i + 2)
          if (j < end && j > i + 2) {
            flush()
            out.push({ type: 'strong', children: parse(i + 2, j, depth + 1, inLink) })
            i = j + 2
            continue
          }
        } else if (ch === '*') {
          const j = lookup(t.single, i + 1)
          if (j < end && j > i + 1) {
            flush()
            out.push({ type: 'em', children: parse(i + 1, j, depth + 1, inLink) })
            i = j + 1
            continue
          }
        } else if (ch === '[' && !inLink) {
          const j = lookup(t.close, i + 1)
          const k = j < end && input[j + 1] === '(' ? lookup(t.paren, j + 2) : NONE
          if (k < end && j > i + 1) {
            flush()
            const children = parse(i + 1, j, depth + 1, true)
            const safe = toSafeHref(input.slice(j + 2, k))
            if (safe) out.push({ type: 'link', href: safe.href, children })
            else out.push(...children)
            i = k + 1
            continue
          }
        }
      }
      text += ch
      i++
    }
    flush()
    return out
  }

  return parse(0, input.length, 0, false)
}

/** The plain text an AST reads as (for titles, alt text and markdown checks). */
export function inlineText(nodes: readonly InlineNode[]): string {
  return nodes.map((n) => ('value' in n ? n.value : inlineText(n.children))).join('')
}
