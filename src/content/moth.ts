// /moth and the shared model modules (CONTENT §3.2, field framing D-134). Release facts from
// src/content/source/moth.md and releases.md, shortened but unchanged in sense; figures via claims.ts.
import { claim } from './claims.ts'

export const MOTH = {
  hero: {
    eyebrow: 'Model · Preview 004',
    title: 'Moth',
    subhead: 'Your facts are the field. Your question settles. The evidence stays.',
    lede: 'Moth turns your facts and definitions into a fixed field, then lets each question settle to a checked answer. Preview 004 is the first step.',
    primary: { label: 'Release & evidence', href: '#evidence' },
    secondary: { label: 'Talk to the lab', href: '/contact?interest=research' },
  },

  how: {
    eyebrow: 'How Moth works',
    title: 'From your facts to a resting answer.',
    steps: [
      {
        name: 'Define',
        text: 'Supply facts and definitions in supported English. Nothing else enters the field.',
      },
      {
        name: 'Encode',
        text: 'Compile them into a fixed, versioned field. Local BGE encoder assets place each fact; a change means a new build.',
      },
      {
        name: 'Ask',
        text: 'A supported question enters the field. The field shapes it; it never changes the field.',
      },
      {
        name: 'Settle',
        text: 'The question comes to rest where your definitions support it. In Preview 004, native constraint reasoning does this.',
      },
      { name: 'Replay', text: 'The evidence is kept. Replay an episode against its original build.' },
    ],
    figure: 'Fig. 01 — The five steps',
    caption:
      'Conceptual illustration of dependencies. It does not depict a demonstrated continuous energy optimizer.',
  },

  purchasing: {
    eyebrow: 'Explanatory example',
    title: 'Nearness is not meaning.',
    label: 'Explanatory example',
    definitions: {
      inspection: [
        'An approved supplier is a supplier who passed inspection.',
        'A purchase-ready item has funds available and an approved supplier.',
      ],
      audit: [
        'An approved supplier is a supplier who passed audit.',
        'A purchase-ready item has funds available and an approved supplier.',
      ],
    },
    facts: [
      '`orderone` has funds; its supplier, `atlas`, passed inspection.',
      '`ordertwo` has funds; its supplier, `birch`, passed audit.',
    ],
    toggle: 'Require audit instead of inspection',
    changed: 'Definition changed — rebuild required',
    rebuild: 'Rebuild',
    builds: { inspection: 'f3a9', audit: '7c21' },
    results: {
      inspection: [
        { entity: 'orderone', outcome: 'supported', reason: 'funds available · atlas passed inspection' },
        {
          entity: 'ordertwo',
          outcome: 'unproven',
          reason: 'passed audit does not establish passed inspection',
        },
      ],
      audit: [
        {
          entity: 'orderone',
          outcome: 'unproven',
          reason: 'passed inspection does not establish passed audit',
        },
        { entity: 'ordertwo', outcome: 'supported', reason: 'funds available · birch passed audit' },
      ],
    },
    headings: { definitions: 'Definitions', facts: 'Facts', results: 'Results', build: 'Build' },
    announce: {
      inspection: 'Rebuilt as build f3a9. orderone: supported. ordertwo: no supported proof.',
      audit: 'Rebuilt as build 7c21. orderone: no supported proof. ordertwo: supported.',
    },
    note: 'Similar wording can sit close together in an encoder’s space. The definition decides: audit does not establish inspection, and nothing proves that birch failed inspection.',
    disclaimer: 'Explanatory example, not a live console. Requiring audit means a rebuild.',
  },

  outcomes: {
    eyebrow: 'Outcomes and boundaries',
    title: 'Distinct outcomes, stated plainly.',
    ledger: ['supported', 'unproven', 'conflict', 'refused', 'limit', 'incomplete', 'incompatible'],
    heads: { outcome: 'Outcome', meaning: 'What it means', next: 'What to do next' },
    boundaries: [
      '`NO_SUPPORTED_PROOF` means the field does not establish membership, not that the entity fails.',
      'Checked execution does not prove outside-world truth. Preview 004 is not a general chat system, document reader, or production service.',
    ],
  },

  preview: {
    eyebrow: 'Preview 004',
    title: 'What Preview 004 is.',
    scope: `A local CLI preview for classification over compiled fields. Profile: ${claim('profile')}, with ${claim('worlds')}.`,
    platform: `Targets ${claim('platform')} with ${claim('python')}. Delivered locally: no public download, hosted service, or API.`,
    supportsTitle: 'What the preview supports',
    supports: [
      'Compile supported English facts, definitions, and interpretation skills into a versioned field.',
      'Classify whether an entity meets a definition, with checked English or JSON and retained evidence.',
      'Rebuild, activate, and replay earlier episodes within the same runtime.',
    ],
    note: 'Local BGE assets take part in compilation; the qualified inference path does not run the encoder. The example worlds are synthetic. Compilation does not anonymize sensitive data.',
  },

  contract: {
    eyebrow: 'Language contract',
    title: 'What Moth reads, and what it refuses.',
    rules:
      'Only declared properties, relationships, concepts, and valid aliases bind. Entity identifiers are single words. Explicit negative facts are supported; negated questions and negative definition conditions are not.',
    examplesLabel: 'Supported question examples',
    examples:
      'Is orderone a purchase-ready item?\nDoes orderone meet the requirements for a purchase-ready item?',
    skills:
      'English skills teach supported interpretation within the bootstrap contract, not arbitrary English.',
    // Each cell shows a short value and label; claims.test.ts checks both against the claim's line.
    limits: [
      { claim: 'limit-entities', value: '256', label: 'entities' },
      { claim: 'limit-facts', value: '2,048', label: 'facts' },
      { claim: 'limit-composition', value: '32 / 128', label: 'documents / sentences in composition' },
      { claim: 'limit-clauses', value: 'six', label: 'clauses per composed sentence' },
      { claim: 'limit-question', value: '2,048', label: 'characters per question' },
    ],
    limitsNote:
      'These safeguards are not measured capacity guarantees. The full contract ships as `documentation/LANGUAGE-CONTRACT.md`.',
  },

  qualification: {
    eyebrow: 'Qualification',
    title: 'What was checked.',
    caption: 'The release documentation records:',
    source: 'From the Preview 004 qualification report',
    columns: ['Check', 'Result'],
    rows: [
      ['Core installed answers', claim('core-answers')],
      ['Historical replays of those answers', claim('replays')],
      ['Expected language/resource refusals', claim('refusals')],
      ['Repository regression', claim('regression')],
      ['Final sealed-artifact smoke', claim('smoke')],
    ],
    caveats: [
      'These are finite synthetic panels, not a blind generalization benchmark. They do not establish broad English accuracy or superiority over LLMs.',
    ],
  },

  direction: {
    eyebrow: 'The direction',
    title: 'A field that settles.',
    tag: 'Proposed',
    text: 'We are building a runtime where questions settle in a continuous field, with weighted facts and checked results. It will be qualified separately before we claim it.',
    link: { label: 'Explore the research', href: '/research' },
  },

  getPreview: {
    title: 'Get the preview.',
    text: 'Preview 004 is delivered locally for evaluation; there is no public download.',
    primary: { label: 'Contact the lab', href: '/contact?interest=research' },
    secondary: { label: 'Contact sales', href: '/contact/sales' },
  },
} as const

