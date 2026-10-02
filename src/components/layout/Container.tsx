import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

/** Max 1432 px with a fluid 32–80 px side margin (`--spacing-edge`, D-142). */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto w-full max-w-site px-edge', className)}>{children}</div>
}
