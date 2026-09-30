import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

/** 12 columns; gutter 16 px, 24 px from 1024 (DESIGN §4.1). Children place themselves with col-span-*. */
export function Grid({
  as: Tag = 'div',
  className,
  children,
}: {
  as?: 'div' | 'ul' | 'ol' | 'dl'
  className?: string
  children: ReactNode
}) {
  return <Tag className={cx('grid grid-cols-12 gap-x-4 lg:gap-x-6', className)}>{children}</Tag>
}
