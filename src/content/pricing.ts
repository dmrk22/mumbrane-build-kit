// /pricing, /changelog, /status (CONTENT §3.10–§3.12). No prices, tiers, uptime or invented
// entries: plans say what exists; the changelog lists real dates only; status is "not yet
// monitored" everywhere (CONTENT §4).

export const PRICING = {
  eyebrow: 'Pricing',
  title: 'Pricing',
  lede: 'Moth is in preview. We price by conversation until the hosted service exists — no invented tiers.',
  plans: [
    {
      name: 'Console preview',
      price: 'Free',
      pigment: 'ice',
      text: 'Explore the console design with synthetic example worlds in your browser.',
      facts: ['A simulation that runs in your browser.', 'Nothing you type leaves the page.'],
      action: { label: 'Try the console', href: '/console' },
    },
    {
      name: 'Local evaluation',
      price: 'By arrangement',
      pigment: 'moss',
      text: 'Moth Preview 004 delivered for evaluation on macOS ARM64, with documentation and qualification evidence.',
      facts: [
        'Local CLI delivery; no public download.',
        'Documentation and qualification evidence included.',
      ],
      action: { label: 'Contact sales', href: '/contact/sales' },
    },
    {
      name: 'Hosted and enterprise',
      price: 'Not yet available',
      pigment: 'ink',
      text: 'Tell us what you need; we’ll say honestly what exists.',
      facts: ['No hosted service or public API yet.', 'No published terms until the service exists.'],
      action: { label: 'Contact sales', href: '/contact/sales' },
    },
  ],
  faq: {
    title: 'Questions',
    items: [
      {
        q: 'Is there a free trial?',
        a: 'The console preview is free. It is a simulation that runs in your browser with synthetic example worlds, not the model itself.',
      },
      { q: 'Is there an API?', a: 'Not yet. Preview 004 is a local CLI; there is no public inference API.' },
      { q: 'How will pricing work later?', a: 'We’ll publish it here when the hosted service launches.' },
    ],
  },
  note: {
    text: 'What has actually shipped, and when:',
    link: { label: 'the changelog', href: '/changelog' },
  },
} as const

export type ChangeTag = 'Model' | 'Research' | 'News' | 'Website'

export const CHANGELOG = {
  eyebrow: 'Developers',
  title: 'Changelog',
  lede: 'Updates to Mumbrane models, research, and products.',
  // Real dates only, newest first (CONTENT §3.11). A "Website" entry waits for the owner's launch
  // date (D-012).
  entries: [
    {
      date: '2026-09-22',
      title: 'Moth Inference Preview 004 announced',
      tags: ['Model'],
      text: 'A local CLI preview for configurable classification over compiled fields.',
      href: '/news/introducing-moth-preview-004',
    },
    {
      date: '2026-09-22',
      title: 'Three field notes published',
      tags: ['News'],
      text: 'Product developments, engineering decisions, and practical examples.',
      href: '/news',
    },
    {
      date: '2026-09-22',
      title: 'Research perspective updated',
      tags: ['Research'],
      text: 'Towards field-based intelligence, revised.',
      href: '/research/toward-field-based-intelligence',
    },
    {
      date: '2026-09-16',
      title: 'Research perspective “Towards field-based intelligence” published',
      tags: ['Research'],
      text: 'Our research hypothesis: persistent knowledge, interacting fields, and energy-guided inference.',
      href: '/research/toward-field-based-intelligence',
    },
  ] satisfies { date: string; title: string; tags: ChangeTag[]; text: string; href: string }[],
  read: 'Read',
} as const

export const STATUS = {
  eyebrow: 'Developers',
  title: 'Status',
  lede: 'We’ll publish live status when there is a hosted service to monitor.',
  banner: 'Not yet monitored — we’ll publish live status when there is a hosted service.',
  state: 'Not yet monitored',
  noData: 'No data yet',
  days: 90,
  barLabel: (days: number) => `Last ${days} days: no data yet.`,
  components: [
    { name: 'Website', text: 'mumbrane.com' },
    { name: 'Console preview', text: 'The in-browser simulation.' },
    { name: 'Hosted API', text: 'Not launched.' },
    { name: 'Moth Preview 004', text: 'Local delivery — not applicable.' },
  ],
  note: 'We will not show uptime numbers we do not measure.',
} as const
