import { EvidenceSeal } from '@/components/art/EvidenceSeal'
import { Guilloche } from '@/components/art/Guilloche'
import { Plate } from '@/components/art/Plate'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { ScrubText } from '@/components/motion/ScrubText'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { HomeHero } from '@/components/sections/HomeHero'
import { MothDemo } from '@/components/sections/MothDemo'
import { NewsList } from '@/components/sections/NewsList'
import { OutcomeLedger } from '@/components/sections/OutcomeLedger'
import { SpecTable } from '@/components/sections/SpecTable'
import { Button } from '@/components/ui/Button'
import { StatusChip } from '@/components/ui/Chip'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { Inline } from '@/components/ui/Inline'
import { articleBySlug, articlePath, articlesIn } from '@/content/articles'
import { HOME } from '@/content/home'
import { JsonLd } from '@/lib/security/json-ld'
import { homeJsonLd, routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/')

const PLATE_SIZES = '(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw'

// PAGES §1 — surfaces: ultramarine · paper · ink · paper · paper-2 · paper · ink · paper · cadmium.
export default function Home() {
  const { principle, evidence, compounding, research, release, news, getStarted } = HOME
  const plates = research.plates.flatMap((slug) => articleBySlug(slug) ?? [])
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <HomeHero />

      <Section surface="paper" id="principle" labelledBy="principle-label">
        <Grid className="gap-y-6">
          <div className="col-span-12 lg:col-span-3">
            <Eyebrow>
              <span id="principle-label">{principle.eyebrow}</span>
            </Eyebrow>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <ScrubText
              className="max-w-[26ch] font-serif text-display-m"
              lead={principle.lead}
              rest={principle.rest}
            />
            <Reveal stagger={0.06} className="mt-10 flex flex-wrap gap-2">
              {principle.chips.map((o) => (
                <StatusChip key={o} outcome={o} />
              ))}
            </Reveal>
            <p className="mt-6 max-w-[60ch] text-caption text-surface-muted">{principle.caption}</p>
          </div>
        </Grid>
      </Section>

      <MothDemo how={HOME.how} />

      <Section surface="paper" id="evidence" labelledBy="evidence-title">
        <Grid className="gap-y-12">
          <div className="order-2 col-span-12 lg:order-1 lg:col-span-7">
            <Eyebrow>{evidence.eyebrow}</Eyebrow>
            <SplitReveal className="mt-4">
              <Heading level={2} size="display-m" id="evidence-title">
                {evidence.title}
              </Heading>
            </SplitReveal>
            <p className="mt-6 max-w-[60ch] text-body text-surface-muted">{evidence.text}</p>
            <OutcomeLedger outcomes={evidence.ledger} heads={evidence.ledgerHeads} className="mt-10" />
          </div>
          <figure className="order-1 col-span-12 flex flex-col items-start gap-5 lg:order-2 lg:col-span-4 lg:col-start-9 lg:items-center lg:self-center">
            <EvidenceSeal className="w-40 lg:w-55" />
            <figcaption className="max-w-[36ch] text-caption text-surface-muted lg:text-center">
              {evidence.sealCaption}
            </figcaption>
          </figure>
        </Grid>
      </Section>

      <Section
        surface="paper-2"
        id="research-question"
        labelledBy="compounding-title"
        className="relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-10 h-60 text-text-3 opacity-10"
        >
          <Guilloche kind="band" seed={5} className="size-full" />
        </div>
        <div className="relative">
          <Eyebrow>{compounding.eyebrow}</Eyebrow>
          <Grid className="mt-4 gap-y-6">
            <div className="col-span-12 lg:col-span-8">
              <SplitReveal>
                <Heading level={2} size="display-m" id="compounding-title">
                  <Inline text={compounding.title} />
                </Heading>
              </SplitReveal>
            </div>
            <p className="col-span-12 max-w-[60ch] text-body text-surface-muted lg:col-span-6">
              {compounding.text}
            </p>
          </Grid>
          <Reveal stagger={0.08} className="mt-14 grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {compounding.items.map((item, i) => (
              <div key={item.name} className="border-t border-surface-rule pt-5">
                <p className="font-mono text-label text-surface-subtle">{String(i + 1).padStart(2, '0')}</p>
                <Heading level={3} size="title" className="mt-3">
                  {item.name}
                </Heading>
                <p className="mt-2 text-small text-surface-muted">{item.question}</p>
              </div>
            ))}
          </Reveal>
          <p className="mt-14 max-w-[52ch] font-serif-italic text-lede">{compounding.closing}</p>
        </div>
      </Section>

      <Section surface="paper" id="research" labelledBy="research-title">
        {/* "All research →" sits on the heading's last baseline (PAGES §1.6). */}
        <div className="flex flex-wrap items-baseline-last justify-between gap-x-6 gap-y-4">
          <SplitReveal className="max-w-[40rem]">
            <Heading level={2} size="display-m" id="research-title">
              {research.title}
            </Heading>
          </SplitReveal>
          <Button href={research.link.href} variant="text" arrow>
            {research.link.label}
          </Button>
        </div>
        <p className="mt-6 max-w-[40rem] text-body text-surface-muted">{research.text}</p>
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
        <Grid className="gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <Eyebrow>{release.eyebrow}</Eyebrow>
            <Heading level={2} size="display-m" id="release-title" className="mt-4">
              {release.title}
            </Heading>
            <p className="mt-6 max-w-[48ch] text-lede text-surface-muted">{release.text}</p>
            <Button href={release.action.href} variant="text" arrow className="mt-8">
              {release.action.label}
            </Button>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <SpecTable rows={release.specs} />
            <p className="mt-5 text-caption text-surface-muted">{release.caveat}</p>
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

      <Section surface="cadmium" id="get-started" labelledBy="start-title">
        <Heading level={2} size="display-m" id="start-title">
          {getStarted.title}
        </Heading>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {getStarted.cards.map((c) => (
            <div key={c.title} data-surface="paper" className="flex flex-col gap-4 border border-ink p-8">
              <Heading level={3} size="title">
                {c.title}
              </Heading>
              <p className="max-w-[48ch] text-body text-surface-muted">{c.text}</p>
              <Button href={c.action.href} variant="text" arrow className="mt-auto self-start pt-4">
                {c.action.label}
              </Button>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
