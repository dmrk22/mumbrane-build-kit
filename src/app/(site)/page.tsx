import { Plate } from '@/components/art/Plate'
import { InstrumentWindow } from '@/components/instrument/InstrumentWindow'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { InView } from '@/components/motion/InView'
import { Reveal } from '@/components/motion/Reveal'
import { ScrubText } from '@/components/motion/ScrubText'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { HomeHero } from '@/components/sections/HomeHero'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { OutcomeGlyph } from '@/components/sections/OutcomeGlyph'
import { Button } from '@/components/ui/Button'
import { Heading } from '@/components/ui/Heading'
import { articleBySlug, articlePath } from '@/content/articles'
import { HOME } from '@/content/home'
import { OUTCOMES } from '@/content/outcomes'
import { JsonLd } from '@/lib/security/json-ld'
import { homeJsonLd, routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/')

const PLATE_SIZES = '(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw'

/** The principle as two paths: one reaches its answer, one ends without support. */
function PrincipleFigure() {
  const { rows } = HOME.principle
  return (
    <InView className="principle-figure">
      <svg
        viewBox="0 0 1000 170"
        className="block h-auto w-full min-w-[560px]"
        aria-hidden="true"
        fill="none"
      >
        {rows.map((r, i) => {
          const y = 48 + i * 82
          return (
            <g key={r.to}>
              <text x={0} y={y + 4} className="dg-label">
                {r.from}
              </text>
              <circle cx={150} cy={y} r={4} className="dg-node" />
              <path d={`M150 ${y} H520`} className="dg-accent pf-draw" pathLength={1} />
              <circle cx={520} cy={y} r={4} className="dg-node" />
              <text x={520} y={y - 16} textAnchor="middle" className="dg-label">
                {r.via}
              </text>
              {r.supported ? (
                <>
                  <path d={`M520 ${y} H880`} className="dg-accent pf-draw pf-late" pathLength={1} />
                  <circle cx={880} cy={y} r={7} className="dg-dot pf-pop" />
                </>
              ) : (
                <>
                  <path d={`M530 ${y} H870`} className="dg-line dg-dash pf-pop" />
                  <circle cx={880} cy={y} r={6.5} className="dg-hollow pf-pop" />
                </>
              )}
              <text x={900} y={y + 4} className="dg-label-strong pf-pop">
                {r.to}
              </text>
            </g>
          )
        })}
      </svg>
    </InView>
  )
}

// Surfaces: white first and last; between them grey, black and white twice each, never side by side.
export default function Home() {
  const { principle, how, evidence, compounding, research, release, getStarted } = HOME
  const plates = research.plates.flatMap((slug) => articleBySlug(slug) ?? [])
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <HomeHero />

      <Section surface="paper-2" id="principle" labelledBy="principle-title">
        <h2 id="principle-title" className="sr-only">
          {principle.lead}
        </h2>
        <ScrubText
          className="max-w-[24ch] font-display text-display-l"
          lead={principle.lead}
          rest={principle.rest}
        />
        <section
          aria-label={principle.figureLabel}
          // biome-ignore lint/a11y/noNoninteractiveTabindex: a horizontally scrollable region must be keyboard-focusable (WCAG 2.1.1; axe scrollable-region-focusable).
          tabIndex={0}
          className="mt-16 overflow-x-auto focus-visible:outline-2 focus-visible:outline-surface-accent lg:mt-24"
        >
          <PrincipleFigure />
        </section>
        <p className="mt-6 font-mono text-label text-surface-subtle">{principle.caption}</p>
      </Section>

      <HowItWorks how={how} />

      <Section surface="paper" id="evidence" labelledBy="evidence-title">
        <Grid className="gap-y-8">
          <div className="col-span-12 lg:col-span-6">
            <SplitReveal>
              <Heading level={2} size="display-m" id="evidence-title">
                {evidence.title}
              </Heading>
            </SplitReveal>
          </div>
          <p className="col-span-12 max-w-text text-lede text-surface-muted lg:col-span-5 lg:col-start-8 lg:self-end">
            {evidence.text}
          </p>
        </Grid>
        <Reveal
          stagger={0.07}
          className="mt-16 grid gap-px border-y border-surface-rule bg-surface-rule md:grid-cols-3"
        >
          {evidence.ledger.map((o) => (
            <article key={o} className="flex flex-col gap-4 bg-surface py-8 md:px-6 md:first:pl-0 lg:py-10">
              <OutcomeGlyph outcome={o} className="h-12 w-44" />
              <h3 className="mt-4 text-title">{OUTCOMES[o].label}</h3>
              <p className="text-small text-surface-muted">{OUTCOMES[o].meaning}</p>
            </article>
          ))}
        </Reveal>
        <p className="mt-8 max-w-text text-small text-surface-muted">{evidence.sealCaption}</p>
      </Section>

      <Section surface="paper-2" id="research-question" labelledBy="compounding-title">
        <Grid className="gap-y-6">
          <div className="col-span-12 lg:col-span-7">
            <SplitReveal>
              <Heading level={2} size="display-m" id="compounding-title">
                {compounding.title}
              </Heading>
            </SplitReveal>
          </div>
          <p className="col-span-12 max-w-text text-lede text-surface-muted lg:col-span-5 lg:col-start-8 lg:self-end">
            {compounding.text}
          </p>
        </Grid>
        <Reveal stagger={0.08} className="mt-16 grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {compounding.items.map((item) => (
            <div key={item.name} className="border-t border-surface-fg pt-5">
              <Heading level={3} size="title">
                {item.name}
              </Heading>
              <p className="mt-3 text-body text-surface-muted">{item.question}</p>
            </div>
          ))}
        </Reveal>
        <p className="mt-16 max-w-text text-lede">{compounding.closing}</p>
      </Section>

      <Section surface="paper" id="research" labelledBy="research-title">
        <div className="flex flex-wrap items-baseline-last justify-between gap-x-6 gap-y-4">
          <SplitReveal className="max-w-[44rem]">
            <Heading level={2} size="display-m" id="research-title">
              {research.title}
            </Heading>
          </SplitReveal>
          <Button href={research.link.href} variant="text" arrow>
            {research.link.label}
          </Button>
        </div>
        <p className="mt-6 max-w-text text-lede text-surface-muted">{research.text}</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plates.map((a) => (
            <Plate
              key={a.slug}
              paintingId={a.plate}
              number={a.plateNumber}
              date={a.published}
              title={a.title}
              meta={a.category}
              href={articlePath(a)}
              sizes={PLATE_SIZES}
            />
          ))}
        </div>
      </Section>

      <Section surface="ink" id="current-release" labelledBy="release-title">
        <Grid className="items-center gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <p className="font-mono text-label text-surface-subtle">{release.eyebrow}</p>
            <Heading level={2} size="display-m" id="release-title" className="mt-5">
              {release.title}
            </Heading>
            <p className="mt-6 max-w-text text-lede text-surface-muted">{release.text}</p>
            <Button href={release.action.href} variant="text" arrow className="mt-8">
              {release.action.label}
            </Button>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <InstrumentWindow title="moth-inference-preview-004" tag="release" footer>
              <dl className="flex flex-col">
                {release.specs.map((r) => (
                  <div
                    key={r.label}
                    className="grid gap-1 border-b border-ink/10 py-3 last:border-b-0 sm:grid-cols-[8.5rem_1fr] sm:gap-4"
                  >
                    <dt className="text-text-3">{r.label}</dt>
                    <dd className="tabular-nums">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </InstrumentWindow>
            <p className="mt-6 font-mono text-label text-surface-subtle">{release.caveat}</p>
          </div>
        </Grid>
      </Section>

      <Section surface="paper" id="get-started" labelledBy="start-title">
        <Heading level={2} size="display-l" id="start-title" className="max-w-[14ch]">
          {getStarted.title}
        </Heading>
        <div className="mt-16 grid border-t border-surface-fg md:grid-cols-2">
          {getStarted.cards.map((c, i) => (
            <div
              key={c.title}
              className={`flex flex-col gap-4 py-10 md:pr-10 ${i > 0 ? 'border-t border-surface-rule md:border-t-0 md:border-l md:pl-10' : ''}`}
            >
              <Heading level={3} size="display-s">
                {c.title}
              </Heading>
              <p className="max-w-text text-body text-surface-muted">{c.text}</p>
              <Button href={c.action.href} size="lg" arrow className="mt-auto self-start">
                {c.action.label}
              </Button>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
