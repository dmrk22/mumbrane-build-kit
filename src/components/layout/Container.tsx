import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

/** The page frame (`--container-site`, D-144): centred, no padding, so its box is the content. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto w-full max-w-site', className)}>{children}</div>
}
