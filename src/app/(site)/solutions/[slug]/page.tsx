import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FieldWindow } from '@/components/instrument/FieldWindow'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { Icon } from '@/components/ui/Icon'
import { Note } from '@/components/ui/Note'
import { SmartLink } from '@/components/ui/SmartLink'
import { SOLUTION_UI, SOLUTIONS, solutionBySlug } from '@/content/solutions'
import { routeMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = solutionBySlug((await params).slug)
  return s ? routeMetadata(`/solutions/${s.slug}`) : {}
}

// PAGES §9.1 — SolutionTemplate. Surfaces: paper · ink · paper-2 · ice.
export default async function SolutionPage({ params }: Props) {
  const s = solutionBySlug((await params).slug)
  if (!s) notFound()
  const ui = SOLUTION_UI
  return (
    <>
      <Section surface="paper" labelledBy="solution-title" className="pt-12 md:pt-16 lg:pt-24">
        <Eyebrow>{ui.eyebrow(s.name)}</Eyebrow>
        <h1 id="solution-title" className="mt-4 max-w-[18ch] font-display text-display-l">
          {s.title}
        </h1>
        <p className="mt-8 max-w-[56ch] text-lede text-surface-muted">{s.lede}</p>
        {s.note && (
          <Note tone="caveat" className="mt-8 max-w-xl">
            {s.note}
          </Note>
        )}
      </Section>

      <Section surface="ink" id="illustrative-world" labelledBy="rulebook-title">
        <Grid className="items-start gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <Eyebrow>{ui.world}</Eyebrow>
            <Heading level={2} size="display-m" id="rulebook-title" className="mt-4">
              {ui.rulebook}
            </Heading>
            <p className="mt-4 text-body text-surface-muted">{ui.rulebookLede}</p>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <FieldWindow field={s.world} tag={ui.illustrative} tags={ui.tags} />
            <p className="mt-4 font-mono text-label text-surface-muted">{ui.worldCaption}</p>
          </div>
        </Grid>
      </Section>

      <Section surface="paper-2" id="evidence" labelledBy="evidence-title">
        <Grid className="gap-y-12">
          <div className="col-span-12 lg:col-span-7">
            <Heading level={2} size="display-m" id="evidence-title">
              {ui.evidence}
            </Heading>
            <ul className="mt-10 flex flex-col gap-6">
              {s.evidence.map((e) => (
                <li key={e} className="flex items-start gap-4 text-lede">
                  <Icon name="check" className="mt-1.5 size-5 shrink-0 text-ice-fg" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <aside
            aria-labelledby="limits-title"
            className="col-span-12 rounded-md border border-surface-rule bg-surface p-6 md:p-8 lg:col-span-5"
          >
            <h2 id="limits-title" className="font-mono text-label text-surface-subtle">
              {ui.limits.title}
            </h2>
            <p className="mt-5 text-small text-surface-muted">{ui.limits.text}</p>
            <SmartLink href={ui.limits.link.href} className="link-prose mt-4 inline-block text-small">
              {ui.limits.link.label}
            </SmartLink>
          </aside>
          {s.slug === 'security' && (
            <aside
              data-surface="ink"
              aria-labelledby="own-security-title"
              className="col-span-12 flex flex-wrap items-end justify-between gap-6 p-6 md:p-8"
            >
              <div>
                <h2 id="own-security-title" className="font-display text-display-s">
                  {ui.security.title}
                </h2>
                <p className="mt-3 max-w-[60ch] text-body text-surface-muted">{ui.security.text}</p>
              </div>
              <SmartLink href={ui.security.link.href} className="link-prose text-small">
                {ui.security.link.label}
              </SmartLink>
            </aside>
          )}
        </Grid>
      </Section>

      <Section surface="ice" id="talk-to-us" labelledBy="solution-cta-title" rhythm="compact">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Heading level={2} size="display-m" id="solution-cta-title">
              {ui.cta.title(s.name)}
            </Heading>
            <p className="mt-4 max-w-[52ch] text-body text-surface-muted">{ui.cta.text}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button href={`/contact?interest=${s.slug}`} arrow>
              {ui.cta.primary}
            </Button>
            <Button href="/contact/sales" variant="secondary">
              {ui.cta.sales}
            </Button>
            <Button href="/solutions/use-cases" variant="text" arrow>
              {ui.cta.worlds}
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
