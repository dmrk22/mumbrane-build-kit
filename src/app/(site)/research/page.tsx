import { CropMarks } from '@/components/art/CropMarks'
import { LightCone } from '@/components/art/LightCone'
import { Painting } from '@/components/art/Painting'
import { Plate } from '@/components/art/Plate'
import { Container } from '@/components/layout/Container'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { CtaBand } from '@/components/sections/CtaBand'
import { Button } from '@/components/ui/Button'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { Inline } from '@/components/ui/Inline'
import { SmartLink } from '@/components/ui/SmartLink'
import { articlePath, articlesIn } from '@/content/articles'
import { painting } from '@/content/paintingsData'
import { ARTICLE_UI, RESEARCH } from '@/content/research'
import { proseDate } from '@/lib/format'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/research')

// PAGES §3.1 — surfaces: paper (hero) · paper-2 · paper · ink · paper.
export default function ResearchPage() {
  const { hero, inquiry, experiment, perspectives, cta } = RESEARCH
  const heroSeed = painting(hero.painting).seed
  const articles = articlesIn('research')
  return (
    <>
      <section data-surface="paper" aria-labelledby="research-title" className="pb-16 md:pb-24 lg:pb-32">
        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden sm:aspect-[16/9] lg:aspect-[21/9]">
            <Painting id={hero.painting} fit="cover" sizes="100vw" priority />
          </div>
          <Container className="absolute inset-x-0 bottom-6 lg:bottom-10">
            <p
              data-surface="paper"
              className="glass-card inline-flex rounded-md border px-4 py-2.5 font-mono text-label"
            >
              {hero.caption}, {ARTICLE_UI.seed.toLowerCase()} {heroSeed}
            </p>
          </Container>
        </div>
        <Container className="pt-12 lg:pt-16">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 id="research-title" className="mt-4 max-w-[18ch] font-display text-display-l">
            <Inline text={hero.title} />
          </h1>
          <Grid className="mt-10 gap-y-6">
            {hero.abstract.map((p) => (
              <p key={p} className="col-span-12 text-lede lg:col-span-6">
                {p}
              </p>
            ))}
          </Grid>
        </Container>
      </section>

      <Section surface="paper-2" id="lines-of-inquiry" labelledBy="inquiry-title">
        <Eyebrow>{inquiry.eyebrow}</Eyebrow>
        <Heading level={2} size="display-m" id="inquiry-title" className="mt-4">
          {inquiry.title}
        </Heading>
        <Reveal stagger={0.08} className="mt-12 grid gap-6 md:grid-cols-3">
          {inquiry.lines.map((line, i) => (
            // Subgrid rows: the plates share one height and the glosses one top, whatever their length.
            <div key={line.name} className="row-span-2 grid grid-rows-subgrid gap-4">
              <Plate
                paintingId={line.painting}
                number={i + 1}
                date={articles[0]?.published ?? '2026-09-16'}
                title={line.question}
                meta={line.name}
                sizes="(min-width: 768px) 30vw, 100vw"
              />
              <p className="px-1 text-small text-surface-muted">{line.gloss}</p>
            </div>
          ))}
        </Reveal>
        <Grid className="mt-20 items-center gap-y-10">
          <p className="col-span-12 max-w-text text-lede lg:col-span-5">{inquiry.relativity}</p>
          <figure className="col-span-12 lg:col-span-6 lg:col-start-7">
            <LightCone labels={inquiry.cone} className="text-surface-fg" />
            <figcaption className="mt-4 flex flex-col gap-1">
              <span className="font-mono text-label text-surface-subtle">{inquiry.figure}</span>
              <span className="text-caption text-surface-muted">{inquiry.figureCaption}</span>
            </figcaption>
          </figure>
        </Grid>
      </Section>

      <Section surface="paper" id="hypothesis-to-experiment" labelledBy="experiment-title">
        <Grid className="gap-y-6">
          <div className="col-span-12 lg:col-span-3">
            <Eyebrow>{experiment.eyebrow}</Eyebrow>
          </div>
          <div className="col-span-12 lg:col-span-8 lg:col-start-4">
            <Heading level={2} size="display-m" id="experiment-title">
              {experiment.title}
            </Heading>
            {experiment.paragraphs.map((p) => (
              <p key={p} className="mt-6 max-w-text text-body text-surface-muted">
                {p}
              </p>
            ))}
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              {experiment.links.map((l) => (
                <Button key={l.href} href={l.href} variant="text" arrow>
                  {l.label}
                </Button>
              ))}
            </div>
          </div>
        </Grid>
      </Section>

      <Section surface="ink" id="perspectives" labelledBy="perspectives-title">
        <Eyebrow>{perspectives.eyebrow}</Eyebrow>
        <Heading level={2} size="display-m" id="perspectives-title" className="sr-only">
          {perspectives.title}
        </Heading>
        <ul className="mt-10 border-t border-surface-rule">
          {articles.map((a) => (
            <li key={a.slug} className="group relative border-b border-surface-rule py-10">
              <Grid className="items-center gap-y-8">
                <div className="col-span-12 lg:col-span-5">
                  <CropMarks>
                    <Painting id={a.plate} sizes="(min-width: 1024px) 40vw, 100vw" />
                  </CropMarks>
                </div>
                <div className="col-span-12 lg:col-span-6 lg:col-start-7">
                  <p className="font-mono text-label text-surface-subtle">
                    <time dateTime={a.published}>{proseDate(a.published)}</time> · {a.category} ·{' '}
                    {a.authors.join(', ')}
                  </p>
                  <h3 className="mt-4 font-display text-display-s">
                    <SmartLink
                      href={articlePath(a)}
                      className="decoration-1 underline-offset-[0.18em] group-hover:underline after:absolute after:inset-0"
                    >
                      {a.title}
                    </SmartLink>
                  </h3>
                  <p className="mt-4 max-w-text text-body text-surface-muted">{a.description}</p>
                </div>
              </Grid>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand surface="paper" id="talk-to-the-lab" titleId="cta-title" title={cta.title} text={cta.text}>
        <Button href={cta.action.href} arrow>
          {cta.action.label}
        </Button>
      </CtaBand>
    </>
  )
}
