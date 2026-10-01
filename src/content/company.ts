// /company and /careers copy (CONTENT §3.5, §3.6). Inline markup (*italic*) via <Inline>.

/** Block grounds, a walk through chalk pigments; the component maps each to a ground + text pair
 (checked in contrast.test.ts). */
export type BlockFill = 'ice' | 'sand' | 'clay' | 'lilac' | 'paper' | 'paper-2' | 'paper-3' | 'ink'

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
    lede: 'Mumbrane is an independent research lab building field-based intelligence: knowledge as the shape of a field, reasoning as a question settling in it.',
  },
  blocks: {
    unlocked: 'unlocked',
    locked: 'locked',
    // Reading order is the 6-column layout order (board 05-company-blocks): three rows of six cells.
    items: [
      {
        kind: 'open',
        label: 'Mission',
        text: 'Intelligence shaped only by the data you give it.',
        fill: 'paper',
        step: 1,
        wide: true,
      },
      {
        kind: 'open',
        label: 'The name',
        text: 'μ + membrane. A particle that passes through; a boundary that holds.',
        fill: 'paper-3',
        step: 9,
      },
      { kind: 'open', label: 'Principle 01', text: 'Evidence before eloquence.', fill: 'sand', step: 6 },
      { kind: 'open', label: 'Independent', text: 'An independent research lab.', fill: 'paper-2', step: 11 },
      {
        kind: 'open',
        label: 'Principle 02',
        text: 'Say what is supported. Say what is not.',
        fill: 'ice',
        step: 2,
      },
      { kind: 'locked', label: 'Hosted console — in preparation' },
      {
        kind: 'open',
        label: 'Moth',
        text: 'Preview 004 · local CLI · checked answers',
        fill: 'ink',
        step: 3,
        wide: true,
        href: '/moth',
      },
      {
        kind: 'open',
        label: 'Principle 04',
        text: 'Publish the limits with the results.',
        fill: 'paper-2',
        step: 12,
      },
      { kind: 'open', label: 'Careers', text: 'Join the lab', fill: 'clay', step: 4, href: '/careers' },
      { kind: 'locked', label: 'Moth Base — proposed' },
      {
        kind: 'open',
        label: 'Research',
        text: 'Fields · Equilibrium · Causality',
        fill: 'lilac',
        step: 5,
        wide: true,
        href: '/research',
      },
      {
        kind: 'open',
        label: 'Contact',
        text: 'hello@mumbrane.com',
        fill: 'paper',
        step: 7,
        href: 'mailto:hello@mumbrane.com',
      },
      {
        kind: 'open',
        label: 'Principle 03',
        text: 'Replay every answer against the build that made it.',
        fill: 'ice',
        step: 10,
      },
      { kind: 'locked', label: 'Public API — not yet available' },
      {
        kind: 'open',
        label: 'News',
        text: 'Introducing Moth Preview 004',
        fill: 'paper-3',
        step: 8,
        href: '/news/introducing-moth-preview-004',
      },
    ] satisfies CompanyBlock[] as CompanyBlock[],
  },
  about: {
    title: 'Why a field',
    text: 'In a field, the data is the model: whatever you put in becomes the truth, and a question settles where that truth supports it. When nothing supports an answer, the model says so. That is the discipline we want from intelligence before we ask it to be general.',
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
      'A fixed field, checked answers',
      'Publish the limits with the results',
      'Design is part of the science',
    ],
  },
  areas: {
    title: 'Areas we care about\u00A0— not open roles',
    // Glosses authored for layout (PAGES §6); owner to confirm (BUILD_STATE open questions).
    items: [
      {
        name: 'Encoders and representation',
        gloss: 'Placing facts so that nearness helps, without mistaking it for meaning.',
      },
      {
        name: 'Energy-based models and associative memory',
        gloss: 'Landscapes where a question settles: Hopfield networks and their kin.',
      },
      {
        name: 'Dynamics and convergence',
        gloss: 'When settling stops, where it stops, and how weights move it.',
      },
      { name: 'Formal semantics', gloss: 'Definitions precise enough to check a resting point against.' },
      { name: 'Systems and runtime engineering', gloss: 'Fixed, versioned builds that replay exactly.' },
      { name: 'Evaluation design', gloss: 'Tests that separate a supported answer from a lucky one.' },
    ],
  },
  cta: {
    title: 'Write to us.',
    note: 'When we open roles, they will be listed here.',
    email: { label: 'Write to us', href: 'mailto:hello@mumbrane.com?subject=Careers' },
    form: { label: 'Use the contact form', href: '/contact?interest=careers' },
  },
} as const
