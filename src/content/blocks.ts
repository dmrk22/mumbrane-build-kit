// Typed content blocks (PAGES §0.4) for articles, legal pages and long copy. Text fields may carry
// inline markup (bold, italic, code, links) rendered by <Inline>; never HTML.
import type { PaintingId } from './paintings.ts'

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string; id: string }
  | { type: 'h3'; text: string; id: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'code'; lang: string; text: string; label?: string; illustrative?: boolean }
  | { type: 'table'; caption: string; columns: string[]; rows: string[][]; source?: string }
  | { type: 'figure'; painting: PaintingId; caption: string; fig: number }
  | { type: 'note'; tone: 'info' | 'caveat' | 'proposed'; text: string }
  | { type: 'callout'; title: string; text: string; link?: { label: string; href: string } }

/** A heading's anchor: lowercase words joined by hyphens (stable, readable deep links). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*_`[\]()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
