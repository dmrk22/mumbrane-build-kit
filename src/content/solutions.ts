// /solutions, /solutions/[slug], /solutions/use-cases (CONTENT §3.8, field framing D-134). Every
// world here is synthetic and labelled; no customers, results or ROI (CONTENT §4). Entity names
// follow the source examples: single lowercase words in `code` style.
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
  world: FieldExample
  evidence: readonly string[]
  note?: string
}

export const SOLUTION_UI = {
  eyebrow: (name: string) => `Solutions · ${name}`,
  explore: 'Explore',
  rulebook: 'The rulebook',
  rulebookLede: 'Everything the field will hold, defined before a single question.',
  world: 'An illustrative world',
  illustrative: 'Illustrative',
  worldCaption: 'Illustrative example — not a customer deployment or a live console.',
  tags: { define: 'Define', facts: 'Facts', ask: 'Ask' },
  evidence: 'Why a field fits here',
  limits: {
    title: 'Preview 004',
    text: 'A local CLI. A checked answer shows what follows from your field, not outside-world truth.',
    link: { label: 'All outcomes', href: '/moth#outcomes' },
  },
  cta: {
    title: (name: string) => `Talk to us about ${name.toLowerCase()}.`,
    text: 'Tell us your rulebook. We’ll tell you honestly whether Moth fits today.',
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
    lede: 'Purchasing, approvals, eligibility. Your policies become the field; Moth answers each case only from it, and shows why.',
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
    evidence: [
      'A reviewer sees which facts and which definition produced each result.',
      'When a policy changes, you rebuild the field on purpose; answers do not drift.',
    ],
  },
  {
    slug: 'customer-support',
    name: 'Customer support',
    icon: 'book',
    promise: 'Answers grounded in your rules',
    title: 'Answers grounded in your rules.',
    lede: 'Refunds, replacements, entitlements. Your rules become the field; Moth answers only from it, and hands the case to a person when it cannot.',
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
          reason: 'no receipt supplied — hand off to a person',
        },
      ],
    },
    evidence: [
      'Every answer traces to the rule and the facts behind it.',
      'When the rulebook is silent, no policy is invented; the missing fact is named.',
    ],
  },
  {
    slug: 'legal',
    name: 'Legal',
    icon: 'layers',
    promise: 'Check conditions against defined terms',
    title: 'Check conditions against defined terms.',
    lede: 'Contracts define their own terms. Those terms become the field; Moth checks whether a clause set meets your condition, and shows which clauses decide it.',
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
    evidence: [
      'Each result cites its clauses and the defined term.',
      'A missing clause is reported as missing, never guessed.',
    ],
    note: 'Not legal advice. Illustrative only.',
  },
  {
    slug: 'security',
    name: 'Security',
    icon: 'key',
    promise: 'Policy decisions you can audit',
    title: 'Policy decisions you can audit.',
    lede: 'Access policies are rulebooks. Yours becomes the field; Moth checks each account against it and replays the decision when an auditor asks.',
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
    evidence: [
      'An auditor can replay a past decision against the build that made it.',
      '“No supported proof” stays distinct from “not privileged”.',
    ],
  },
]

export const solutionBySlug = (slug: string) => SOLUTIONS.find((s) => s.slug === slug)

export const SOLUTIONS_OVERVIEW = {
  eyebrow: 'Solutions',
  title: 'Your rulebook *is* the field.',
  lede: 'Many decisions already have a rulebook. Moth takes it as the whole field, answers each case only from it, and says what is missing.',
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
        'answers must show their reasons',
        '“not established” is a useful answer',
      ],
    },
    not: {
      title: 'Moth is not…',
      items: ['a chat assistant', 'a document reader', 'a source of outside-world facts'],
    },
  },
  cta: {
    title: 'Have a rulebook in mind?',
    text: 'Tell us the decisions you want answered from your own rules.',
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
  lede: 'Preview 004 ships four synthetic example worlds. The rest are sketches.',
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
    noExample: 'Its definitions ship with the local delivery.',
    items: [
      {
        name: 'Purchasing',
        domain: 'business',
        definition: 'A purchase-ready item has funds available and an approved supplier.',
        example: { question: 'Is orderone a purchase-ready item?', outcome: 'supported' },
      },
      { name: 'Libraries', domain: null, definition: 'A library vocabulary with its own criteria.' },
      { name: 'Trails', domain: null, definition: 'A trail vocabulary with its own criteria.' },
      { name: 'Venues', domain: null, definition: 'A venue vocabulary with its own criteria.' },
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
    ] satisfies UseCase[] as UseCase[],
  },
} as const
