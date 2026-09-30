import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

/** Tabular lining figures for meta, tables and instruments (DESIGN §3.4). */
export function Numeral({ className, children }: { className?: string; children: ReactNode }) {
  return <span className={cx('tabular-nums lining-nums', className)}>{children}</span>
}
