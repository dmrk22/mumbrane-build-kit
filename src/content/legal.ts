// Legal pages (PAGES §14, CONTENT §3.13). Terms and privacy are the live texts from the source
// (generated blocks); privacy gains one sentence for this build; the rest are drafts pending owner
// and legal review. Disclosure wording mirrors the repository SECURITY.md (SECURITY §9.2).
import { LEGAL_BODIES } from './articleBodies.ts'
import { type Block, slugify } from './blocks.ts'
import type { RoutePath } from './routes.ts'

type LegalPath = Extract<RoutePath, `/legal/${string}`>
export type LegalSlug = LegalPath extends `/legal/${infer S}` ? S : never

export const LEGAL_UI = {
  eyebrow: 'Legal',
  nav: 'Legal pages',
  updated: 'Last updated',
  banner: {
    draft: 'Draft — pending owner and legal review. This page is not yet in force.',
    review: 'Updated — pending owner review.',
  },
  gpc: 'Your browser’s Global Privacy Control signal is on — noted.',
} as const

export type LegalDoc = {
  /** The date this text last changed on this site. */
  updated: string
  banner: keyof typeof LEGAL_UI.banner | null
  blocks: readonly Block[]
}

const h2 = (text: string): Block => ({ type: 'h2', text, id: slugify(text) })
const p = (text: string): Block => ({ type: 'p', text })

export const LEGAL: Record<LegalSlug, LegalDoc> = {
  terms: { updated: '2026-10-01', banner: null, blocks: LEGAL_BODIES.terms },
  'enterprise-terms': {
    updated: '2026-10-01',
    banner: 'draft',
    blocks: [
      p('Enterprise terms are provided with each agreement. [Contact sales](/contact/sales) for a copy.'),
    ],
  },
  privacy: {
    updated: '2026-10-01',
    banner: 'review',
    // The added sentence sits under "Information you provide", marked as a note until reviewed.
    blocks: [
      ...LEGAL_BODIES.privacy.slice(0, 2),
      {
        type: 'note',
        tone: 'info',
        text: 'This site does not use analytics, advertising, or tracking cookies. The console preview stores your theme choice in your browser, and nothing else.',
      },
      ...LEGAL_BODIES.privacy.slice(2),
    ],
  },
  cookies: {
    updated: '2026-10-01',
    banner: 'draft',
    blocks: [
      p(
        'This site does not use cookies for analytics, advertising, or tracking, and its own code sets none. The console preview stores one preference (your theme) in your browser’s local storage; you can clear it at any time from [Settings](/console/settings).',
      ),
    ],
  },
  'privacy-choices': {
    updated: '2026-10-01',
    banner: 'draft',
    blocks: [
      p(
        'We don’t sell or share personal information, we don’t use targeted advertising, and we honor Global Privacy Control signals. There is nothing to switch off here because nothing is switched on.',
      ),
    ],
  },
  'responsible-disclosure': {
    updated: '2026-10-01',
    banner: 'draft',
    blocks: [
      h2('How to report'),
      p(
        'Email [hello@mumbrane.com](mailto:hello@mumbrane.com?subject=Security) with “Security” in the subject. Please include the URL, the steps to reproduce, the impact, and whether you have shared the finding with anyone else. Do not include personal data you obtained.',
      ),
      h2('What we ask'),
      {
        type: 'list',
        ordered: false,
        items: [
          'Give us a reasonable time to fix the issue before disclosing it.',
          'Do not access, modify, or delete data that isn’t yours.',
          'No denial-of-service, spam, social engineering, or physical tests.',
          'Stop and report as soon as you have shown the issue.',
        ],
      },
      h2('What we do'),
      p(
        'We acknowledge your report and keep you informed until it is resolved. If you wish, we credit you for the finding.',
      ),
      h2('Scope'),
      p('In scope: mumbrane.com and its console preview.'),
      p(
        'Out of scope: third-party services linked from the site, findings that require a compromised device, missing headers without a demonstrated impact, and automated scanner output without a proof of concept.',
      ),
      h2('Safe harbor'),
      p(
        'If you make a good-faith effort to follow this policy, we will treat your research as authorized and will not take legal action against you for it.',
      ),
    ],
  },
}

export function legalDoc(slug: string): LegalDoc | undefined {
  return Object.hasOwn(LEGAL, slug) ? LEGAL[slug as LegalSlug] : undefined
}
