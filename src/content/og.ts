// Social cards (CONTENT §6): one 1200 × 630 card per family, rendered by /lab/og/[family] and
// captured into public/og/<family>.png by `pnpm og`. Titles reuse each section's own copy.
import { proseDate } from '../lib/format.ts'
import { ARTICLES, articlePath } from './articles.ts'
import { COMPANY } from './company.ts'
import { DEVELOPERS } from './developers.ts'
import { MOTH } from './moth.ts'
import type { PaintingId } from './paintings.ts'
import { RESEARCH } from './research.ts'
import { SOLUTIONS_OVERVIEW } from './solutions.ts'

export type OgCard = {
  family: string
  eyebrow: string
  /** Inline markup allowed (the italic turn of meaning). */
  title: string
  painting: PaintingId
  meta: string
}

/**
 * The default card is not generated: it is the owner's brand/og-default.png, copied to
 * public/og/default.png by scripts/brand.ts and held byte-identical by brand.test.ts.
 */
export const DEFAULT_OG = '/og/default.png'

export const OG_CARDS: readonly OgCard[] = [
  {
    family: 'moth',
    eyebrow: MOTH.hero.eyebrow,
    title: MOTH.hero.subhead,
    painting: 'plate-preview',
    meta: 'mumbrane.com/moth',
  },
  {
    family: 'research',
    eyebrow: RESEARCH.hero.eyebrow,
    title: RESEARCH.hero.title,
    painting: 'research-hero',
    meta: 'mumbrane.com/research',
  },
  {
    family: 'news',
    eyebrow: 'News',
    title: 'Field notes from *Mumbrane Labs.*',
    painting: 'plate-wording',
    meta: 'mumbrane.com/news',
  },
  {
    family: 'company',
    eyebrow: COMPANY.hero.eyebrow,
    title: COMPANY.hero.title,
    painting: 'company-plate',
    meta: 'mumbrane.com/company',
  },
  {
    family: 'solutions',
    eyebrow: SOLUTIONS_OVERVIEW.eyebrow,
    title: SOLUTIONS_OVERVIEW.title,
    painting: 'plate-field',
    meta: 'mumbrane.com/solutions',
  },
  {
    family: 'developers',
    eyebrow: DEVELOPERS.hero.eyebrow,
    title: DEVELOPERS.hero.title,
    painting: 'plate-evidence',
    meta: 'mumbrane.com/developers',
  },
  {
    family: 'legal',
    eyebrow: 'Legal',
    title: 'Terms, privacy, and *responsible disclosure.*',
    painting: 'inquiry-causality',
    // There is no /legal index page; the card serves every /legal/<slug>.
    meta: 'mumbrane.com',
  },
  ...ARTICLES.map((a) => ({
    family: `${a.section}-${a.slug}`,
    eyebrow: a.section === 'research' ? 'Research' : 'News',
    title: a.title,
    painting: a.plate,
    meta: `${proseDate(a.published)} · Mumbrane Labs`,
  })),
]

// First match wins, so a longer prefix sits above its parent.
const FAMILY_BY_PREFIX: readonly (readonly [prefix: string, family: string])[] = [
  ['/developers/models', 'moth'],
  ['/moth', 'moth'],
  ['/developers', 'developers'],
  ['/pricing', 'developers'],
  ['/changelog', 'developers'],
  ['/status', 'developers'],
  ['/research', 'research'],
  ['/news', 'news'],
  ['/company', 'company'],
  ['/careers', 'company'],
  ['/contact', 'company'],
  ['/solutions', 'solutions'],
  ['/legal', 'legal'],
]

/** The card a route shares: an article's own card, else its section's, else the default. */
export function ogImage(path: string): `/og/${string}.png` {
  const article = ARTICLES.find((a) => articlePath(a) === path)
  if (article) return `/og/${article.section}-${article.slug}.png`
  const hit = FAMILY_BY_PREFIX.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`))
  return hit ? `/og/${hit[1]}.png` : DEFAULT_OG
}
