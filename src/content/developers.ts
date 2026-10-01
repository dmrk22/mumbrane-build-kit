// /developers and /developers/docs (CONTENT §3.9). Everything here is either the sources' own wording
// (releases.md, moth.md — reused from moth.ts where it already lives) or labelled Illustrative.
// No endpoints, SDKs, CLI commands or schemas are presented as real (CONTENT §4).
import { claim } from './claims.ts'
import { MOTH } from './moth.ts'

/** The seven concepts, in lifecycle order; the docs glossary reads the same list. */
export const CONCEPTS = [
  {
    term: 'Field',
    text: 'Supported English facts, definitions, and interpretation skills, compiled into a versioned, reusable structure.',
  },
  { term: 'Build', text: 'One compiled version of a field. Updates require a new build and activation.' },
  {
    term: 'Activation',
    text: 'The version that questions are asked against. Earlier activations can still be queried.',
  },
  { term: 'Question', text: 'A supported classification question: does an entity meet a definition?' },
  {
    term: 'Result',
    text: 'Checked English or JSON, constructed by a pinned response plan, with a distinct outcome.',
  },
  { term: 'Evidence', text: 'What established the result, retained with it.' },
  {
    term: 'Replay',
    text: 'Running a retained episode again against its original build, within the same runtime.',
  },
] as const

export const DEVELOPERS = {
  hero: {
    eyebrow: 'Developers',
    title: 'Build on *checked answers.*',
    lede: 'Moth compiles supported English facts, definitions, and interpretation skills into a versioned field, then answers classification questions with checked English or JSON results and retained evidence.',
    status: 'Preview 004 is a local CLI. There is no public inference API yet.',
  },
  lifecycle: {
    eyebrow: 'The lifecycle',
    title: 'Define, compile, activate, ask, inspect, replay.',
    figure: 'Fig. 01 — The lifecycle of a field',
    stages: [
      { name: 'Define', text: 'Supply the vocabulary, facts, relationships, and definitions for a task.' },
      { name: 'Compile', text: 'Check the interpretation and build a retained, versioned field.' },
      { name: 'Activate', text: 'Edit source material, rebuild, and activate a new version.' },
      { name: 'Ask', text: 'Interpret a supported question against the selected field version.' },
      { name: 'Inspect', text: 'Read the checked English or JSON result and the evidence behind it.' },
      {
        name: 'Replay',
        text: 'Replay an earlier episode against its original build within the same runtime.',
      },
    ],
  },
  concepts: { eyebrow: 'Concepts', title: 'Seven words to know.' },
  results: {
    eyebrow: 'Results',
    title: 'Checked English, or JSON.',
    text: 'A pinned response plan constructs the result as checked English or JSON. The JSON below shows the idea; the delivery documents the real interface.',
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
  },
  future: {
    title: 'When the hosted API arrives',
    text: 'We intend to keep what makes the preview inspectable: versioned fields, explicit outcomes, retained evidence, and replay. We will document the interface here when it exists, not before.',
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
  title: 'Documentation',
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
        MOTH.hero.lede,
        `Current profile: ${claim('profile')}, with ${claim('worlds')} — purchasing, libraries, trails, and venues — and a separate native-demo control.`,
      ],
    },
    {
      id: 'facts-and-definitions',
      title: 'Facts and definitions',
      paragraphs: [
        'Sources use admitted complete sentences, supported positive definitions, relational conditions, and shared-subject composition. Explicit negative facts are supported; negated questions and negative definition conditions are not.',
      ],
      code: { label: 'Definitions', text: MOTH.purchasing.definitions.inspection.join('\n') },
    },
    {
      id: 'interpretation-skills',
      title: 'Interpretation skills',
      paragraphs: [
        'Supported English skills configure interpretation and composition.',
        MOTH.contract.skills,
      ],
    },
    {
      id: 'compilation-and-activation',
      title: 'Compilation and activation',
      paragraphs: [
        'Check the interpretation and build a retained field. Existing local BGE assets participate in compilation; updates require a new build and activation.',
        'Edit source material, rebuild, and activate a new version. The qualified inference and replay path does not initialize the encoder.',
      ],
    },
    {
      id: 'questions',
      title: 'Questions',
      paragraphs: [
        'Interpret a supported question against the selected field version: ask whether an entity meets a definition.',
      ],
      code: { label: MOTH.contract.examplesLabel, text: MOTH.contract.examples },
    },
    {
      id: 'outcomes',
      title: 'Outcomes',
      paragraphs: [MOTH.outcomes.boundaries[0]],
    },
    {
      id: 'evidence-and-replay',
      title: 'Evidence and replay',
      paragraphs: [
        'Construct checked English or JSON results with retained evidence. Query earlier activations and replay retained episodes within the same runtime.',
        'Compiled bundles retain source-derived evidence and may include original spans; compilation does not anonymize sensitive data.',
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
