// Home page copy (CONTENT §3.1, field framing D-134). Inline markup (*italic*, `code`) is rendered
// by <Inline>. Release figures come from claims.ts so each one stays traceable to releases.md.
import { claim } from './claims.ts'
import type { Outcome } from './outcomes.ts'

export const HOME = {
  hero: {
    announcement: {
      label: 'Moth Preview 004 is out — a local CLI with checked answers',
      href: '/news/introducing-moth-preview-004',
    },
    // One entry per line from 1024 px; below that the lines flow as one text box (the LCP element).
    titleLines: ['Data as a field.', 'Answers at rest.'],
    lede: 'Your data becomes the field. A question settles where your facts and definitions support it; that equilibrium is the answer, with its evidence.',
    primary: { label: 'Explore Moth', href: '/moth' },
    secondary: { label: 'Read the research', href: '/research' },
    // The membrane (D-137): the figure's labels, its keyboard control and what that announces, and
    // the caption marking it as a conceptual illustration (CONTENT §4).
    field: {
      facts: 'your facts',
      priority: 'priority',
      candidate: 'candidate',
      question: 'question',
      answer: 'answer',
      forming: 'forming the field',
      settling: 'settling',
      rest: 'at rest',
      drop: 'Drop a question into the field',
      // {n} is the question's number, so a repeated outcome is still announced.
      restedPriority: 'Question {n} came to rest in the priority well.',
      restedFact: 'Question {n} came to rest at one of your facts.',
      caption:
        'Conceptual illustration. Your facts shape the field; a question rolls to rest where they support it.',
    },
  },

  principle: {
    lead: 'Whatever you put in becomes the truth.',
    rest: 'Moth answers only from your facts and definitions, or says they cannot support an answer.',
    rows: [
      { from: 'your facts', via: 'field', to: 'answer', supported: true },
      { from: 'your facts', via: 'field', to: 'no support', supported: false },
    ],
    caption: 'Missing support is not the same as a no.',
    figureLabel: 'Diagram: your facts form a field that leads to an answer, or ends without support.',
  },

  how: {
    eyebrow: 'how moth works',
    title: 'Build the field. Let the question settle.',
    lede: 'Follow one small purchasing world: what you write down, how it becomes a field, and where two questions come to rest.',
    steps: [
      {
        name: 'Define',
        text: 'Write down the facts, and what your words mean. Nothing else counts as true.',
      },
      { name: 'Encode', text: 'Encoders place each fact in the field, and the field is fixed as a build.' },
      { name: 'Ask', text: 'A question enters the field. Asking never changes it.' },
      { name: 'Settle', text: 'It comes to rest where your definitions lead, or stops and says why.' },
      { name: 'Replay', text: 'Same build, same question: the same answer, with the same evidence.' },
    ],
    // The purchasing world as a map of the field (D-138): each question's path either runs down
    // into its answer's basin or stops on flat ground where no definition leads on.
    diagram: {
      world: 'purchasing world',
      definitionsLabel: 'definitions',
      definitions: [
        { term: 'approved supplier', means: '= passed inspection' },
        { term: 'purchase-ready', means: '= has funds + approved supplier' },
      ],
      fieldLabel: 'the field',
      build: 'build f3a9 · fixed',
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
      replay: 'replay f3a9 · same answer · same evidence',
      // Keys `href` and `path` are reserved for links (links.test), hence `route`.
      legend: { record: 'on record', missing: 'missing', route: 'path to an answer', none: 'no support' },
      label: 'Diagram: the purchasing example, step by step.',
    },
    caption:
      'Explanatory example. In Preview 004, settling is native constraint reasoning; a continuous field is what we are building.',
    actions: [
      { label: 'Explore Moth', href: '/moth' },
      { label: 'Release & evidence', href: '/moth#evidence' },
    ],
  },

  evidence: {
    title: 'Not every question finds a resting place.',
    text: 'When nothing in the field supports an answer, Moth says so, and why.',
    ledger: ['supported', 'unproven', 'conflict'] as const satisfies readonly Outcome[],
    ledgerHeads: { outcome: 'Outcome', meaning: 'What it means', next: 'What to do next' },
    sealCaption: 'An answer shows what follows from your field. It does not prove outside-world truth.',
  },

  compounding: {
    title: 'Close to ideas that already work.',
    text: 'Memory as a landscape. Inference as rolling downhill.',
    items: [
      {
        name: 'Modern Hopfield networks',
        question: 'A query settles into the nearest stored pattern. Attention is one step of this update.',
      },
      {
        name: 'Mean shift',
        question: 'A point moves to the weighted average of its neighbors until it stops.',
      },
      { name: 'Energy-based models', question: 'The best answer is the lowest-energy configuration.' },
      { name: 'Weighted memories', question: 'Weightier facts pull harder. These are priority inputs.' },
    ],
    closing:
      'Equilibrium is a candidate, not a guarantee. A question can rest between similar memories, so every result is checked.',
  },

  research: {
    title: 'Intelligence, at the edge of possibility.',
    text: 'How far can a field-based system go, and what limits it?',
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
    text: `A local CLI preview with ${claim('worlds')}.`,
    specs: [
      { label: 'Platform', value: `${claim('platform')} · ${claim('python')} · locally available uv` },
      {
        label: 'Qualified',
        value: `${claim('core-answers')} core answers · ${claim('replays')} historical replays · ${claim('refusals')} expected refusals`,
      },
      { label: 'Not included', value: 'hosted console · public inference API' },
    ],
    caveat: 'Finite synthetic panels — not a blind generalization benchmark.',
    action: { label: 'Release & evidence', href: '/moth#evidence' },
  },

  getStarted: {
    title: 'Start with the current preview.',
    cards: [
      {
        title: 'Explore on your own',
        text: 'Try the console preview, then read what Preview 004 supports.',
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
