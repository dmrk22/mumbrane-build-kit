export const site = {
  name: 'Mumbrane',
  title: 'Mumbrane — Field-based intelligence',
  titleTemplate: '%s — Mumbrane',
  description:
    'Mumbrane builds field-based intelligence: your data becomes the field, and a question settles where your facts and definitions support it.',
  skipLink: 'Skip to content',
  // PAGES §0.8. Error pages never echo the requested path or the error.
  // /console while the console app is parked (D-147). No dates: nothing is promised.
  consoleSoon: {
    eyebrow: 'Console',
    title: 'The console is coming soon.',
    body: 'We’re building the hosted console for Moth. Until it opens, Moth Preview 004 runs locally as a CLI, and we’re glad to walk you through it.',
    links: [
      { label: 'Talk to the lab', href: '/contact' },
      { label: 'Explore Moth', href: '/moth' },
    ],
  },
  notFound: {
    eyebrow: '404',
    title: 'This page is outside the field.',
    body: 'The address doesn’t match anything we’ve defined.',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Research', href: '/research' },
      { label: 'News', href: '/news' },
    ],
  },
  error: {
    eyebrow: 'Error',
    title: 'Something went wrong on our side.',
    body: 'The page could not be shown. Trying again usually works.',
    retry: 'Try again',
    home: 'Go home',
  },
  manifest: { shortName: 'Mumbrane' },
} as const
