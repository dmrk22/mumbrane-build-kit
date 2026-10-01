// Header and footer navigation (CONTENT §2). Paths are registry paths (checked by the type and by
// links.test.ts); labels default to the registry title.
import { type RoutePath, routeFor } from './routes.ts'
import { SOCIAL } from './social.ts'

export type NavLink = { label: string; href: string; description?: string }
export type Menu = {
  id: string
  label: string
  links: NavLink[]
  /** The section's own overview page: the trigger is current there too. */
  index?: string
}

function link(path: RoutePath, description?: string): NavLink {
  const r = routeFor(path)
  return { label: r.nav?.label ?? r.title, href: path, ...(description ? { description } : {}) }
}

export const HEADER = {
  label: 'Primary',
  menus: [
    {
      id: 'solutions',
      label: 'Solutions',
      index: '/solutions',
      links: [
        { ...link('/solutions', 'Where closed-world reasoning fits'), label: 'Overview' },
        link('/solutions/business', 'Decisions that follow your policies'),
        link('/solutions/customer-support', 'Answers grounded in your rules'),
        link('/solutions/legal', 'Check conditions against defined terms'),
        link('/solutions/security', 'Policy decisions you can audit'),
        link('/solutions/use-cases', 'Example worlds, from purchasing to venues'),
      ],
    },
    {
      id: 'developer',
      label: 'Developer',
      links: [
        link('/moth', 'Configurable classification with checked answers'),
        link('/developers', 'Lifecycle, concepts and outcomes'),
        link('/developers/docs', 'Concepts and contracts for Preview 004'),
        link('/developers/models', 'Moth Inference Preview 004'),
        link('/console', 'A browser simulation with example worlds'),
        link('/pricing', 'Priced by conversation during the preview'),
        link('/changelog', 'Models, research and products'),
        link('/status', 'Not yet monitored'),
      ],
    },
  ] satisfies Menu[],
  links: [link('/pricing'), link('/news'), link('/research')],
  actions: {
    secondary: link('/contact/sales'),
    primary: { label: 'Try for free', href: '/console' },
  },
  menuButton: { open: 'Open menu', close: 'Close menu' },
  homeLabel: 'Mumbrane — home',
} as const

export const FOOTER = {
  tagline: 'Intelligence for closed worlds.',
  columns: [
    {
      title: 'Solutions',
      links: [
        link('/solutions/business'),
        link('/solutions/customer-support'),
        link('/solutions/legal'),
        link('/solutions/security'),
        link('/solutions/use-cases'),
      ],
    },
    {
      title: 'Company',
      links: [link('/company'), link('/careers'), link('/news'), link('/contact'), link('/research')],
    },
    {
      title: 'Developer',
      links: [
        link('/developers'),
        link('/pricing'),
        link('/developers/models'),
        link('/console'),
        link('/changelog'),
        link('/developers/docs'),
        link('/status'),
      ],
    },
    { title: 'Enterprise', links: [link('/contact/sales')] },
    {
      title: 'Legal',
      links: [
        link('/legal/terms'),
        link('/legal/enterprise-terms'),
        link('/legal/privacy'),
        link('/legal/cookies'),
        link('/legal/privacy-choices'),
      ],
    },
    { title: 'Social', links: SOCIAL.map((s) => ({ label: s.label, href: s.href })) },
  ] satisfies { title: string; links: NavLink[] }[],
  legal: {
    copyright: '© 2026 Mumbrane',
    motto: 'Evidence, retained.',
  },
} as const
