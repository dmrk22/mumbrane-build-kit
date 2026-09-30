import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

export function Kbd({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <kbd
      className={cx(
        'inline-flex h-6 min-w-6 items-center justify-center rounded-xs border border-surface-rule bg-surface-raise px-1.5 font-mono text-label text-surface-muted',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
