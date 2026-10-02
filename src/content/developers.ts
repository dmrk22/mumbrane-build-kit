// /developers and /developers/docs (CONTENT §3.9, field framing D-134). Release facts come from the
// sources (releases.md, moth.md — reused from moth.ts where they already live) or are labelled
// Illustrative. No endpoints, SDKs, CLI commands or schemas are presented as real (CONTENT §4).
import { claim } from './claims.ts'
import { MOTH } from './moth.ts'

/** The seven concepts, in lifecycle order; the docs glossary reads the same list. */
export const CONCEPTS = [
  {
    term: 'Field',
    text: 'Your facts and definitions, compiled into one fixed, versioned structure. The only source of truth for an answer.',
  },
  {
    term: 'Fact',
    text: 'A supported English statement about an entity, placed in the field at compile time.',
  },
  {
    term: 'Definition',
    text: 'What counts: the conditions an entity must meet. Definitions decide; similar wording does not.',
  },
  {
    term: 'Build',
    text: 'One compiled version of the field. Questions never change it; a change means a new build.',
  },
  { term: 'Question', text: 'Does an entity meet a definition? Asked against one activated build.' },
  {
    term: 'Result',
    text: 'Checked English or JSON with a distinct outcome and the evidence that established it.',
  },
  {
    term: 'Replay',
    text: 'Running a retained episode again against its original build, within the same runtime.',
  },
] as const

export const DEVELOPERS = {
  hero: {
    eyebrow: 'Developers',
    title: 'Build on a *fixed field.*',
    lede: 'Compile facts and definitions into a versioned field, then ask classification questions and get checked English or JSON with the evidence.',
    status: 'Preview 004 is a local CLI. There is no public inference API yet.',
  },
  lifecycle: {
    eyebrow: 'The lifecycle',
    title: 'Define, compile, ask, inspect, replay.',
    figure: 'Fig. 01 — The lifecycle of a field',
    stages: [
      { name: 'Define', text: 'Write the facts and definitions. Nothing else enters the field.' },
      { name: 'Compile', text: 'Build and activate a fixed, versioned field.' },
      { name: 'Ask', text: 'Ask whether an entity meets a definition.' },
      { name: 'Inspect', text: 'Read the checked result and the evidence behind it.' },
      { name: 'Replay', text: 'Run an earlier episode against its original build.' },
    ],
  },
  results: {
    eyebrow: 'Results',
    title: 'Checked English, or JSON.',
    text: 'Each result carries its outcome and evidence. The JSON below shows the idea; the delivery documents the real interface.',
    jsonLabel: 'JSON',
    jsonTag: 'Illustrative — not the Preview 004 schema',
    json: [
      '{',
      '  "question": "Is orderone a purchase-ready item?",',
      '  "outcome": "SUPPORTED",',
      '  "entity": "orderone",',
      '  "definition": "purchase-ready item",',
      '  "evidence": [',
      '    "orderone has funds available",',
      '    "orderone appoints atlas",',
      '    "atlas passed inspection"',
      '  ],',
      '  "build": "f3a9"',
      '}',
    ].join('\n'),
    englishLabel: 'Checked English',
    english:
      'orderone is a purchase-ready item. It has funds available, and its supplier, atlas, passed inspection, so atlas is an approved supplier.',
    questionsLabel: MOTH.contract.examplesLabel,
    questions: MOTH.contract.examples,
  },
  outcomes: {
    eyebrow: 'Outcomes and limits',
    title: 'Distinct outcomes, bounded work.',
    text: 'Missing support, conflict, refusal, and a resource stop each mean something different. The language and its limits are in the documentation.',
    link: { label: 'All outcomes', href: '/moth#outcomes' },
  },
  future: {
    title: 'When the hosted API arrives',
    text: 'It will keep what makes the preview inspectable: fixed fields, explicit outcomes, retained evidence, and replay. We will document it here when it exists.',
  },
  next: [
    { label: 'Documentation', href: '/developers/docs' },
    { label: 'Models', href: '/developers/models' },
  ],
} as const

export type DocSection = {
  id: string
  title: string
  paragraphs: readonly string[]
  code?: { label: string; text: string }
}

export const DOCS = {
  eyebrow: 'Developers',
  // A soft hyphen: at display-l the word is wider than the 256–272 px frame below 337 px, and
  // Chromium never auto-hyphenates a capitalised word (D-144).
  title: 'Documen\u00ADtation',
  lede: 'Concepts and contracts for Moth Preview 004.',
  delivery: {
    text: 'The complete documentation ships with the local delivery:',
    files: ['MODEL.md', 'QUICKSTART.md', 'LANGUAGE-CONTRACT.md', 'LIMITATIONS.md'],
  },
  reviewed: { label: 'Last reviewed', date: '2026-10-01' },
  contents: 'Contents',
  anchor: (heading: string) => `Link to ${heading}`,
  sections: [
    {
      id: 'fields',
      title: 'Fields',
      paragraphs: [
        CONCEPTS[0].text,
        `Current profile: ${claim('profile')}, with ${claim('worlds')} — purchasing, libraries, trails, and venues.`,
      ],
    },
    {
      id: 'facts-and-definitions',
      title: 'Facts and definitions',
      paragraphs: [
        'Facts describe entities; definitions say what counts. Sources use admitted complete sentences, supported positive definitions, and relational conditions.',
      ],
      code: { label: 'Definitions', text: MOTH.purchasing.definitions.inspection.join('\n') },
    },
    {
      id: 'compilation-and-activation',
      title: 'Compilation and activation',
      paragraphs: [
        'Compilation checks the interpretation and builds a fixed field. Local BGE assets take part in compilation; the qualified inference path does not run the encoder.',
        'A change means a new build and activation. Earlier activations can still be queried.',
      ],
    },
    {
      id: 'questions',
      title: 'Questions',
      paragraphs: ['Ask whether an entity meets a definition, against one activated build.'],
    },
    {
      id: 'outcomes',
      title: 'Outcomes',
      paragraphs: [
        'Supported, no supported proof, conflict, refused, resource limit, incomplete, and incompatible are distinct outcomes; each has its own next step. [See the outcomes table](/moth#outcomes).',
        MOTH.outcomes.boundaries[0],
      ],
    },
    {
      id: 'evidence-and-replay',
      title: 'Evidence and replay',
      paragraphs: [
        CONCEPTS[5].text,
        CONCEPTS[6].text,
        'Compiled bundles may include original source spans; compilation does not anonymize sensitive data.',
      ],
    },
    // Rendered with the shared LanguageContract module (rules, examples, skills, limits).
    { id: 'language-contract', title: 'Language contract', paragraphs: [] },
    {
      id: 'limits',
      title: 'Limits',
      paragraphs: [MOTH.outcomes.boundaries[1]],
    },
  ] satisfies DocSection[] as DocSection[],
  glossary: { id: 'glossary', title: 'Glossary' },
} as const
