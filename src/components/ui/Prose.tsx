import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

/** Article typography for rendered blocks (DESIGN §9.11); styles live in globals.css `.prose-article`. */
export function Prose({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('prose-article', className)}>{children}</div>
}
