// /moth and the shared model modules (CONTENT §3.2). Wording from src/content/source/moth.md and
// releases.md, with only typo, hyphenation and punctuation fixes; figures via claims.ts.
import { claim } from './claims.ts'

export const MOTH = {
  hero: {
    eyebrow: 'Model · Preview 004',
    title: 'Moth',
    subhead: 'Your world. Your definitions. Checked answers.',
    lede: 'Moth compiles supported English facts, definitions, and interpretation skills into a reusable reasoning field. Ask whether an entity meets a definition, then inspect checked English or JSON results.',
    primary: { label: 'Release & evidence', href: '#evidence' },
    secondary: { label: 'Talk to the lab', href: '/contact?interest=research' },
  },

  how: {
    eyebrow: 'How Moth works',
    title: 'Five steps, from definitions to replayable evidence.',
    steps: [
      {
        name: 'Define',
        text: 'Supply the vocabulary, facts, relationships, and definitions for a task. Supported English skills configure interpretation and composition.',
      },
      {
        name: 'Compile',
        text: 'Check the interpretation and build a retained field. Existing local BGE assets participate in compilation; updates require a new build and activation.',
      },
      { name: 'Ask', text: 'Interpret a supported question against the selected field version.' },
      {
        name: 'Check',
        text: 'Native reasoning establishes a classification and a pinned response plan constructs checked English or JSON. Missing support, refusal, and incomplete execution have distinct meanings.',
      },
      {
        name: 'Replay',
        text: 'Retain the evidence and replay an earlier episode against its original build within the same runtime.',
      },
    ],
    figure: 'Fig. 01 — The five steps',
    caption:
      'Conceptual illustration of dependencies. It does not depict a demonstrated continuous energy optimizer.',
  },

  purchasing: {
    eyebrow: 'Explanatory example',
    title: 'Define purchase readiness.',
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
    note: 'The field does not establish purchase readiness for ordertwo; it does not prove that birch failed inspection.',
    disclaimer:
      'This is an explanatory example, not a live console. Changing the supplier definition to require audit changes the criteria and requires rebuilding.',
  },

  outcomes: {
    eyebrow: 'Outcomes and boundaries',
    title: 'Distinct outcomes, stated plainly.',
    ledger: ['supported', 'unproven', 'conflict', 'refused', 'limit', 'incomplete', 'incompatible'],
    heads: { outcome: 'Outcome', meaning: 'What it means', next: 'What to do next' },
    boundaries: [
      'Supported membership establishes a classification under the field’s facts and definitions. `NO_SUPPORTED_PROOF` means the field does not establish membership, not that the entity fails. Conflict, language refusal, resource stop, incomplete execution, and artifact incompatibility remain distinct outcomes.',
      'Checked execution does not prove outside-world truth. This preview is not a general chat system, arbitrary document reader, production service, or universal reasoning engine. A larger prepared base and broader procedures remain proposed work.',
    ],
  },

  preview: {
    eyebrow: 'Preview 004',
    title: 'What Preview 004 is.',
    scope: `A local CLI preview for configurable classification over compiled fields. Current profile: ${claim('profile')}, with ${claim('worlds')} — purchasing, libraries, trails, and venues — and a separate native-demo control. The ${claim('models')} span two profile families.`,
    platform: `The package targets ${claim('platform')} with ${claim('python')} and locally available uv. Installation and usage instructions are included with the local delivery. No public download URL is provided here. This page describes the prepared local evaluation package; it does not announce a hosted service, public API, or license grant.`,
    supportsTitle: 'What the preview supports',
    supports: [
      'Compile supported English facts, definitions, and interpretation skills into a versioned field.',
      'Compose positive requirements and supported relationships; classify whether an entity meets a definition.',
      'Construct checked English or JSON results with retained evidence.',
      'Edit source material, rebuild, and activate a new version.',
      'Query earlier activations and replay retained episodes within the same runtime.',
    ],
    note: 'Existing local BGE assets participate in compilation. The qualified inference and replay path does not initialize the encoder. The four example worlds are synthetic evaluation cases, not operational integrations.',
  },

  contract: {
    eyebrow: 'Language contract',
    title: 'What Moth reads, and what it refuses.',
    rules:
      'Only declared properties, relationships, concepts, and valid aliases bind. Entity identifiers are single words. Sources use admitted complete sentences, supported positive definitions, relational conditions, and shared-subject composition. Explicit negative facts are supported; negated questions and negative definition conditions are not.',
    examplesLabel: 'Supported question examples',
    examples:
      'Is orderone a purchase-ready item?\nDoes orderone meet the requirements for a purchase-ready item?',
    skills:
      'English skills can teach supported interpretation and composition within the bootstrap contract. They do not establish arbitrary-English comprehension or arbitrary algorithm teaching.',
    // Each cell shows a short value and label; claims.test.ts checks both against the claim's line.
    limits: [
      { claim: 'limit-entities', value: '256', label: 'entities' },
      { claim: 'limit-facts', value: '2,048', label: 'facts' },
      { claim: 'limit-composition', value: '32 / 128', label: 'documents / sentences in composition' },
      { claim: 'limit-clauses', value: 'six', label: 'clauses per composed sentence' },
      { claim: 'limit-question', value: '2,048', label: 'characters per question' },
    ],
    limitsNote:
      'Questions also have separate bounded parsing/execution work. These safeguards are not measured capacity guarantees. Read the delivery’s `documentation/LANGUAGE-CONTRACT.md` for the complete contract.',
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
      'Offline installation, source-only updates, a new parcel domain, retained activation/replay, relocation, and integrity/refusal controls passed in the documented environment. The parcel case is additional qualification, not a sixth delivered model.',
      'These are finite synthetic panels. Cases were examined, and new-domain work was authored by the same agent; this is not a blind generalization benchmark. Regression counts do not measure intelligence, and these results do not establish broad English accuracy, million-token capacity, or superiority over LLMs.',
    ],
  },

  measured: {
    eyebrow: 'Measured observations',
    title: 'What was measured, and how.',
    environment:
      'These observations used one macOS ARM64 host, Python 3.11, local storage, and warm filesystem caches without a controlled flush. Part of qualification ran concurrently with regression work.',
    source: 'From the Preview 004 qualification report',
    columns: ['Measurement', 'Observation'],
    rows: [
      ['First core CLI query after install/load', claim('first-query')],
      ['Repeated fresh CLI processes', claim('repeated')],
      ['Installed environment', claim('installed')],
      ['Compiled model payloads', claim('payloads')],
      ['Sealed delivery archive', claim('archive')],
    ],
    caveat:
      'CLI timings include startup and surrounding work; they are not pure reasoning-kernel measurements, controlled cold-cache results, or guarantees. Guarded inference and replay recorded zero unexpected blocks across 51 instrumented processes after guard probes.',
  },

  inspect: {
    eyebrow: 'Inspect the evidence',
    title: 'The evidence ships with the delivery.',
    files: [
      'qualification/report.md',
      'qualification/results.json',
      'MODEL.md',
      'QUICKSTART.md',
      'LANGUAGE-CONTRACT.md',
      'LIMITATIONS.md',
    ],
    text: 'The complete delivery includes `qualification/report.md`, `qualification/results.json`, retained transcripts and controls. The adjacent final publication receipt binds the exact sealed archive to fresh-install smoke results. Use the release-specific `MODEL.md`, `QUICKSTART.md`, `LANGUAGE-CONTRACT.md`, and `LIMITATIONS.md` for the current interface; architecture PDFs provide broader context.',
    harnessTitle: 'A retained failure',
    harness:
      'The report retains a failed harness attempt: it initially read the wrong stream for exit code 4. The runtime correctly returned RESOURCE_LIMIT; the harness was corrected without changing the runtime snapshot. Both attempts remain in the evidence.',
    closing:
      'No million-token, throughput, pricing, or production-readiness target is presented here as achieved. Compiled bundles retain source-derived evidence and may include original spans; compilation does not anonymize sensitive data.',
  },

  direction: {
    eyebrow: 'The prepared-base direction',
    title: 'A richer prepared foundation.',
    tag: 'Proposed',
    text: 'We aim to build a richer prepared foundation with broader tested English coverage, reusable procedures, and response instructions. Those are proposed capabilities to qualify separately, not current claims about arbitrary English or reasoning methods.',
    link: { label: 'Explore the research', href: '/research' },
  },

  getPreview: {
    title: 'Get the preview.',
    text: 'Preview 004 is delivered locally for evaluation. Installation and usage instructions are included with the local delivery; there is no public download.',
    primary: { label: 'Contact the lab', href: '/contact?interest=research' },
    secondary: { label: 'Contact sales', href: '/contact/sales' },
  },
} as const

// /developers/models (CONTENT §3.9): the model card shares the modules above.
export const MODELS = {
  hero: {
    eyebrow: 'Developers · Models',
    title: 'Models',
    lede: 'The models Mumbrane has delivered, with what each supports and how it was tested.',
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
      'A general chat system, arbitrary document reader, production service, or universal reasoning engine.',
    ],
  },
  upcoming: {
    title: 'Upcoming: Moth Base',
    tag: 'Proposed',
    text: 'A larger prepared base and broader procedures remain proposed work.',
    link: { label: 'The prepared-base direction', href: '/moth#prepared-base' },
  },
} as const
