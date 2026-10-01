import { StatusChip } from '@/components/ui/Chip'
import { Formula } from '@/components/ui/Inline'
import { OUTCOMES, type Outcome } from '@/content/outcomes'
import { cx } from '@/lib/cx'

/**
 * Outcome · what it means · what to do next, each led by its judgement in logic notation (Γ ⊢ φ,
 * Γ ⊬ φ, Γ ⊢ ⊥ …). A real table; below 768 px each row stacks into a card. `next` wording can be
 * overridden per domain.
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
        <tr className="border-b border-surface-fg font-serif-italic text-small text-surface-subtle">
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
            <th scope="row" className="font-normal md:w-[19rem] md:py-6 md:pr-6 md:align-top">
              <span className="flex items-baseline gap-4">
                <span
                  aria-hidden="true"
                  className="min-w-[5.5ch] font-serif text-display-s whitespace-nowrap text-surface-fg transition-colors duration-(--duration-hover) group-hover:text-surface-accent"
                >
                  <Formula text={OUTCOMES[o].symbol} />
                </span>
                <StatusChip outcome={o} />
              </span>
            </th>
            <td className="font-serif text-body md:py-6 md:pr-6 md:align-top">{OUTCOMES[o].meaning}</td>
            <td className="font-serif text-body text-surface-muted md:py-6 md:align-top">
              {next?.[o] ?? OUTCOMES[o].next}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
