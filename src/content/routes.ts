// The route registry (PAGES §0.1). Header, footer, sitemap, robots, e2e route lists and shots all
// read from here. Data only: imported by node tests with a relative path.
import type { Surface } from '../lib/surface.ts'

export type RouteGroup = 'solutions' | 'developer' | 'company' | 'legal' | 'console'

export type RouteEntry = {
  path: `/${string}`
  /** Used in navigation and as the page's <title> (through the "%s — Mumbrane" template). */
  title: string
  /** ≤ 160 characters (CONTENT §6). */
  description: string
  group?: RouteGroup
  nav?: { label?: string; description?: string }
  sitemap: boolean
  noindex?: boolean
  /** The first section's surface: the header themes itself from it. */
  surfaceTop: Surface
}

export const ROUTES = [
  {
    path: '/',
    title: 'Home',
    description:
      'Mumbrane builds constraint-based models that reason from the facts and definitions you supply, and show the evidence behind every result.',
    sitemap: true,
    surfaceTop: 'ultramarine',
  },
  {
    path: '/moth',
    title: 'Moth',
    description:
      'Configurable classification over a compiled field of facts, definitions, and supported English interpretation skills.',
    nav: { description: 'Configurable classification with checked answers' },
    sitemap: true,
    surfaceTop: 'paper',
  },

  // Solutions
  {
    path: '/solutions',
    title: 'Solutions',
    description:
      'Many decisions already have a rulebook. Moth takes that rulebook as the whole world, checks each case against it, and shows the evidence.',
    group: 'solutions',
    nav: { label: 'Where closed-world reasoning fits' },
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/solutions/business',
    title: 'Business',
    description:
      'Decisions that follow your policies: an illustrative look at checking purchase readiness and approvals against rules you define.',
    group: 'solutions',
    nav: { description: 'Decisions that follow your policies' },
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/solutions/customer-support',
    title: 'Customer support',
    description:
      'Answers grounded in your rules: an illustrative example of refund eligibility checked against criteria you define.',
    group: 'solutions',
    nav: { description: 'Answers grounded in your rules' },
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/solutions/legal',
    title: 'Legal',
    description:
      'Check conditions against defined terms: an illustrative example of testing a clause set against a defined condition.',
    group: 'solutions',
    nav: { description: 'Check conditions against defined terms' },
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/solutions/security',
    title: 'Security',
    description:
      'Policy decisions you can audit: an illustrative example of checking privileged access, with evidence you can replay.',
    group: 'solutions',
    nav: { description: 'Policy decisions you can audit' },
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/solutions/use-cases',
    title: 'Use cases',
    description:
      'Preview 004 ships with four synthetic example worlds. The rest are sketches of where the same method could apply.',
    group: 'solutions',
    nav: { description: 'Example worlds, from purchasing to venues' },
    sitemap: true,
    surfaceTop: 'paper',
  },

  // Developer
  {
    path: '/developers',
    title: 'API overview',
    description:
      'The lifecycle, concepts and outcomes behind checked answers. Preview 004 is a local CLI; there is no public inference API yet.',
    group: 'developer',
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/developers/docs',
    title: 'Documentation',
    description:
      'Concepts and contracts for Moth Preview 004: fields, definitions, questions, outcomes, evidence, and limits.',
    group: 'developer',
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/developers/models',
    title: 'Models',
    description:
      'The model card for Moth Inference Preview 004: capabilities, language contract, outcomes, qualification, and limits.',
    group: 'developer',
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/pricing',
    title: 'Pricing',
    description:
      'Moth is in preview. We price by conversation until the hosted service exists — no invented tiers.',
    group: 'developer',
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/changelog',
    title: 'Changelog',
    description: 'Updates to Mumbrane models, research, and products.',
    group: 'developer',
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/status',
    title: 'Status',
    description: 'We’ll publish live status when there is a hosted service to monitor.',
    group: 'developer',
    sitemap: true,
    surfaceTop: 'paper',
  },

  // Company
  {
    path: '/company',
    title: 'Company',
    description:
      'Mumbrane is an independent research lab investigating field-based intelligence: retained knowledge, reusable skills, and explicit constraints.',
    group: 'company',
    nav: { label: 'About' },
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/research',
    title: 'Research',
    description:
      'Mumbrane’s research into field-based intelligence, energy-guided reasoning, and the causal limits of inference.',
    group: 'company',
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/news',
    title: 'News',
    description: 'Product developments, engineering decisions, and practical examples from Mumbrane Labs.',
    group: 'company',
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/careers',
    title: 'Careers',
    description: 'We are not listing open roles right now, but we read every thoughtful note.',
    group: 'company',
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/contact',
    title: 'Contact',
    description:
      'Tell us what you are trying to understand, where the difficulty is, and what a useful conversation might unlock.',
    group: 'company',
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/contact/sales',
    title: 'Contact sales',
    description:
      'Tell us about the decisions you want a model to make from your own rules. We’ll tell you honestly whether Moth fits today.',
    group: 'company',
    sitemap: true,
    surfaceTop: 'paper',
  },

  // Console preview (noindex)
  {
    path: '/console',
    title: 'Console',
    description: 'A browser simulation of the Mumbrane console, using synthetic example worlds.',
    group: 'console',
    sitemap: false,
    noindex: true,
    surfaceTop: 'paper',
  },
  {
    path: '/console/playground',
    title: 'Playground',
    description: 'Ask questions of a synthetic example world and inspect the simulated evidence.',
    group: 'console',
    sitemap: false,
    noindex: true,
    surfaceTop: 'paper',
  },
  {
    path: '/console/keys',
    title: 'Keys',
    description: 'API keys in the console preview. There is no public API yet.',
    group: 'console',
    sitemap: false,
    noindex: true,
    surfaceTop: 'paper',
  },
  {
    path: '/console/usage',
    title: 'Usage',
    description: 'Usage in the console preview. Nothing is metered in the simulation.',
    group: 'console',
    sitemap: false,
    noindex: true,
    surfaceTop: 'paper',
  },
  {
    path: '/console/settings',
    title: 'Settings',
    description: 'Console preview settings: theme and local preferences.',
    group: 'console',
    sitemap: false,
    noindex: true,
    surfaceTop: 'paper',
  },

  // Legal
  {
    path: '/legal/terms',
    title: 'Terms',
    description: 'The terms of use for the Mumbrane website and services.',
    group: 'legal',
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/legal/enterprise-terms',
    title: 'Enterprise terms',
    description: 'Enterprise terms are provided with each agreement. Contact sales for a copy.',
    group: 'legal',
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/legal/privacy',
    title: 'Privacy',
    description: 'How Mumbrane handles personal information.',
    group: 'legal',
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/legal/cookies',
    title: 'Cookies',
    description: 'This site does not use cookies for analytics, advertising, or tracking.',
    group: 'legal',
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/legal/privacy-choices',
    title: 'Privacy choices',
    description: 'Your privacy choices at Mumbrane, including how we honor Global Privacy Control.',
    group: 'legal',
    sitemap: true,
    surfaceTop: 'paper',
  },
  {
    path: '/legal/responsible-disclosure',
    title: 'Responsible disclosure',
    description: 'How to report a security issue in mumbrane.com or the console preview.',
    group: 'legal',
    sitemap: true,
    surfaceTop: 'paper',
  },
] as const satisfies readonly RouteEntry[]

export type RoutePath = (typeof ROUTES)[number]['path']

export function routeFor(path: RoutePath): RouteEntry {
  const entry = ROUTES.find((r) => r.path === path)
  // Unreachable: RoutePath is derived from ROUTES itself.
  if (!entry) throw new Error(`Unknown route: ${path}`)
  return entry
}
