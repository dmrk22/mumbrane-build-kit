// Article index (CONTENT §3.3, §3.4): metadata only. Bodies (typed blocks) join in P8.
// Slugs are the current site's and must not change.
import type { PaintingId } from './paintings.ts'

export type ArticleMeta = {
  slug: string
  section: 'research' | 'news'
  category: string
  title: string
  description: string
  published: string
  updated?: string
  authors: readonly string[]
  tags: readonly string[]
  /** The article's painting and its plate number (Roman on the plate; CONTENT §3.1 fixes I–III). */
  plate: PaintingId
  plateNumber: number
}

export const ARTICLES = [
  {
    slug: 'toward-field-based-intelligence',
    section: 'research',
    category: 'Research perspective',
    // Normalised from the source's "Towards Field based Intelligence" (D-011).
    title: 'Towards field-based intelligence',
    description:
      'Field-based intelligence: knowledge stored as the shape of a field, and reasoning as a question settling in it. Our hypothesis, and its limits.',
    published: '2026-09-16',
    updated: '2026-10-01',
    authors: ['Mumbrane Labs'],
    tags: ['Field-based intelligence', 'Equilibrium', 'Energy-based models'],
    plate: 'plate-field',
    plateNumber: 1,
  },
  {
    slug: 'introducing-moth-preview-004',
    section: 'news',
    category: 'Field notes',
    title: 'Introducing Moth Preview 004',
    description:
      'A local preview that compiles your facts and definitions into a fixed field and answers classification questions with inspectable evidence.',
    published: '2026-09-22',
    authors: ['Mumbrane Labs'],
    tags: [],
    plate: 'plate-preview',
    plateNumber: 4,
  },
  {
    slug: 'different-wording-different-meaning',
    section: 'news',
    category: 'Engineering notes',
    title: 'Different wording. Different meaning.',
    description:
      'Nearness in an encoder’s space is not meaning. How Moth keeps rewording and changed requirements apart: definitions decide.',
    published: '2026-09-22',
    authors: ['Mumbrane Labs'],
    tags: [],
    plate: 'plate-wording',
    plateNumber: 2,
  },
  {
    slug: 'when-the-field-cannot-establish-an-answer',
    section: 'news',
    category: 'Research practice',
    title: 'When the field cannot establish an answer',
    description:
      'Not every question finds a resting place. Missing support, conflict and incomplete execution mean different things, and the answer keeps them apart.',
    published: '2026-09-22',
    authors: ['Mumbrane Labs'],
    tags: [],
    plate: 'plate-evidence',
    plateNumber: 3,
  },
] as const satisfies readonly ArticleMeta[]

export type Article = (typeof ARTICLES)[number]
export type ArticleSlug = Article['slug']

/** Newest first; ties keep source order. */
export function articlesIn(section: ArticleMeta['section']): Article[] {
  return ARTICLES.filter((a) => a.section === section).sort((a, b) => b.published.localeCompare(a.published))
}

export function articleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}

export function articlePath(a: Pick<ArticleMeta, 'section' | 'slug'>): `/${string}` {
  return `/${a.section}/${a.slug}`
}
