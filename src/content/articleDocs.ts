// Articles with their bodies, and the markdown documents served at /md/<section>/<slug>.

import { BODIES } from './articleBodies.ts'
import { ARTICLES, type Article, articlePath } from './articles.ts'
import type { Block } from './blocks.ts'

export function articleBody(slug: string): Block[] {
  return BODIES[slug] ?? []
}

/** Words ÷ 230 per minute, at least one minute (PAGES §3.2 reading time). */
export function readingMinutes(a: Article): number {
  const words = [a.description, ...articleBody(a.slug).map((b) => ('text' in b ? b.text : ''))]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 230))
}

export { ARTICLES, articlePath }
