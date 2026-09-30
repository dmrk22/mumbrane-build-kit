import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

/** Max 1440 px, side padding 20 / 24 / 40 px (DESIGN §4.1). */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto w-full max-w-360 px-5 sm:px-6 lg:px-10', className)}>{children}</div>
}
