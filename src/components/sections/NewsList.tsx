import { Icon } from '@/components/ui/Icon'
import { SmartLink } from '@/components/ui/SmartLink'
import { type Article, articlePath } from '@/content/articles'
import { cx } from '@/lib/cx'
import { monoDate } from '@/lib/format'

/** Ledger rows: date · category · serif title · arrow (DESIGN §9.8). The whole row is the link. */
export function NewsList({
  articles,
  headingLevel = 3,
  className,
}: {
  articles: readonly Article[]
  headingLevel?: 2 | 3
  className?: string
}) {
  const H = `h${headingLevel}` as const
  return (
    <ul className={cx('border-t border-surface-rule', className)}>
      {articles.map((a) => (
        <li key={a.slug} className="group relative border-b border-surface-rule">
          <div className="grid gap-2 py-6 md:grid-cols-[8rem_12rem_1fr_auto] md:items-baseline md:gap-6">
            <time dateTime={a.published} className="font-mono text-label text-surface-subtle tabular-nums">
              {monoDate(a.published)}
            </time>
            <p className="font-mono text-label text-surface-subtle uppercase">{a.category}</p>
            <H className="font-serif text-display-s">
              <SmartLink
                href={articlePath(a)}
                className="decoration-1 underline-offset-[0.18em] group-hover:underline after:absolute after:inset-0"
              >
                {a.title}
              </SmartLink>
            </H>
            <Icon
              name="arrow-right"
              className="hidden transition-transform duration-(--duration-hover) ease-out group-hover:translate-x-1 md:block"
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
