// Home page copy (CONTENT §3.1). Inline markup (*italic*, `code`) is rendered by <Inline>.
// Release figures come from claims.ts so each one stays traceable to releases.md.
import { claim } from './claims.ts'
import { CORE_OUTCOMES } from './outcomes.ts'

export const HOME = {
  hero: {
    announcement: {
      label: 'Moth Preview 004 is out — a local CLI with checked answers',
      href: '/news/introducing-moth-preview-004',
    },
    // One entry per line from 1024 px; below that the lines flow as one text box (the LCP element).
    titleLines: ['Intelligence for', 'closed worlds.'],
    lede: 'Mumbrane builds constraint-based models that reason from the facts and definitions you supply — and show the evidence behind every result.',
    primary: { label: 'Explore Moth', href: '/moth' },
    secondary: { label: 'Read the research', href: '/research' },
    field: { field: 'field', candidate: 'candidate', answer: 'answer' },
  },

  principle: {
    lead: 'The decisions that matter most already have a rulebook.',
    rest: 'Moth answers from the world you define — and says when that world cannot support an answer.',
    rows: [
      { from: 'your facts', via: 'moth', to: 'answer', supported: true },
      { from: 'your facts', via: 'moth', to: 'no support', supported: false },
    ],
    caption: 'Missing support is not the same as a no.',
    figureLabel: 'Diagram: your facts lead through Moth to an answer, or end without support.',
  },

  how: {
    title: 'Define the world a decision should follow.',
    lede: 'Turn your facts and definitions into a reusable knowledge field. Ask whether an entity meets your criteria, then inspect the answer and the evidence behind it.',
    steps: [
      {
        name: 'Define',
        text: 'Supply the vocabulary, facts, relationships, and definitions for a task.',
        tag: 'Facts · definitions',
      },
      {
        name: 'Compile',
        text: 'Check the interpretation and build a retained, versioned field.',
        tag: 'Versioned field',
      },
      {
        name: 'Ask',
        text: 'Interpret a supported question against a selected field version.',
        tag: 'Supported English',
      },
      {
        name: 'Check',
        text: 'Native reasoning establishes a classification; a pinned response plan writes checked English or JSON.',
        tag: 'Checked result',
      },
      {
        name: 'Replay',
        text: 'Retain the evidence and replay an earlier episode against its original build.',
        tag: 'Retained evidence',
      },
    ],
    // The purchasing world as two chains: one reaches its answer, one has no support.
    diagram: {
      rules: [
        ['approved supplier', 'passed inspection'],
        ['purchase-ready', 'has funds', 'approved supplier'],
      ],
      build: 'build f3a9',
      chains: [
        {
          query: 'orderone?',
          steps: ['has funds', 'atlas passed inspection', 'approved supplier'],
          end: 'purchase-ready',
          outcome: 'supported',
          note: 'supported',
        },
        {
          query: 'ordertwo?',
          steps: ['has funds', 'birch passed audit'],
          end: 'approved supplier',
          outcome: 'unproven',
          note: 'no support · audit is not inspection',
        },
      ],
      replay: 'replay f3a9 · same runtime · same answer',
      label: 'Diagram: the purchasing example, step by step.',
    },
    caption: 'Explanatory example from the purchasing world — not a live console.',
    actions: [
      { label: 'Explore Moth', href: '/moth' },
      { label: 'Release & evidence', href: '/moth#evidence' },
    ],
  },

  evidence: {
    title: 'A useful answer keeps its reasons.',
    text: 'When the field cannot establish an answer, Moth says why. Missing support, conflicting information, and incomplete execution mean different things, so they are reported differently — and each points to a different next step.',
    ledger: CORE_OUTCOMES,
    ledgerHeads: { outcome: 'Outcome', meaning: 'What it means', next: 'What to do next' },
    sealCaption:
      'Checked execution does not prove outside-world truth. It shows what follows from the world you defined.',
  },

  compounding: {
    title: 'Can knowledge compound into more general reasoning?',
    text: 'A definition can build on another definition. An interpretation skill can make a new sentence form usable. We study when these retained dependencies extend what a system can do on new tasks.',
    items: [
      { name: 'Representation', question: 'How should knowledge and its relationships be retained?' },
      { name: 'Composition', question: 'When does new knowledge make earlier knowledge more useful?' },
      { name: 'Inference', question: 'How should a goal shape the search for an answer?' },
      { name: 'Evaluation', question: 'What evidence would show that the approach works?' },
    ],
    closing:
      'Progress means preserving meaning, using dependencies correctly, and improving results on new cases — not merely storing more information.',
  },

  research: {
    title: 'Intelligence, at the edge of possibility.',
    text: 'How far can intelligence go in a physical universe? We are investigating how information, resources, and causality — including ideas from relativity — might make that question precise.',
    link: { label: 'All research', href: '/research' },
    plates: [
      'toward-field-based-intelligence',
      'different-wording-different-meaning',
      'when-the-field-cannot-establish-an-answer',
    ],
  },

  release: {
    eyebrow: 'current release',
    title: claim('release'),
    text: `A local CLI preview for configurable classification over compiled fields, with ${claim('worlds')} — purchasing, libraries, trails, and venues.`,
    specs: [
      { label: 'Platform', value: `${claim('platform')} · ${claim('python')} · locally available uv` },
      {
        label: 'Profile',
        value: `${claim('profile')} · ${claim('models')} across two profile families`,
      },
      {
        label: 'Qualified',
        value: `${claim('core-answers')} core answers · ${claim('replays')} historical replays · ${claim('refusals')} expected refusals`,
      },
      { label: 'Regression', value: claim('regression') },
      { label: 'Not included', value: 'hosted console · public inference API' },
    ],
    caveat: 'Finite synthetic panels — not a blind generalization benchmark.',
    action: { label: 'Release & evidence', href: '/moth#evidence' },
  },

  news: {
    title: 'Field notes',
    link: { label: 'All posts', href: '/news' },
  },

  getStarted: {
    title: 'Start with the current preview.',
    cards: [
      {
        title: 'Explore on your own',
        text: 'Try the console preview in your browser, then see what Preview 004 supports, how it was tested, and where its limits are.',
        action: { label: 'Try the console', href: '/console' },
      },
      {
        title: 'Talk to the team',
        text: 'Discuss a use case, an evaluation, or a research collaboration.',
        action: { label: 'Contact us', href: '/contact' },
      },
    ],
  },
} as const
