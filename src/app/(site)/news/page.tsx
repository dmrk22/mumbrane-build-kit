import { CropMarks } from '@/components/art/CropMarks'
import { Painting } from '@/components/art/Painting'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { NewsList } from '@/components/sections/NewsList'
import { Button } from '@/components/ui/Button'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { ARTICLES, articlePath, articlesIn } from '@/content/articles'
import { NEWS } from '@/content/research'
import { proseDate } from '@/lib/format'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/news')

// PAGES §4.1 — surfaces: paper · paper-2. The list includes the research perspective.
export default function NewsPage() {
  const [featured] = articlesIn('news')
  const all = [...ARTICLES].sort((a, b) => b.published.localeCompare(a.published))
  return (
    <>
      <Section surface="paper" labelledBy="news-title" className="pt-10 lg:pt-16">
        <Eyebrow>{NEWS.hero.eyebrow}</Eyebrow>
        <h1 id="news-title" className="mt-4 font-display text-display-l">
          {NEWS.hero.title}
        </h1>
        <p className="mt-6 max-w-text text-lede text-surface-muted">{NEWS.hero.lede}</p>

        {featured && (
          <article aria-labelledby="featured-title" className="group relative mt-14">
            <Grid className="items-center gap-y-8">
              <div className="col-span-12 lg:col-span-7">
                <CropMarks>
                  <Painting id={featured.plate} sizes="(min-width: 1024px) 55vw, 100vw" priority />
                </CropMarks>
              </div>
              <div className="col-span-12 lg:col-span-4 lg:col-start-9">
                <p className="font-mono text-label text-surface-subtle">
                  {NEWS.featured} · <time dateTime={featured.published}>{proseDate(featured.published)}</time>{' '}
                  · {featured.category}
                </p>
                <Heading level={2} size="display-m" id="featured-title" className="mt-4">
                  {featured.title}
                </Heading>
                <p className="mt-5 text-body text-surface-muted">{featured.description}</p>
                <Button href={articlePath(featured)} arrow className="mt-8">
                  {NEWS.read}
                </Button>
              </div>
            </Grid>
          </article>
        )}
      </Section>

      <Section surface="paper-2" labelledBy="all-posts-title">
        <Heading level={2} size="display-s" id="all-posts-title">
          {NEWS.all}
        </Heading>
        <NewsList articles={all} className="mt-8" />
      </Section>
    </>
  )
}
