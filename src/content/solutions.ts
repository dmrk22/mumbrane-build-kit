// /solutions, /solutions/[slug], /solutions/use-cases (CONTENT §3.8). Every world here is
// synthetic and labelled; no customers, results or ROI (CONTENT §4). Entity names follow the
// source examples: single lowercase words in `code` style.
import type { UseCaseFilter } from '../lib/security/params.ts'
import type { Outcome } from './outcomes.ts'

export type SolutionSlug = 'business' | 'customer-support' | 'legal' | 'security'

export type FieldExample = {
  title: string
  define: readonly string[]
  facts: readonly string[]
  questions: readonly { ask: string; entity: string; outcome: Outcome; reason: string }[]
}

export type Solution = {
  slug: SolutionSlug
  name: string
  icon: 'chart' | 'book' | 'layers' | 'key'
  promise: string
  title: string
  lede: string
  rulebook: readonly string[]
  world: FieldExample
  next: Partial<Record<Outcome, string>>
  evidence: readonly string[]
  note?: string
}

export const SOLUTION_UI = {
  eyebrow: (name: string) => `Solutions · ${name}`,
  explore: 'Explore',
  rulebook: 'The rulebook',
  rulebookLede: 'What gets defined before a single question is asked.',
  world: 'An illustrative world',
  illustrative: 'Illustrative',
  worldCaption: 'Illustrative example written for this page — not a customer deployment or a live console.',
  tags: { define: 'Define', facts: 'Facts', ask: 'Ask' },
  outcomes: {
    title: 'Outcomes, as they would read here',
    heads: { outcome: 'Outcome', meaning: 'What it means', next: 'What to do next' },
  },
  evidence: 'Why evidence matters here',
  limits: {
    title: 'What Preview 004 does not do',
    // From releases.md and moth.md (CONTENT §3.2), unchanged in sense.
    items: [
      'Preview 004 is a local CLI. There is no public inference API yet.',
      'Checked execution does not prove outside-world truth.',
      'It is not a general chat system, arbitrary document reader, production service, or universal reasoning engine.',
      'The four example worlds are synthetic evaluation cases, not operational integrations.',
      'Compilation does not anonymize sensitive data.',
    ],
  },
  cta: {
    title: (name: string) => `Talk to us about ${name.toLowerCase()}.`,
    text: 'Tell us about the rulebook you work with. We’ll tell you honestly whether Moth fits today.',
    primary: 'Talk to us',
    sales: 'Contact sales',
    worlds: 'See all example worlds',
  },
  security: {
    title: 'Our own security',
    text: 'This site sends a strict Content Security Policy, loads nothing from third parties, and does not use analytics, advertising, or tracking.',
    link: { label: 'Responsible disclosure', href: '/legal/responsible-disclosure' },
  },
} as const

