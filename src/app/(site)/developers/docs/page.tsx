import { Container } from '@/components/layout/Container'
import { LanguageContract, LimitsGrid } from '@/components/sections/LanguageContract'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { DocsToc } from '@/components/ui/DocsToc'
import { AnchorHeading, Eyebrow } from '@/components/ui/Heading'
import { Icon } from '@/components/ui/Icon'
import { Inline } from '@/components/ui/Inline'
import { CONCEPTS, DOCS } from '@/content/developers'
import { proseDate } from '@/lib/format'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/developers/docs')

// PAGES §11.1–§11.2 — surfaces: paper. Sticky contents ≥ 1024 px, a "Contents" disclosure below.
export default function DocsPage() {
  const toc = [...DOCS.sections, DOCS.glossary].map((s) => ({ id: s.id, title: s.title }))
  return (
    <section
      data-surface="paper"
      aria-labelledby="docs-title"
      className="pt-12 pb-16 md:pt-16 md:pb-24 lg:pt-24 lg:pb-32"
    >
      <Container>
        <div className="grid grid-cols-12 gap-x-4 md:gap-x-gutter">
          <aside className="col-span-3 hidden lg:block">
            <div className="sticky top-28">
              <DocsToc label={DOCS.contents} items={toc} />
            </div>
          </aside>

          <div className="col-span-12 lg:col-span-8 lg:col-start-4">
            <Eyebrow>{DOCS.eyebrow}</Eyebrow>
            <h1 id="docs-title" className="mt-4 font-display text-display-l">
              {DOCS.title}
            </h1>
            <p className="mt-6 max-w-text text-lede text-surface-muted">{DOCS.lede}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-surface-rule bg-surface-raise p-5 text-small">
              <Icon name="book" className="size-5 shrink-0 text-surface-muted" />
              <span>{DOCS.delivery.text}</span>
              {DOCS.delivery.files.map((f) => (
                <code key={f} className="bg-surface px-1.5 py-0.5 font-mono text-code">
                  {f}
                </code>
              ))}
            </div>
            <p className="mt-4 font-mono text-label text-surface-subtle">
              {DOCS.reviewed.label} <time dateTime={DOCS.reviewed.date}>{proseDate(DOCS.reviewed.date)}</time>
            </p>

            <details className="mt-10 border-y border-surface-rule py-4 lg:hidden">
              <summary className="cursor-pointer font-mono text-label">{DOCS.contents}</summary>
              <ol className="mt-4 flex flex-col gap-2 text-small">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="link-prose">
                      {t.title}
                    </a>
                  </li>
                ))}
              </ol>
            </details>

            {DOCS.sections.map((s) => (
              <div key={s.id} className="mt-16 border-t border-surface-rule pt-10">
                <AnchorHeading id={s.id} label={DOCS.anchor(s.title)}>
                  {s.title}
                </AnchorHeading>
                <div className="mt-6 flex flex-col gap-6">
                  {s.paragraphs.map((p) => (
                    <p key={p} className="max-w-text text-body">
                      <Inline text={p} />
                    </p>
                  ))}
                  {s.code && <CodeBlock code={s.code.text} label={s.code.label} />}
                  {s.id === 'language-contract' && <LanguageContract limits={false} />}
                  {s.id === 'limits' && <LimitsGrid />}
                </div>
              </div>
            ))}

            <div className="mt-16 border-t border-surface-rule pt-10">
              <AnchorHeading id={DOCS.glossary.id} label={DOCS.anchor(DOCS.glossary.title)}>
                {DOCS.glossary.title}
              </AnchorHeading>
              <dl className="mt-6 divide-y divide-surface-rule border-y border-surface-rule">
                {CONCEPTS.map((c) => (
                  <div key={c.term} className="grid gap-2 py-4 md:grid-cols-[12rem_1fr] md:gap-6">
                    <dt className="font-medium">{c.term}</dt>
                    <dd className="text-surface-muted">{c.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
