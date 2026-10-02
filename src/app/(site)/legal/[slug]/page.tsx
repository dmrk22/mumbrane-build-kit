import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { GpcNotice } from '@/components/sections/GpcNotice'
import { Blocks } from '@/components/ui/Blocks'
import { Eyebrow } from '@/components/ui/Heading'
import { Note } from '@/components/ui/Note'
import { Prose } from '@/components/ui/Prose'
import { SmartLink } from '@/components/ui/SmartLink'
import { LEGAL, LEGAL_UI, type LegalSlug, legalDoc } from '@/content/legal'
import { ROUTES, routeFor } from '@/content/routes'
import { cx } from '@/lib/cx'
import { proseDate } from '@/lib/format'
import { routeMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

const PAGES = ROUTES.filter((r) => r.path.startsWith('/legal/'))

export function generateStaticParams() {
  return Object.keys(LEGAL).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return legalDoc(slug) ? routeMetadata(`/legal/${slug as LegalSlug}`) : {}
}

// PAGES §14 — surfaces: paper. Rail of every legal page (wraps above the text below 1024 px),
// the text in columns 4–10, a draft banner where CONTENT §3.13 asks for one.
export default async function LegalPage({ params }: Props) {
  const { slug } = await params
  const doc = legalDoc(slug)
  if (!doc) notFound()
  const path = `/legal/${slug as LegalSlug}` as const
  return (
    <section
      data-surface="paper"
      aria-labelledby="legal-title"
      className="pt-12 pb-16 md:pt-16 md:pb-24 lg:pt-24 lg:pb-32"
    >
      <Container>
        <div className="grid grid-cols-12 gap-x-4 md:gap-x-gutter">
          <nav aria-label={LEGAL_UI.nav} className="col-span-12 mb-10 lg:col-span-3 lg:mb-0 print:hidden">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-small lg:sticky lg:top-28 lg:flex-col lg:gap-3">
              {PAGES.map((r) => (
                <li key={r.path}>
                  <SmartLink
                    href={r.path}
                    aria-current={r.path === path ? 'page' : undefined}
                    className={cx(
                      'link-prose',
                      r.path === path ? 'font-medium text-surface-fg' : 'text-surface-muted',
                    )}
                  >
                    {r.title}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-12 lg:col-span-7 lg:col-start-4">
            <Eyebrow>{LEGAL_UI.eyebrow}</Eyebrow>
            <h1 id="legal-title" className="mt-4 font-display text-display-l">
              {routeFor(path).title}
            </h1>
            <p className="mt-6 font-mono text-label text-surface-subtle">
              {LEGAL_UI.updated} <time dateTime={doc.updated}>{proseDate(doc.updated)}</time>
            </p>
            {doc.banner && (
              <Note tone="caveat" className="mt-8">
                <p>{LEGAL_UI.banner[doc.banner]}</p>
              </Note>
            )}
            {slug === 'privacy-choices' && (
              <GpcNotice>
                <Note tone="info" className="mt-4">
                  <p>{LEGAL_UI.gpc}</p>
                </Note>
              </GpcNotice>
            )}
            <Prose className="mt-10">
              <Blocks blocks={doc.blocks} />
            </Prose>
          </div>
        </div>
      </Container>
    </section>
  )
}