export const SOLUTIONS: readonly Solution[] = [
  {
    slug: 'business',
    name: 'Business',
    icon: 'chart',
    promise: 'Decisions that follow your policies',
    title: 'Decisions that follow your policies.',
    lede: 'Purchasing, approvals, eligibility: many business decisions already have written criteria. Moth checks each case against the criteria you define and shows why it reached its result.',
    rulebook: [
      'The vocabulary: purchases, suppliers, inspections, funds.',
      'The definitions: what makes a supplier approved, and an item purchase-ready.',
      'The facts for each case, supplied by you — nothing from outside the field.',
    ],
    world: {
      title: 'purchasing.field',
      define: [
        'An approved supplier is a supplier who passed inspection.',
        'A purchase-ready item has funds available and an approved supplier.',
      ],
      facts: [
        '`atlas` passed inspection.',
        '`orderone` appoints `atlas` and has funds.',
        '`birch` passed audit.',
        '`ordertwo` appoints `birch` and has funds.',
      ],
      questions: [
        {
          ask: 'Is `orderone` a purchase-ready item?',
          entity: 'orderone',
          outcome: 'supported',
          reason: 'funds available · atlas passed inspection',
        },
        {
          ask: 'Is `ordertwo` a purchase-ready item?',
          entity: 'ordertwo',
          outcome: 'unproven',
          reason: 'passed audit does not establish passed inspection',
        },
      ],
    },
    next: {
      supported: 'Proceed, and keep the evidence with the decision record.',
      unproven: 'Ask for the missing fact — here, an inspection — before deciding.',
      conflict: 'Reconcile the records that disagree before anyone approves.',
    },
    evidence: [
      'A reviewer can see which facts and which definition produced each result.',
      'When a policy changes, you rebuild the field deliberately instead of hoping answers drift the right way.',
      '“No supported proof” names what is missing, so a gap is never mistaken for a no.',
    ],
  },
  {
    slug: 'customer-support',
    name: 'Customer support',
    icon: 'book',
    promise: 'Answers grounded in your rules',
    title: 'Answers grounded in your rules.',
    lede: 'Refunds, replacements, entitlements: support teams apply written rules to each request. Moth answers only from the rules and facts you supply, and hands the case to a person when the facts do not support an answer.',
    rulebook: [
      'The vocabulary: requests, receipts, return windows.',
      'The definition of an eligible refund, in controlled English.',
      'The facts of each request — what the customer has shown, and nothing more.',
    ],
    world: {
      title: 'refunds.field',
      define: ['An eligible refund is a request that is within the return window and has a receipt.'],
      facts: [
        '`requestone` is within the return window and has a receipt.',
        '`requesttwo` is within the return window.',
      ],
      questions: [
        {
          ask: 'Is `requestone` an eligible refund?',
          entity: 'requestone',
          outcome: 'supported',
          reason: 'within the return window · receipt supplied',
        },
        {
          ask: 'Is `requesttwo` an eligible refund?',
          entity: 'requesttwo',
          outcome: 'unproven',
          reason: 'no receipt supplied — hand off to a person, naming the missing receipt',
        },
      ],
    },
    next: {
      supported: 'Tell the customer the result and the rule that decided it.',
      unproven: 'Hand off to a person, naming the missing fact.',
      refused: 'Route the question to a person; it falls outside the supported language.',
    },
    evidence: [
      'Every answer can be traced to the rule and the facts behind it.',
      'The model does not invent a policy when the rulebook is silent.',
      'A person receives the case with the missing fact already named.',
    ],
  },
  {
    slug: 'legal',
    name: 'Legal',
    icon: 'layers',
    promise: 'Check conditions against defined terms',
    title: 'Check conditions against defined terms.',
    lede: 'Contracts define their own terms. Moth checks whether a set of clauses meets a condition you have defined, and shows which clauses establish it — or which are missing.',
    rulebook: [
      'The defined terms, written as definitions.',
      'The condition to check, such as what makes a clause set complete.',
      'The clauses of each set, supplied as facts.',
    ],
    world: {
      title: 'clauses.field',
      define: [
        'A complete clause set is a clause set that includes a governing-law clause and a termination clause.',
      ],
      facts: [
        '`setone` includes a governing-law clause and a termination clause.',
        '`settwo` includes a governing-law clause.',
      ],
      questions: [
        {
          ask: 'Is `setone` a complete clause set?',
          entity: 'setone',
          outcome: 'supported',
          reason: 'governing-law clause · termination clause',
        },
        {
          ask: 'Is `settwo` a complete clause set?',
          entity: 'settwo',
          outcome: 'unproven',
          reason: 'no termination clause is established',
        },
      ],
    },
    next: {
      supported: 'Record which clauses established the condition.',
      unproven: 'Check whether the missing clause exists outside the supplied set.',
      conflict: 'Resolve clauses that contradict each other before relying on either.',
    },
    evidence: [
      'Each result cites the clauses and the defined term it depends on.',
      'A missing clause is reported as missing, not silently treated as present or absent.',
      'Retained builds let you replay a check against the exact definitions used at the time.',
    ],
    note: 'Not legal advice. Illustrative only.',
  },
  {
    slug: 'security',
    name: 'Security',
    icon: 'key',
    promise: 'Policy decisions you can audit',
    title: 'Policy decisions you can audit.',
    lede: 'Access policies are rulebooks. Moth checks whether an account meets your definition of privileged access, keeps the evidence, and replays the decision against the same build when an auditor asks.',
    rulebook: [
      'The vocabulary: accounts, roles, status.',
      'The definition of a privileged account.',
      'The facts about each account, as your systems report them to you.',
    ],
    world: {
      title: 'access.field',
      define: ['A privileged account is an account that holds an administrator role and is active.'],
      facts: [
        '`accountone` holds an administrator role and is active.',
        '`accounttwo` holds an administrator role.',
      ],
      questions: [
        {
          ask: 'Is `accountone` a privileged account?',
          entity: 'accountone',
          outcome: 'supported',
          reason: 'administrator role · active',
        },
        {
          ask: 'Is `accounttwo` a privileged account?',
          entity: 'accounttwo',
          outcome: 'unproven',
          reason: 'active status is not established',
        },
      ],
    },
    next: {
      supported: 'Keep the evidence; replay it against the same build for the audit.',
      unproven: 'Supply the missing status before concluding either way.',
      incompatible: 'Replay with the build and runtime the decision came from.',
    },
    evidence: [
      'An auditor can replay a past decision against the build that made it.',
      'The definition in force at the time is retained with the result.',
      '“No supported proof” is kept distinct from “not privileged”.',
    ],
  },
]

