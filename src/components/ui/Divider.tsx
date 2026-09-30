import { cx } from '@/lib/cx'

/** 1 px hairline; `ticks` adds 4 px instrument ticks dividing it into eighths (DESIGN §5). */
export function Divider({ ticks = false, className }: { ticks?: boolean; className?: string }) {
  if (!ticks) return <hr className={cx('border-0 border-t border-surface-rule', className)} />
  return (
    <div className={className}>
      <hr className="border-0 border-t border-surface-rule" />
      <div aria-hidden="true" className="grid h-1 grid-cols-8 border-x border-surface-rule">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <span key={i} className="border-r border-surface-rule" />
        ))}
      </div>
    </div>
  )
}
