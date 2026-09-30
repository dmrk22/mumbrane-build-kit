import { cx } from '@/lib/cx'

/** Mono labels left, values right, 1 px rules between rows (PAGES §1.7). A definition list. */
export function SpecTable({
  rows,
  className,
}: {
  rows: readonly { label: string; value: string }[]
  className?: string
}) {
  return (
    <dl className={cx('border-t border-surface-rule', className)}>
      {rows.map((r) => (
        <div
          key={r.label}
          className="grid gap-1 border-b border-surface-rule py-4 sm:grid-cols-[10rem_1fr] sm:gap-6"
        >
          <dt className="font-mono text-label text-surface-subtle uppercase sm:pt-0.5">{r.label}</dt>
          <dd className="text-small tabular-nums">{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}
