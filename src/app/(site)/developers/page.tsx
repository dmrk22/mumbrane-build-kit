import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { Pipeline } from '@/components/sections/Pipeline'
import { Button } from '@/components/ui/Button'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { Inline } from '@/components/ui/Inline'
import { Note } from '@/components/ui/Note'
import { DEVELOPERS } from '@/content/developers'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/developers')

// PAGES §10 — surfaces: paper · ink · paper · paper-2 · paper.
export default function DevelopersPage() {
  const { hero, lifecycle, results, outcomes, future, next } = DEVELOPERS
  return (
    <>
      <Section surface="paper" labelledBy="developers-title" className="pt-12 md:pt-16 lg:pt-24">
        <Eyebrow>{hero.eyebrow}</Eyebrow>
        <h1 id="developers-title" className="mt-4 max-w-[16ch] font-display text-display-l">
          <Inline text={hero.title} />
        </h1>
        <p className="mt-8 max-w-text text-lede text-surface-muted">{hero.lede}</p>
        <Note className="mt-10 max-w-2xl">{hero.status}</Note>
      </Section>

      <Section surface="ink" id="lifecycle" labelledBy="lifecycle-title">
        <Eyebrow>{lifecycle.eyebrow}</Eyebrow>
        <Heading level={2} size="display-m" id="lifecycle-title" className="mt-4 max-w-[20ch]">
          {lifecycle.title}
        </Heading>
        <Pipeline steps={lifecycle.stages} figure={lifecycle.figure} className="mt-14" />
      </Section>

      <Section surface="paper-2" id="results" labelledBy="results-title">
        <Eyebrow>{results.eyebrow}</Eyebrow>
        <Heading level={2} size="display-m" id="results-title" className="mt-4">
          {results.title}
        </Heading>
        <p className="mt-6 max-w-text text-body text-surface-muted">{results.text}</p>
        <Grid className="mt-10 items-start gap-y-6">
          <CodeBlock
            code={results.json}
            label={results.jsonLabel}
            illustrative={results.jsonTag}
            className="col-span-12 lg:col-span-7"
          />
          <figure className="col-span-12 rounded-md border border-surface-rule bg-surface lg:col-span-5">
            <figcaption className="flex h-10 items-center border-b border-surface-rule px-4 font-mono text-label text-surface-subtle">
              {results.englishLabel}
            </figcaption>
            <p className="p-5 text-lede">{results.english}</p>
          </figure>
          <CodeBlock
            code={results.questions}
            label={results.questionsLabel}
            className="col-span-12 lg:col-span-7"
          />
        </Grid>
      </Section>

      <Section surface="paper" id="outcomes" labelledBy="dev-outcomes-title">
        <Eyebrow>{outcomes.eyebrow}</Eyebrow>
        <Heading level={2} size="display-m" id="dev-outcomes-title" className="mt-4">
          {outcomes.title}
        </Heading>
        <p className="mt-6 max-w-text text-lede text-surface-muted">{outcomes.text}</p>
        <Button href={outcomes.link.href} variant="text" arrow className="mt-6">
          {outcomes.link.label}
        </Button>
        <Grid className="mt-16 gap-y-8">
          <div className="col-span-12 lg:col-span-7">
            <h3 className="font-display text-display-s">{future.title}</h3>
            <p className="mt-4 max-w-text text-body text-surface-muted">{future.text}</p>
          </div>
          <div className="col-span-12 flex flex-wrap items-end gap-x-8 gap-y-3 lg:col-span-4 lg:col-start-9 lg:justify-end">
            {next.map((l) => (
              <Button key={l.href} href={l.href} variant="text" arrow>
                {l.label}
              </Button>
            ))}
          </div>
        </Grid>
      </Section>
    </>
  )
}
