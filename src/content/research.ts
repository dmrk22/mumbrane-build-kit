// /research, /news and the article template (CONTENT §3.3, §3.4, field framing D-134). Research
// copy rewritten from src/content/source/research.md; links mapped to this site's routes.

export const RESEARCH = {
  hero: {
    eyebrow: 'Research',
    title: 'Intelligence, at the edge of *possibility.*',
    abstract: [
      'Field-based intelligence stores knowledge as the shape of a field, and the data itself makes that shape. Reasoning is what happens when a question is dropped into the field and allowed to settle. Where it comes to rest is the answer.',
      'How far that can go in a physical universe is our long-range question.',
    ],
    painting: 'research-hero',
    // The glass caption card on the painting (PAGES §3.1); the seed is read from the registry.
    caption: 'Plate 0 — Oil on code',
  },
  inquiry: {
    eyebrow: 'Three connected lines of inquiry',
    title: 'Representation, dynamics, causality.',
    lines: [
      {
        name: 'Representation',
        question: 'Can data become a field?',
        gloss:
          'Pretrained encoders place each fact; together the facts shape the field. Weighted facts shape it more.',
        painting: 'inquiry-representation',
      },
      {
        name: 'Dynamics',
        question: 'Where does a question come to rest?',
        gloss:
          'A question moves through the fixed field until the pull balances. That resting point is a candidate answer.',
        painting: 'inquiry-dynamics',
      },
      {
        name: 'Causality',
        question: 'What can a system know, and when?',
        gloss: 'Which information can reach a decision, and when.',
        painting: 'inquiry-causality',
      },
    ],
    relativity:
      'Special relativity informs this question; any link to a model’s state space must be made precise and tested.',
    figure: 'Fig. 01 — What can reach a decision',
    figureCaption:
      'The geometry and light-cone visualizations on this page are conceptual studies, not experimental results.',
    cone: {
      decision: 'decision',
      reachable: 'can reach it',
      unreachable: 'cannot reach it yet',
      time: 'time',
    },
  },
  experiment: {
    eyebrow: 'From hypothesis to experiment',
    title: 'A working foundation, and a proposal.',
    paragraphs: [
      'Moth is where we test it. Preview 004 compiles facts and definitions into a fixed field and answers with native constraint reasoning.',
      'Settling in a continuous field remains a research proposal. Preview 004 does not establish continuous energy optimization or a universal bound on intelligence.',
    ],
    links: [
      { label: 'Read the current evidence', href: '/moth#evidence' },
      { label: 'Meet Moth', href: '/moth' },
      { label: 'Talk to the lab', href: '/contact?interest=research' },
    ],
  },
  perspectives: {
    eyebrow: 'Research perspectives',
    title: 'Perspectives',
  },
  cta: {
    title: 'Talk to the lab.',
    text: 'Collaborations, evaluations, and questions about the approach are welcome.',
    action: { label: 'Talk to the lab', href: '/contact?interest=research' },
  },
} as const

export const NEWS = {
  hero: {
    eyebrow: 'News',
    title: 'News',
    lede: 'Releases, engineering notes, and worked examples from Mumbrane Labs.',
  },
  featured: 'Latest',
  read: 'Read',
  all: 'All posts',
} as const

// Strings of the shared article template (PAGES §3.2).
export const ARTICLE_UI = {
  research: 'Research',
  news: 'News',
  published: 'Published',
  updated: 'Updated',
  by: 'By',
  readingTime: 'Reading time',
  minutes: (n: number) => `${n} min read`,
  contents: 'Contents',
  oilOnCode: 'Oil on code',
  seed: 'Seed',
  citeAs: 'Cite as',
  copyCitation: 'Copy the citation',
  markdown: 'Read as markdown',
  related: 'Related',
} as const
