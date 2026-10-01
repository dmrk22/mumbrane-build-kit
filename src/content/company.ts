// /company and /careers copy (CONTENT §3.5, §3.6). Inline markup (*italic*) via <Inline>.

/** Block grounds, a walk through chalk pigments; the component maps each to a ground + text pair
 (checked in contrast.test.ts). */
export type BlockFill =
  | 'sulfur'
  | 'ochre'
  | 'cinnabar'
  | 'madder'
  | 'iris'
  | 'verdigris'
  | 'malachite'
  | 'moss'
  | 'paper'
  | 'paper-2'
  | 'paper-3'
  | 'ink'

export type CompanyBlock =
  | {
      kind: 'open'
      label: string
      text: string
      fill: BlockFill
      /** Position in the unlock sequence (1–12), alternating colours and sizes (DESIGN §7.6). */
      step: number
      wide?: true
      href?: string
    }
  /** Genuinely future work: stays locked in every state, labelled honestly. */
  | { kind: 'locked'; label: string }

export const COMPANY = {
  hero: {
    eyebrow: 'Company',
    title: 'The lab, block by block.',
    lede: 'Mumbrane is an independent research lab investigating field-based intelligence. We study how retained knowledge, reusable skills, and explicit constraints can support more general reasoning.',
  },
  blocks: {
    unlocked: 'proven',
    locked: 'Unproven',
    // Reading order is the 6-column layout order (board 05-company-blocks): three rows of six cells.
    items: [
      {
        kind: 'open',
        label: 'Mission',
        text: 'Intelligence that answers from the world you define.',
        fill: 'sulfur',
        step: 1,
        wide: true,
      },
      {
        kind: 'open',
        label: 'The name',
        text: 'μ + membrane. A particle that passes through; a boundary that holds.',
        fill: 'malachite',
        step: 9,
      },
      { kind: 'open', label: 'Principle 01', text: 'Evidence before eloquence.', fill: 'madder', step: 6 },
      { kind: 'open', label: 'Independent', text: 'An independent research lab.', fill: 'paper-3', step: 11 },
      {
        kind: 'open',
        label: 'Principle 02',
        text: 'Say what is supported. Say what is not.',
        fill: 'ochre',
        step: 2,
      },
      { kind: 'locked', label: 'Hosted console — in preparation' },
      {
        kind: 'open',
        label: 'Moth',
        text: 'Preview 004 · local CLI · checked answers',
        fill: 'paper',
        step: 3,
        wide: true,
        href: '/moth',
      },
      {
        kind: 'open',
        label: 'Principle 04',
        text: 'Publish the limits with the results.',
        fill: 'ink',
        step: 12,
      },
      { kind: 'open', label: 'Careers', text: 'Join the lab', fill: 'cinnabar', step: 4, href: '/careers' },
      { kind: 'locked', label: 'Moth Base — proposed' },
      {
        kind: 'open',
        label: 'Research',
        text: 'Representation · Dynamics · Causality',
        fill: 'iris',
        step: 5,
        wide: true,
        href: '/research',
      },
      {
        kind: 'open',
        label: 'Contact',
        text: 'hello@mumbrane.com',
        fill: 'verdigris',
        step: 7,
        href: 'mailto:hello@mumbrane.com',
      },
      {
        kind: 'open',
        label: 'Principle 03',
        text: 'Replay every answer against the build that made it.',
        fill: 'moss',
        step: 10,
      },
      { kind: 'locked', label: 'Public API — not yet available' },
      {
        kind: 'open',
        label: 'News',
        text: 'Introducing Moth Preview 004',
        fill: 'paper-2',
        step: 8,
        href: '/news/introducing-moth-preview-004',
      },
    ] satisfies CompanyBlock[] as CompanyBlock[],
  },
  about: {
    title: 'Why closed worlds',
    text: 'Most consequential decisions already have a rulebook — a policy, a contract, a definition of done. We build models that take that rulebook as the whole world, reason inside it, and show their work. When the rulebook is silent, the model says so. That is the discipline we want from intelligence before we ask it to be general.',
    painting: 'company-plate',
  },
  name: {
    title: 'Muon + membrane',
    text: 'A muon is a particle that passes through almost anything — mountains, buildings, detectors. A membrane is a boundary that decides what passes. Mumbrane is both: reasoning that moves freely, inside a boundary you define.',
    figure: 'Fig. 02 — Conceptual illustration',
    labels: { muon: 'μ', track: 'muon track', membrane: 'membrane' },
  },
  cta: {
    title: 'Keep going',
    links: [
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'News', href: '/news' },
    ],
  },
} as const

export const CAREERS = {
  hero: {
    eyebrow: 'Careers',
    title: 'Work on intelligence you can *check.*',
    lede: 'We are not listing open roles right now, but we read every thoughtful note.',
  },
  principles: {
    title: 'How we work',
    items: [
      'Evidence before eloquence',
      'Small, inspectable systems first',
      'Publish the limits with the results',
      'Design is part of the science',
    ],
  },
  areas: {
    title: 'Areas we care about\u00A0— not open roles',
    // Glosses authored for layout (PAGES §6); owner to confirm (BUILD_STATE open questions).
    items: [
      {
        name: 'Formal semantics and controlled language',
        gloss: 'How English definitions become precise, checkable meaning.',
      },
      {
        name: 'Constraint reasoning and program analysis',
        gloss: 'Deciding what follows from a rulebook, and proving it.',
      },
      {
        name: 'Physics-inspired models and energy-based methods',
        gloss: 'Fields, energy and dynamics as a way to guide inference.',
      },
      { name: 'Systems and runtime engineering', gloss: 'Retained, versioned builds that replay exactly.' },
      { name: 'Evaluation design', gloss: 'Tests that separate a supported answer from a lucky one.' },
      { name: 'Interface design for evidence', gloss: 'Making the reasons behind a result easy to inspect.' },
    ],
  },
  cta: {
    title: 'Write to us.',
    note: 'When we open roles, they will be listed here.',
    email: { label: 'Write to us', href: 'mailto:hello@mumbrane.com?subject=Careers' },
    form: { label: 'Use the contact form', href: '/contact?interest=careers' },
  },
} as const
