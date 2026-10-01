import { StatusChip } from '@/components/ui/Chip'
import { OUTCOMES, type Outcome } from '@/content/outcomes'
import { cx } from '@/lib/cx'
import { OutcomeGlyph } from './OutcomeGlyph'

/**
 * Outcome · what it means · what to do next, each led by its glyph. A real table; below 768 px each
 * row stacks into a card. `next` wording can be overridden per domain.
 */
export function OutcomeLedger({
  outcomes,
  heads,
  next,
  caption,
  className,
}: {
  outcomes: readonly Outcome[]
  heads: { outcome: string; meaning: string; next: string }
  next?: Partial<Record<Outcome, string>>
  caption?: string
  className?: string
}) {
  return (
    <table className={cx('w-full border-collapse text-left', className)}>
      {caption && <caption className="mb-4 text-left text-caption text-surface-muted">{caption}</caption>}
      <thead className="sr-only md:not-sr-only">
        <tr className="border-b border-surface-fg font-mono text-label text-surface-subtle">
          <th scope="col" className="py-3 pr-6 font-normal">
            {heads.outcome}
          </th>
          <th scope="col" className="py-3 pr-6 font-normal">
            {heads.meaning}
          </th>
          <th scope="col" className="py-3 font-normal">
            {heads.next}
          </th>
        </tr>
      </thead>
      <tbody>
        {outcomes.map((o) => (
          <tr key={o} className="group grid gap-3 border-b border-surface-rule py-6 md:table-row md:py-0">
            <th scope="row" className="font-normal md:w-[20rem] md:py-6 md:pr-6 md:align-top">
              <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <OutcomeGlyph outcome={o} className="shrink-0" />
                <StatusChip outcome={o} />
              </span>
            </th>
            <td className="text-body md:py-6 md:pr-6 md:align-top">{OUTCOMES[o].meaning}</td>
            <td className="text-body text-surface-muted md:py-6 md:align-top">
              {next?.[o] ?? OUTCOMES[o].next}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
