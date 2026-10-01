import { CropMarks } from '@/components/art/CropMarks'
import { Painting } from '@/components/art/Painting'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { NewsList } from '@/components/sections/NewsList'
import { Blocks } from '@/components/ui/Blocks'
import { Chip } from '@/components/ui/Chip'
import { CopyButton } from '@/components/ui/CopyButton'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { Prose } from '@/components/ui/Prose'
import { SmartLink } from '@/components/ui/SmartLink'
import { TitleText } from '@/components/ui/TitleText'
import { articleBody, readingMinutes } from '@/content/articleDocs'
import { type Article as ArticleMeta, articlePath } from '@/content/articles'
import { painting } from '@/content/paintingsData'
import { ARTICLE_UI } from '@/content/research'
import { publicEnv } from '@/lib/env'
import { proseDate, roman } from '@/lib/format'

/**
 * The shared article template (PAGES §3.2): header, framed plate, prose from typed blocks, a
 * sticky contents list from 1280 px when there are ≥ 3 sections, cite block, markdown alternate,
 * related posts.
 */
export function Article({ article, related }: { article: ArticleMeta; related: readonly ArticleMeta[] }) {
  const blocks = articleBody(article.slug)
  const toc = blocks.flatMap((b) => (b.type === 'h2' ? [{ id: b.id, text: b.text }] : []))
  const path = articlePath(article)
  const url = new URL(path, publicEnv.siteUrl).href
  const cite = `${article.authors.join(', ')}. “${article.title}.” Mumbrane, ${proseDate(article.published)}. ${url}`
  const p = painting(article.plate)
  const sectionName = article.section === 'research' ? ARTICLE_UI.research : ARTICLE_UI.news
  return (
    <article>
      <Section surface="paper" labelledBy="article-title" className="pt-10 lg:pt-16" rhythm="compact">
        <Grid>
          <div className="col-span-12 lg:col-span-8 lg:col-start-3">
            <Eyebrow>
              {sectionName} · {article.category}
            </Eyebrow>
            <Heading level={1} size="display-l" id="article-title" className="mt-4">
              <TitleText text={article.title} />
            </Heading>
            <p className="mt-6 max-w-[48ch] font-serif text-lede text-surface-muted">{article.description}</p>
            <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-surface-rule pt-5 font-mono text-label">
              <div className="flex gap-2">
                <dt className="text-surface-subtle">{ARTICLE_UI.published}</dt>
                <dd>
                  <time dateTime={article.published}>{proseDate(article.published)}</time>
                </dd>
              </div>
              {'updated' in article && (
                <div className="flex gap-2">
                  <dt className="text-surface-subtle">{ARTICLE_UI.updated}</dt>
                  <dd>
                    <time dateTime={article.updated}>{proseDate(article.updated)}</time>
                  </dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="text-surface-subtle">{ARTICLE_UI.by}</dt>
                <dd>{article.authors.join(', ')}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="sr-only">{ARTICLE_UI.readingTime}</dt>
                <dd>{ARTICLE_UI.minutes(readingMinutes(article))}</dd>
              </div>
            </dl>
            {article.tags.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {article.tags.map((t) => (
                  <li key={t}>
                    <Chip>{t}</Chip>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <figure className="col-span-12 mt-12 lg:col-span-10 lg:col-start-2">
            <CropMarks>
              <Painting id={article.plate} sizes="(min-width: 1024px) 80vw, 100vw" priority />
            </CropMarks>
            <figcaption className="mt-4 font-mono text-label text-surface-subtle">
              Plate {roman(article.plateNumber)} — {ARTICLE_UI.oilOnCode} · {ARTICLE_UI.seed} {p.seed}
            </figcaption>
          </figure>
        </Grid>
      </Section>

      <Section surface="paper" rhythm="compact" className="pt-0 md:pt-0 lg:pt-0">
        <Grid>
          {toc.length >= 3 && (
            <nav aria-label={ARTICLE_UI.contents} className="col-span-2 hidden xl:block print:hidden">
              <div className="sticky top-28">
                <p className="font-mono text-label text-surface-subtle">{ARTICLE_UI.contents}</p>
                <ol className="mt-4 flex flex-col gap-3 text-small">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <SmartLink href={`#${t.id}`} className="text-surface-muted hover:text-surface-fg">
                        {t.text}
                      </SmartLink>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>
          )}
          <Prose className="col-span-12 lg:col-span-8 lg:col-start-3">
            <Blocks blocks={blocks} />
          </Prose>
        </Grid>
      </Section>

      <Section surface="paper-2" rhythm="compact" labelledBy="cite-label">
        <Grid className="gap-y-10">
          <div className="col-span-12 lg:col-span-8 lg:col-start-3">
            <div className="flex items-center justify-between gap-4">
              <p id="cite-label" className="font-mono text-label text-surface-subtle">
                {ARTICLE_UI.citeAs}
              </p>
              <CopyButton text={cite} label={ARTICLE_UI.copyCitation} />
            </div>
            <p className="mt-3 font-serif text-body break-words">{cite}</p>
            {/* A route handler, not a page: a plain link, so the browser loads the markdown directly. */}
            <a href={`/md${path}`} className="link-prose mt-6 inline-block text-small">
              {ARTICLE_UI.markdown}
            </a>
          </div>
          {related.length > 0 && (
            <div className="col-span-12 lg:col-span-8 lg:col-start-3">
              <h2 className="font-mono text-label text-surface-subtle">{ARTICLE_UI.related}</h2>
              <NewsList articles={related} className="mt-4" />
            </div>
          )}
        </Grid>
      </Section>
    </article>
  )
}
