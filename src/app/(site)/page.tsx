import { Plate } from '@/components/art/Plate'
import { StringModel } from '@/components/art/StringModel'
import { InstrumentWindow } from '@/components/instrument/InstrumentWindow'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { HomeHero } from '@/components/sections/HomeHero'
import { NewsList } from '@/components/sections/NewsList'
import { OutcomeLedger } from '@/components/sections/OutcomeLedger'
import { ProofSheet } from '@/components/sections/ProofSheet'
import { Turnstile } from '@/components/sections/Turnstile'
import { Button } from '@/components/ui/Button'
import { Heading, TheoremLabel } from '@/components/ui/Heading'
import { Inline, Qed } from '@/components/ui/Inline'
import { articleBySlug, articlePath, articlesIn } from '@/content/articles'
import { HOME } from '@/content/home'
import { JsonLd } from '@/lib/security/json-ld'
import { homeJsonLd, routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/')

const PLATE_SIZES = '(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw'

// Set like a paper: Definition 1, Example 2, Theorem 3, Conjecture 4.
// Surfaces: deep · paper · ink · paper · paper-2 · paper · deep · paper · sulfur.
export default function Home() {
  const { how, evidence, compounding, research, release, news, getStarted } = HOME
  const plates = research.plates.flatMap((slug) => articleBySlug(slug) ?? [])
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <HomeHero />
      <Turnstile />
      <ProofSheet how={how} />

      <Section surface="paper" id="evidence" labelledBy="evidence-title">
        <Grid className="gap-y-8">
          <div className="col-span-12 lg:col-span-5">
            <TheoremLabel kind={evidence.kind} />
            <SplitReveal className="mt-4">
              <Heading level={2} size="display-m" id="evidence-title">
                {evidence.title}
              </Heading>
            </SplitReveal>
          </div>
          <p className="col-span-12 max-w-[52ch] font-serif text-lede text-surface-muted lg:col-span-6 lg:col-start-7 lg:self-end">
            {evidence.text}
          </p>
        </Grid>
        <Reveal stagger={0.06} className="mt-14">
          <OutcomeLedger outcomes={evidence.ledger} heads={evidence.ledgerHeads} />
        </Reveal>
        <p className="mt-8 max-w-[62ch] font-serif text-body text-surface-muted">
          <span className="font-serif-italic text-surface-fg">Remark.</span> {evidence.sealCaption}
        </p>
      </Section>

      <Section
        surface="paper-2"
        id="research-question"
        labelledBy="compounding-title"
        className="relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-40 hidden w-[44rem] text-text-3 opacity-25 lg:block"
        >
          <StringModel theta={0.12 * Math.PI} strings={56} yaw={1.1} className="h-auto w-full" />
        </div>
        <div className="relative">
          <TheoremLabel kind={compounding.kind} />
          <Grid className="mt-4 gap-y-6">
            <div className="col-span-12 lg:col-span-8">
              <SplitReveal>
                <Heading level={2} size="display-m" id="compounding-title">
                  <Inline text={compounding.title} />
                </Heading>
              </SplitReveal>
            </div>
            <p className="col-span-12 max-w-[56ch] font-serif text-lede text-surface-muted lg:col-span-6">
              {compounding.text}
            </p>
          </Grid>
          <Reveal stagger={0.08} className="mt-14 grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {compounding.items.map((item, i) => (
              <div key={item.name} className="border-t border-surface-fg pt-5">
                <p className="font-serif-italic text-small text-surface-subtle">Problem {i + 1}.</p>
                <Heading level={3} size="title" className="mt-2">
                  {item.name}
                </Heading>
                <p className="mt-2 font-serif text-body text-surface-muted">{item.question}</p>
              </div>
            ))}
          </Reveal>
          <p className="mt-14 max-w-[52ch] font-serif-italic text-lede">{compounding.closing}</p>
        </div>
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
        <p className="mt-6 max-w-[44rem] font-serif text-lede text-surface-muted">{research.text}</p>
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

      <Section surface="deep" id="current-release" labelledBy="release-title" className="overflow-hidden">
        <Grid className="items-center gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <p className="font-serif-italic text-small text-surface-subtle">{release.eyebrow}</p>
            <Heading level={2} size="display-m" id="release-title" className="mt-4">
              {release.title}
            </Heading>
            <p className="mt-6 max-w-[44ch] font-serif text-lede text-surface-muted">{release.text}</p>
            <Button href={release.action.href} variant="text" arrow className="mt-8">
              {release.action.label}
            </Button>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <InstrumentWindow title="moth-inference-preview-004" tag="Release" footer>
              <dl className="flex flex-col">
                {release.specs.map((r) => (
                  <div
                    key={r.label}
                    className="grid gap-1 border-b border-ink/15 py-3 last:border-b-0 sm:grid-cols-[8.5rem_1fr] sm:gap-4"
                  >
                    <dt>
                      <mark className="cli-chip">{r.label}</mark>
                    </dt>
                    <dd className="tabular-nums">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </InstrumentWindow>
            <p className="mt-6 font-serif-italic text-caption text-surface-muted">{release.caveat}</p>
          </div>
        </Grid>
      </Section>

      <Section surface="paper" id="news" labelledBy="news-title">
        <div className="flex items-baseline-last justify-between gap-6">
          <Heading level={2} size="display-m" id="news-title">
            {news.title}
          </Heading>
          <Button href={news.link.href} variant="text" arrow>
            {news.link.label}
          </Button>
        </div>
        <Reveal stagger={0.05}>
          <NewsList articles={articlesIn('news')} className="mt-10" />
        </Reveal>
      </Section>

      <Section
        surface="sulfur"
        id="get-started"
        labelledBy="start-title"
        className="relative overflow-hidden"
      >
        <Heading level={2} size="display-l" id="start-title" className="max-w-[14ch]">
          {getStarted.title}
        </Heading>
        <div className="mt-14 grid gap-px border border-ink bg-ink md:grid-cols-2">
          {getStarted.cards.map((c) => (
            <div key={c.title} data-surface="sulfur" className="flex flex-col gap-4 p-8 lg:p-10">
              <Heading level={3} size="display-s">
                {c.title}
              </Heading>
              <p className="max-w-[44ch] font-serif text-lede text-surface-fg">{c.text}</p>
              <Button href={c.action.href} variant="ink" size="lg" arrow className="mt-auto self-start">
                {c.action.label}
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-10 text-right text-display-s">
          <Qed />
        </p>
      </Section>
    </>
  )
}
