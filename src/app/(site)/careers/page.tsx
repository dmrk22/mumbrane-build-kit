import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { Inline } from '@/components/ui/Inline'
import { CAREERS } from '@/content/company'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/careers')

// PAGES §6 — surfaces: paper · paper-2 · paper · sulfur. No job listing component exists until
// the owner supplies roles (CONTENT §4: never invent openings).
export default function CareersPage() {
  const { hero, principles, areas, cta } = CAREERS
  return (
    <>
      <Section surface="paper" labelledBy="careers-title" className="pt-12 md:pt-16 lg:pt-24">
        <Eyebrow>{hero.eyebrow}</Eyebrow>
        <h1 id="careers-title" className="mt-4 max-w-[16ch] font-display text-display-xl">
          <Inline text={hero.title} />
        </h1>
        <p className="mt-8 max-w-[44ch] font-serif text-lede text-surface-muted">{hero.lede}</p>
      </Section>

      <Section surface="paper-2" id="how-we-work" labelledBy="principles-title">
        <Heading level={2} size="display-m" id="principles-title">
          {principles.title}
        </Heading>
        <ol className="mt-12 grid gap-px border border-surface-rule bg-surface-rule md:grid-cols-2">
          {principles.items.map((p, i) => (
            <li key={p} className="flex min-h-44 flex-col justify-between gap-8 bg-surface p-6 md:p-8">
              <span className="font-mono text-label text-surface-subtle tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-display text-display-s">{p}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section surface="paper" id="areas" labelledBy="areas-title">
        <Heading level={2} size="display-m" id="areas-title" className="max-w-[20ch]">
          {areas.title}
        </Heading>
        <ul className="mt-12 border-t border-surface-rule">
          {areas.items.map((a) => (
            <li key={a.name} className="border-b border-surface-rule py-5">
              <Grid className="items-center gap-y-3">
                <div className="col-span-12 md:col-span-6">
                  <Chip>{a.name}</Chip>
                </div>
                <p className="col-span-12 text-body text-surface-muted md:col-span-6">{a.gloss}</p>
              </Grid>
            </li>
          ))}
        </ul>
      </Section>

      <Section surface="sulfur" id="write-to-us" labelledBy="careers-cta-title" rhythm="compact">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Heading level={2} size="display-m" id="careers-cta-title">
              {cta.title}
            </Heading>
            <p className="mt-4 text-body text-surface-muted">{cta.note}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href={cta.email.href} arrow>
              {cta.email.label}
            </Button>
            <Button href={cta.form.href} variant="secondary">
              {cta.form.label}
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
