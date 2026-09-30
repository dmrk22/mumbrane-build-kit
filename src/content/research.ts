// /research, /news and the article template (CONTENT §3.3, §3.4). Research copy from
// src/content/source/research.md; links to the old site mapped to this site's routes.

export const RESEARCH = {
  hero: {
    eyebrow: 'Research',
    title: 'Intelligence, at the edge of *possibility.*',
    abstract: [
      'How far can intelligence go in a physical universe? We want to build general intelligence from the mathematics of fields: knowledge as structure, reasoning as evolving state, and energy as a way to guide the search.',
      'The furthest intelligence physics permits is a research destination. We do not yet know whether a single universal ceiling is meaningful. Our practical work studies attainable frontiers for specific tasks, evidence, and resources.',
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
        question: 'Can knowledge become a field?',
        gloss: 'Knowledge as persistent, layered structure whose relationships shape each new problem.',
        painting: 'inquiry-representation',
      },
      {
        name: 'Dynamics',
        question: 'What makes a field reason?',
        gloss: 'A goal and its constraints shape an objective; inference seeks a configuration that fits.',
        painting: 'inquiry-dynamics',
      },
      {
        name: 'Causality',
        question: 'What can a system know, and when?',
        gloss: 'Which information can reach a decision, and when it can arrive.',
        painting: 'inquiry-causality',
      },
    ],
    relativity:
      'Special relativity informs the causal question of which information can reach a decision, and when. Physical spacetime and cognitive state space are distinct; their connection must be made precise and tested.',
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
      'Moth gives us a working foundation for testing representation, composition, and evidence. Preview 004 classifies entities against compiled facts and definitions, using English-authored interpretation skills and native constraint reasoning. We test wording changes, changed definitions, missing support, and retained replay.',
      'The broader energy-guided and relativistic approach remains a research proposal. Preview 004 does not establish continuous energy optimization or a universal bound on intelligence.',
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
    text: 'Research collaborations, evaluations, and questions about the approach are welcome.',
    action: { label: 'Talk to the lab', href: '/contact?interest=research' },
  },
} as const

export const NEWS = {
  hero: {
    eyebrow: 'News',
    title: 'News',
    lede: 'Product developments, engineering decisions, and practical examples from Mumbrane Labs.',
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
