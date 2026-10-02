// Markdown documents for agents (PAGES §0.7, CONTENT §6), served at /md/<key> and listed by
// /llms.txt. Key pages are composed from the same content modules their HTML pages render; legal
// pages and articles reuse their blocks — so the markdown cannot drift from the site.
import { ARTICLES, articleBody, articlePath } from './articleDocs.ts'
import { type Block, slugify } from './blocks.ts'
import { CONTACT } from './contact.ts'
import { HOME } from './home.ts'
import { LEGAL, LEGAL_UI } from './legal.ts'
import { MOTH } from './moth.ts'
import { OUTCOMES, type Outcome } from './outcomes.ts'
import { CHANGELOG } from './pricing.ts'
import { RESEARCH } from './research.ts'
import { type RoutePath, routeFor } from './routes.ts'
import { site } from './site.ts'

export const LLMS = {
  title: 'Mumbrane',
  summary:
    'Mumbrane is an independent lab building field-based intelligence: knowledge stored as the shape of a field made from your data, and reasoning as a question settling in it. Its first model, Moth, answers only from the facts and definitions you supply, shows its evidence, and says plainly when the field cannot support an answer. Preview 004 compiles a fixed field and uses native constraint reasoning; continuous settling is proposed work.',
  intro:
    'Use the Markdown documents below for clean agent context. Canonical HTML URLs are included in each document’s frontmatter.',
  core: 'Core pages',
  publications: 'Publications',
} as const

export type MdDoc = {
  /** Served at /md/<key>. */
  key: string
  /** The HTML page this document stands for (its canonical URL). */
  path: `/${string}`
  title: string
  description: string
  group: 'core' | 'publication'
  published?: string
  updated?: string
  authors?: readonly string[]
  blocks: readonly Block[]
}

const h2 = (text: string): Block => ({ type: 'h2', text, id: slugify(text) })
const h3 = (text: string): Block => ({ type: 'h3', text, id: slugify(text) })
const p = (text: string): Block => ({ type: 'p', text })
const ul = (items: readonly string[]): Block => ({ type: 'list', ordered: false, items: [...items] })
const ol = (items: readonly string[]): Block => ({ type: 'list', ordered: true, items: [...items] })
const a = (l: { label: string; href: string }) => `[${l.label}](${l.href})`
const outcome = (o: Outcome) => `**${OUTCOMES[o].label}** — ${OUTCOMES[o].meaning} ${OUTCOMES[o].next}`
const steps = (s: readonly { name: string; text: string }[]) => ol(s.map((x) => `**${x.name}** — ${x.text}`))

const page = (path: RoutePath, key: string, blocks: Block[], title = routeFor(path).title): MdDoc => ({
  key,
  path,
  title,
  description: routeFor(path).description,
  group: 'core',
  blocks,
})

const home = page(
  '/',
  'index',
  [
    h2(HOME.principle.lead),
    p(HOME.principle.rest),
    h2(HOME.how.title),
    p(HOME.how.lede),
    steps(HOME.how.steps),
    h2(HOME.evidence.title),
    p(HOME.evidence.text),
    ul(HOME.evidence.ledger.map(outcome)),
    p(HOME.evidence.sealCaption),
    h2(HOME.compounding.title),
    p(HOME.compounding.text),
    ul(HOME.compounding.items.map((i) => `**${i.name}:** ${i.question}`)),
    p(HOME.compounding.closing),
    h2(HOME.research.title),
    p(`${HOME.research.text} ${a(HOME.research.link)}`),
    h2(HOME.release.title),
    p(HOME.release.text),
    ul(HOME.release.specs.map((s) => `${s.label}: ${s.value}`)),
    p(`${HOME.release.caveat} ${a(HOME.release.action)}`),
    h2(HOME.getStarted.title),
    ul(HOME.getStarted.cards.map((c) => `**${c.title}** — ${c.text} ${a(c.action)}`)),
  ],
  site.title,
)

const m = MOTH
const moth = page('/moth', 'moth', [
  p(m.hero.subhead),
  p(m.hero.lede),
  h2(m.how.title),
  steps(m.how.steps),
  h2(m.purchasing.title),
  p(`*${m.purchasing.label}.*`),
  ul(m.purchasing.definitions.inspection),
  ul(m.purchasing.facts),
  p(m.purchasing.note),
  p(m.purchasing.disclaimer),
  h2(m.outcomes.title),
  ul(m.outcomes.ledger.map(outcome)),
  ...m.outcomes.boundaries.map(p),
  h2(m.preview.title),
  p(m.preview.scope),
  p(m.preview.platform),
  h3(m.preview.supportsTitle),
  ul(m.preview.supports),
  p(m.preview.note),
  h2(m.qualification.title),
  {
    type: 'table',
    caption: m.qualification.caption,
    columns: [...m.qualification.columns],
    rows: m.qualification.rows.map((r) => [...r]),
  },
  ...m.qualification.caveats.map(p),
  h2(m.direction.title),
  p(`**${m.direction.tag}.** ${m.direction.text}`),
  h2(m.getPreview.title),
  p(`${m.getPreview.text} ${a(m.getPreview.primary)} · ${a(m.getPreview.secondary)}`),
])

const bySection = (section: 'research' | 'news') => ARTICLES.filter((x) => x.section === section)
const articleItem = (x: (typeof ARTICLES)[number]) =>
  `[${x.title}](${articlePath(x)}) — ${x.description} (${x.published})`

const research = page('/research', 'research', [
  ...RESEARCH.hero.abstract.map(p),
  h2(RESEARCH.inquiry.title),
  ul(RESEARCH.inquiry.lines.map((l) => `**${l.name}** — ${l.question} ${l.gloss}`)),
  p(RESEARCH.inquiry.relativity),
  h2(RESEARCH.experiment.title),
  ...RESEARCH.experiment.paragraphs.map(p),
  p(RESEARCH.experiment.links.map(a).join(' · ')),
  h2(RESEARCH.perspectives.title),
  ul(bySection('research').map(articleItem)),
  p(`${RESEARCH.cta.text} ${a(RESEARCH.cta.action)}`),
])

// The registry descriptions of /news and /contact are their ledes; toMarkdown prints them once.
const news = page('/news', 'news', [ul(bySection('news').map(articleItem))])

const contact = page('/contact', 'contact', [
  ul(CONTACT.emails.map((e) => `**${e.label}:** [${e.address}](mailto:${e.address})`)),
  p(CONTACT.note),
])

const changelog = page('/changelog', 'changelog', [
  ul(
    CHANGELOG.entries.map((e) => `**${e.date}** — [${e.title}](${e.href}) (${e.tags.join(', ')}). ${e.text}`),
  ),
])

const legal = (slug: 'terms' | 'privacy') => {
  const doc = LEGAL[slug]
  const banner: Block[] = doc.banner
    ? [{ type: 'note', tone: 'caveat', text: LEGAL_UI.banner[doc.banner] }]
    : []
  return { ...page(`/legal/${slug}`, `legal/${slug}`, [...banner, ...doc.blocks]), updated: doc.updated }
}

const articles: MdDoc[] = ARTICLES.map((x) => ({
  key: articlePath(x).slice(1),
  path: articlePath(x),
  title: x.title,
  description: x.description,
  group: 'publication',
  published: x.published,
  ...('updated' in x ? { updated: x.updated } : {}),
  authors: x.authors,
  blocks: articleBody(x.slug),
}))

export const MD_DOCS: readonly MdDoc[] = [
  home,
  moth,
  research,
  news,
  contact,
  changelog,
  legal('terms'),
  legal('privacy'),
  ...articles,
]
