import type { Route } from 'next'
import { Section } from '@/components/layout/Section'
import { FilterChip, StatusChip, Tag } from '@/components/ui/Chip'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { USE_CASES, type UseCase } from '@/content/solutions'
import { cx } from '@/lib/cx'
import { parseUseCaseFilter, USE_CASE_FILTERS, type UseCaseFilter } from '@/lib/security/params'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/solutions/use-cases')

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const PATH = '/solutions/use-cases'
const hrefFor = (f: UseCaseFilter) => (f === 'all' ? PATH : `${PATH}?domain=${f}`) as Route

function Card({ item, badge, noExample }: { item: UseCase; badge: string; noExample: string }) {
  return (
    <li className="flex flex-col gap-5 rounded-md border border-surface-rule bg-surface p-6">
      <Tag className="self-start">{badge}</Tag>
      <h3 className="font-display text-display-s">{item.name}</h3>
      <p className="text-lede">{item.definition}</p>
      {item.example ? (
        <div className="mt-auto flex flex-col gap-3 border-t border-dashed border-surface-rule pt-4">
          <p className="font-mono text-code text-surface-muted">{item.example.question}</p>
          <StatusChip outcome={item.example.outcome} className="self-start" />
        </div>
      ) : (
        <p className="mt-auto border-t border-dashed border-surface-rule pt-4 text-small text-surface-muted">
          {noExample}
        </p>
      )}
    </li>
  )
}

// PAGES §9.2 — surfaces: paper · paper-2. The filter is URL state (`?domain=`), parsed with Zod;
// unknown values fall back to "all". Plain links, so it works without JavaScript.
export default async function UseCasesPage({ searchParams }: Props) {
  const filter = parseUseCaseFilter((await searchParams).domain)
  const keep = (u: UseCase) => filter === 'all' || u.domain === filter
  const delivered = USE_CASES.delivered.items.filter(keep)
  const sketches = USE_CASES.sketches.items.filter(keep)
  const groups = [
    { id: 'delivered', group: USE_CASES.delivered, items: delivered },
    { id: 'sketches', group: USE_CASES.sketches, items: sketches },
  ].filter((g) => g.items.length > 0)

  return (
    <>
      <Section
        surface="paper"
        labelledBy="use-cases-title"
        className="pt-12 md:pt-16 lg:pt-24"
        rhythm="compact"
      >
        <Eyebrow>{USE_CASES.eyebrow}</Eyebrow>
        <h1 id="use-cases-title" className="mt-4 font-display text-display-l">
          {USE_CASES.title}
        </h1>
        <p className="mt-6 max-w-text text-lede text-surface-muted">{USE_CASES.lede}</p>
        <nav aria-label={USE_CASES.filterLabel} className="mt-10">
          <ul className="flex flex-wrap gap-2">
            {USE_CASE_FILTERS.map((f) => (
              <li key={f}>
                <FilterChip href={hrefFor(f)} current={f === filter}>
                  {USE_CASES.filters[f]}
                </FilterChip>
              </li>
            ))}
          </ul>
        </nav>
      </Section>

      <Section surface="paper-2" id="worlds" labelledBy="worlds-count" rhythm="compact">
        <p id="worlds-count" role="status" className="font-mono text-label text-surface-subtle">
          {groups.length > 0 ? USE_CASES.showing(delivered.length + sketches.length) : USE_CASES.empty}
        </p>
        {groups.map(({ id, group, items }) => (
          <div key={id} className="mt-10">
            <Heading level={2} size="display-s" id={`${id}-title`}>
              {group.title}
            </Heading>
            <ul
              className={cx(
                'mt-6 grid gap-4 md:grid-cols-2',
                items.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
              )}
            >
              {items.map((item) => (
                <Card
                  key={item.name}
                  item={item}
                  badge={group.badge}
                  noExample={USE_CASES.delivered.noExample}
                />
              ))}
            </ul>
          </div>
        ))}
      </Section>
    </>
  )
}
