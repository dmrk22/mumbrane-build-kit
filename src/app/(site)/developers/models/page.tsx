import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { LanguageContract } from '@/components/sections/LanguageContract'
import { OutcomeLedger } from '@/components/sections/OutcomeLedger'
import { Qualification } from '@/components/sections/Qualification'
import { SpecTable } from '@/components/sections/SpecTable'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Chip'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { Icon } from '@/components/ui/Icon'
import { MODELS, MOTH } from '@/content/moth'
import { shortDate } from '@/lib/format'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/developers/models')

// PAGES §11.3 — surfaces: paper · paper-2 · paper. Shared modules come from /moth (no duplicated copy).
export default function ModelsPage() {
  const { hero, card, upcoming } = MODELS
  const facts = card.facts.map((f) => (f.label === 'Announced' ? { ...f, value: shortDate(f.value) } : f))
  return (
    <>
      <Section surface="paper" labelledBy="models-title" className="pt-10 lg:pt-16">
        <Eyebrow>{hero.eyebrow}</Eyebrow>
        <h1 id="models-title" className="mt-4 font-display text-display-l">
          {hero.title}
        </h1>
        <p className="mt-6 max-w-[48ch] text-lede text-surface-muted">{hero.lede}</p>

        <article aria-labelledby="model-card-title" className="mt-14 border border-surface-rule">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-rule bg-surface-raise px-6 py-5">
            <Heading level={2} size="display-s" id="model-card-title">
              {card.name}
            </Heading>
            <Tag>{card.status}</Tag>
          </header>
          <Grid className="gap-y-10 p-6">
            <div className="col-span-12 lg:col-span-5">
              <SpecTable rows={facts} />
            </div>
            <div className="col-span-12 grid gap-8 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
              <div>
                <h3 className="font-mono text-label text-surface-subtle">{card.capabilitiesTitle}</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {MOTH.preview.supports.map((s) => (
                    <li key={s} className="flex gap-3 text-small">
                      <Icon name="check" className="mt-0.5 size-4 text-ice-fg" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-label text-surface-subtle">{card.notIncludedTitle}</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {card.notIncluded.map((s) => (
                    <li key={s} className="flex gap-3 text-small text-surface-muted">
                      <Icon name="minus" className="mt-0.5 size-4" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Grid>
        </article>
      </Section>

      <Section surface="paper-2" id="language-contract" labelledBy="contract-title">
        <Eyebrow>{MOTH.contract.eyebrow}</Eyebrow>
        <Heading level={2} size="display-m" id="contract-title" className="mt-4">
          {MOTH.contract.title}
        </Heading>
        <div className="mt-12">
          <LanguageContract />
        </div>
      </Section>

      <Section surface="paper" id="outcomes" labelledBy="outcomes-title">
        <Eyebrow>{MOTH.outcomes.eyebrow}</Eyebrow>
        <Heading level={2} size="display-m" id="outcomes-title" className="mt-4">
          {MOTH.outcomes.title}
        </Heading>
        <OutcomeLedger outcomes={MOTH.outcomes.ledger} heads={MOTH.outcomes.heads} className="mt-12" />
      </Section>

      <Section
        surface="paper"
        id="qualification"
        labelledBy="qualification-title"
        className="pt-0 md:pt-0 lg:pt-0"
      >
        <Eyebrow>{MOTH.qualification.eyebrow}</Eyebrow>
        <Heading level={2} size="display-m" id="qualification-title" className="mt-4">
          {MOTH.qualification.title}
        </Heading>
        <div className="mt-12">
          <Qualification />
        </div>
        <aside
          aria-labelledby="upcoming-title"
          className="mt-16 flex flex-col gap-4 border border-dashed border-surface-rule p-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Heading level={2} size="title" id="upcoming-title">
              {upcoming.title}
            </Heading>
            <Tag>{upcoming.tag}</Tag>
          </div>
          <p className="max-w-[60ch] text-body text-surface-muted">{upcoming.text}</p>
          <Button href={upcoming.link.href} variant="text" arrow className="self-start">
            {upcoming.link.label}
          </Button>
        </aside>
      </Section>
    </>
  )
}