// /developers/models (CONTENT §3.9): the model card shares the modules above.
export const MODELS = {
  hero: {
    eyebrow: 'Developers · Models',
    title: 'Models',
    lede: 'The models Mumbrane has delivered, and what each supports.',
  },
  card: {
    name: claim('release'),
    status: 'Preview · local',
    facts: [
      { label: 'Profile', value: claim('profile') },
      { label: 'Models', value: `${claim('models')} across two profile families` },
      { label: 'Platform', value: `${claim('platform')} · ${claim('python')} · locally available uv` },
      { label: 'Announced', value: '2026-09-22' },
    ],
    capabilitiesTitle: 'Capabilities',
    notIncludedTitle: 'Not included',
    notIncluded: [
      'A hosted console or a public inference API.',
      'A public download: the preview is delivered locally for evaluation.',
      'A general chat system, document reader, or production service.',
    ],
  },
  evidence: {
    title: 'How it was tested.',
    text: 'Outcomes and qualification results for Preview 004 are on the Moth page.',
    link: { label: 'Release & evidence', href: '/moth#evidence' },
  },
  upcoming: {
    title: 'Upcoming: a field that settles',
    tag: 'Proposed',
    text: 'A runtime where questions settle in a continuous field. Proposed work.',
    link: { label: 'The direction', href: '/moth#prepared-base' },
  },
} as const
