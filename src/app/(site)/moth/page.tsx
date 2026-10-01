import { MothCurve } from '@/components/art/MothCurve'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { OutcomeLedger } from '@/components/sections/OutcomeLedger'
import { Pipeline } from '@/components/sections/Pipeline'
import { PurchasingExplainer } from '@/components/sections/PurchasingExplainer'
import { Qualification } from '@/components/sections/Qualification'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Chip'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { Icon } from '@/components/ui/Icon'
import { Inline } from '@/components/ui/Inline'
import { Note } from '@/components/ui/Note'
import { MOTH } from '@/content/moth'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/moth')

/** Eyebrow + H2 for a content section: offset editorial on desktop (DESIGN §4.3). */
function SectionHead({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Eyebrow>{eyebrow}</Eyebrow>
      <SplitReveal>
        <Heading level={2} size="display-m" id={id}>
          <Inline text={title} />
        </Heading>
      </SplitReveal>
    </div>
  )
}

// PAGES §2 — surfaces: paper · ink · paper · paper-2 · paper · paper-2 · paper · paper · ink · paper-2 · ice.
export default function MothPage() {
  const { hero, how, purchasing, outcomes, preview, qualification, direction } = MOTH
  return (
    <>
      <Section surface="paper" labelledBy="moth-title" className="pt-10 lg:pt-16">
        <Grid className="items-center gap-y-14">
          <div className="col-span-12 lg:col-span-6">
            <Eyebrow>{hero.eyebrow}</Eyebrow>
            <h1 id="moth-title" className="mt-4 font-display text-display-xl">
              {hero.title}
            </h1>
            <p className="mt-6 text-lede text-surface-muted text-balance">
              <Inline text={hero.subhead} />
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href={hero.primary.href} arrow>
                {hero.primary.label}
              </Button>
              <Button href={hero.secondary.href} variant="secondary">
                {hero.secondary.label}
              </Button>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <MothCurve />
          </div>
        </Grid>
      </Section>

      <Section surface="ink" id="how-it-works" labelledBy="how-title">
        <SectionHead eyebrow={how.eyebrow} title={how.title} id="how-title" />
        <Pipeline steps={how.steps} figure={how.figure} caption={how.caption} className="mt-14" />
      </Section>

      <Section surface="paper" id="purchase-readiness" labelledBy="purchasing-title">
        <SectionHead eyebrow={purchasing.eyebrow} title={purchasing.title} id="purchasing-title" />
        <div className="mt-12">
          <PurchasingExplainer p={purchasing} />
        </div>
        <p className="mt-10 max-w-[64ch] text-caption text-surface-muted">{purchasing.disclaimer}</p>
      </Section>

      <Section surface="paper-2" id="outcomes" labelledBy="outcomes-title">
        <SectionHead eyebrow={outcomes.eyebrow} title={outcomes.title} id="outcomes-title" />
        <OutcomeLedger outcomes={outcomes.ledger} heads={outcomes.heads} className="mt-12" />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {outcomes.boundaries.map((b) => (
            <p key={b} className="text-small text-surface-muted">
              <Inline text={b} />
            </p>
          ))}
        </div>
      </Section>

      <Section surface="paper" id="evidence" labelledBy="preview-title">
        <SectionHead eyebrow={preview.eyebrow} title={preview.title} id="preview-title" />
        <Grid className="mt-12 gap-y-10">
          <div className="col-span-12 flex flex-col gap-6 lg:col-span-6">
            <p className="text-body">{preview.scope}</p>
            <p className="text-body text-surface-muted">{preview.platform}</p>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <h3 className="font-mono text-label text-surface-subtle">{preview.supportsTitle}</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {preview.supports.map((s) => (
                <li key={s} className="flex gap-3 text-small">
                  <Icon name="check" className="mt-0.5 size-4 text-ice-fg" />
                  {s}
                </li>
              ))}
            </ul>
            <Note tone="info" className="mt-8">
              <p>{preview.note}</p>
            </Note>
          </div>
        </Grid>
      </Section>

      <Section
        surface="paper"
        id="qualification"
        labelledBy="qualification-title"
        className="pt-0 md:pt-0 lg:pt-0"
      >
        <SectionHead eyebrow={qualification.eyebrow} title={qualification.title} id="qualification-title" />
        <div className="mt-12">
          <Qualification />
        </div>
      </Section>

      <Section surface="paper-2" id="prepared-base" labelledBy="direction-title">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Eyebrow>{direction.eyebrow}</Eyebrow>
            <Tag>{direction.tag}</Tag>
          </div>
          <Heading level={2} size="display-m" id="direction-title">
            {direction.title}
          </Heading>
        </div>
        <p className="mt-8 max-w-[60ch] text-lede">{direction.text}</p>
        <Button href={direction.link.href} variant="text" arrow className="mt-8">
          {direction.link.label}
        </Button>
      </Section>

      <Section surface="ice" id="get-the-preview" labelledBy="get-title">
        <Heading level={2} size="display-m" id="get-title">
          {MOTH.getPreview.title}
        </Heading>
        <p className="mt-6 max-w-[56ch] text-lede">{MOTH.getPreview.text}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={MOTH.getPreview.primary.href} arrow>
            {MOTH.getPreview.primary.label}
          </Button>
          <Button href={MOTH.getPreview.secondary.href} variant="secondary">
            {MOTH.getPreview.secondary.label}
          </Button>
        </div>
      </Section>
    </>
  )
}
