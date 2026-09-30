import { StatusChip } from '@/components/ui/Chip'
import { OUTCOMES, type Outcome } from '@/content/outcomes'
import { cx } from '@/lib/cx'

/**
 * Outcome · what it means · what to do next (DESIGN §9.7). A real table (header row in mono
 * labels); below 768 px each row stacks into a card. `next` wording can be overridden per domain.
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
        <tr className="border-b border-surface-rule font-mono text-label text-surface-subtle uppercase">
          <th scope="col" className="py-3 pr-6 font-medium">
            {heads.outcome}
          </th>
          <th scope="col" className="py-3 pr-6 font-medium">
            {heads.meaning}
          </th>
          <th scope="col" className="py-3 font-medium">
            {heads.next}
          </th>
        </tr>
      </thead>
      <tbody>
        {outcomes.map((o) => (
          <tr key={o} className="grid gap-2 border-b border-surface-rule py-5 md:table-row md:py-0">
            <th scope="row" className="font-normal md:w-52 md:py-5 md:pr-6 md:align-top">
              <StatusChip outcome={o} />
            </th>
            <td className="text-small md:py-5 md:pr-6 md:align-top">{OUTCOMES[o].meaning}</td>
            <td className="text-small text-surface-muted md:py-5 md:align-top">
              {next?.[o] ?? OUTCOMES[o].next}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