export const solutionBySlug = (slug: string) => SOLUTIONS.find((s) => s.slug === slug)

export const SOLUTIONS_OVERVIEW = {
  eyebrow: 'Solutions',
  title: 'Decisions that follow *your* rules.',
  lede: 'Many decisions already have a rulebook. Moth takes that rulebook as the whole world, checks each case against it, and shows the evidence — or says what is missing.',
  useCases: {
    name: 'Use cases',
    promise: 'Example worlds, from purchasing to venues',
    href: '/solutions/use-cases',
  },
  fit: {
    title: 'Where Moth fits',
    fits: {
      title: 'Moth fits when…',
      items: [
        'the criteria can be written down',
        'answers must be explainable',
        '“not established” is a useful answer',
        'the rules change and you need to rebuild deliberately',
      ],
    },
    not: {
      title: 'Moth is not…',
      items: ['a chat assistant', 'a document reader', 'a source of outside-world facts'],
    },
  },
  cta: {
    title: 'Have a rulebook in mind?',
    text: 'Tell us about the decisions you want a model to make from your own rules.',
    action: { label: 'Contact sales', href: '/contact/sales' },
  },
} as const

export type UseCase = {
  name: string
  domain: Exclude<UseCaseFilter, 'all'> | null
  definition: string
  /** Omitted where the source gives no example: nothing is invented to fill the slot. */
  example?: { question: string; outcome: Outcome }
}

export const USE_CASES = {
  eyebrow: 'Solutions',
  title: 'Example worlds',
  lede: 'Preview 004 ships with four synthetic example worlds. The rest are sketches of where the same method could apply.',
  filterLabel: 'Filter by area',
  filters: {
    all: 'All',
    business: 'Business',
    'customer-support': 'Customer support',
    legal: 'Legal',
    security: 'Security',
  } satisfies Record<UseCaseFilter, string>,
  showing: (n: number) => `Showing ${n} example ${n === 1 ? 'world' : 'worlds'}.`,
  empty: 'No example worlds in this area yet.',
  delivered: {
    title: 'Delivered in Preview 004',
    badge: 'Synthetic example world',
    // The purchasing world is the source example; the other three are named in the source
    // (releases.md, the Introducing post) without detail, so no question or outcome is shown.
    noExample: 'Its questions and definitions ship with the local delivery.',
    items: [
      {
        name: 'Purchasing',
        domain: 'business',
        definition: 'A purchase-ready item has funds available and an approved supplier.',
        example: { question: 'Is orderone a purchase-ready item?', outcome: 'supported' },
      },
      {
        name: 'Libraries',
        domain: null,
        definition: 'A library vocabulary with its own criteria, supplied as facts and definitions.',
      },
      {
        name: 'Trails',
        domain: null,
        definition: 'A trail vocabulary with its own criteria, supplied as facts and definitions.',
      },
      {
        name: 'Venues',
        domain: null,
        definition: 'A venue vocabulary with its own criteria, supplied as facts and definitions.',
      },
    ] satisfies UseCase[] as UseCase[],
  },
  sketches: {
    title: 'Sketches',
    badge: 'Illustrative sketch',
    items: [
      {
        name: 'Refund eligibility',
        domain: 'customer-support',
        definition: 'An eligible refund is a request that is within the return window and has a receipt.',
        example: { question: 'Is requesttwo an eligible refund?', outcome: 'unproven' },
      },
      {
        name: 'Approval routing',
        domain: 'business',
        definition: 'An approval-ready request is a request that names a budget holder and has a quote.',
        example: { question: 'Is requestone an approval-ready request?', outcome: 'supported' },
      },
      {
        name: 'Clause conditions',
        domain: 'legal',
        definition: 'A complete clause set includes a governing-law clause and a termination clause.',
        example: { question: 'Is settwo a complete clause set?', outcome: 'unproven' },
      },
      {
        name: 'Privileged access',
        domain: 'security',
        definition: 'A privileged account holds an administrator role and is active.',
        example: { question: 'Is accountone a privileged account?', outcome: 'supported' },
      },
      {
        name: 'Grant eligibility',
        domain: 'business',
        definition: 'An eligible applicant is an applicant that is registered and has a signed declaration.',
        example: { question: 'Is applicantone an eligible applicant?', outcome: 'unproven' },
      },
      {
        name: 'Warranty coverage',
        domain: 'customer-support',
        definition: 'A covered repair is a repair of a registered product with an intact seal.',
        example: { question: 'Is repairone a covered repair?', outcome: 'supported' },
      },
    ] satisfies UseCase[] as UseCase[],
  },
} as const
