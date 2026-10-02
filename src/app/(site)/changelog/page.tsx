import { Section } from '@/components/layout/Section'
import { Tag } from '@/components/ui/Chip'
import { Eyebrow } from '@/components/ui/Heading'
import { Icon } from '@/components/ui/Icon'
import { SmartLink } from '@/components/ui/SmartLink'
import { CHANGELOG } from '@/content/pricing'
import { monoDate } from '@/lib/format'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/changelog')

const monthOf = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

// PAGES §13.1 — surfaces: paper. A ledger grouped by month (the month label sticks from 1024 px);
// newest first; real dates only.
export default function ChangelogPage() {
  const months = [...new Set(CHANGELOG.entries.map((e) => monthOf(e.date)))]
  return (
    <Section surface="paper" labelledBy="changelog-title" className="pt-12 md:pt-16 lg:pt-24">
      <Eyebrow>{CHANGELOG.eyebrow}</Eyebrow>
      <h1 id="changelog-title" className="mt-4 font-display text-display-l">
        {CHANGELOG.title}
      </h1>
      <p className="mt-8 max-w-[52ch] text-lede text-surface-muted">{CHANGELOG.lede}</p>

      {months.map((month) => (
        <section
          key={month}
          aria-label={month}
          className="mt-16 grid gap-6 border-t border-surface-rule pt-6 lg:grid-cols-12"
        >
          <h2 className="font-mono text-label text-surface-subtle lg:col-span-3">
            <span className="lg:sticky lg:top-28">{month}</span>
          </h2>
          <ol className="flex flex-col lg:col-span-9">
            {CHANGELOG.entries
              .filter((e) => monthOf(e.date) === month)
              .map((e) => (
                <li
                  key={`${e.date}-${e.title}`}
                  className="grid gap-3 border-b border-surface-rule py-6 first:pt-0 md:grid-cols-[8rem_1fr] md:gap-6"
                >
                  <time dateTime={e.date} className="font-mono text-label text-surface-subtle tabular-nums">
                    {monoDate(e.date)}
                  </time>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-title">{e.title}</h3>
                    <ul className="flex flex-wrap gap-2">
                      {e.tags.map((t) => (
                        <li key={t}>
                          <Tag>{t}</Tag>
                        </li>
                      ))}
                    </ul>
                    <p className="max-w-[60ch] text-body text-surface-muted">{e.text}</p>
                    <SmartLink
                      href={e.href}
                      className="inline-flex items-center gap-2 self-start text-small font-medium"
                    >
                      <span className="underline decoration-1 underline-offset-[0.22em]">
                        {CHANGELOG.read}
                      </span>
                      <Icon name="arrow-right" className="size-4" />
                      <span className="sr-only">: {e.title}</span>
                    </SmartLink>
                  </div>
                </li>
              ))}
          </ol>
        </section>
      ))}
    </Section>
  )
}
