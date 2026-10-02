import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

/** 12 columns; gutter 16 px on phones, anthropic.com's 28–32 px from 768 (D-145). Children use col-span-*. */
export function Grid({
  as: Tag = 'div',
  className,
  children,
}: {
  as?: 'div' | 'ul' | 'ol' | 'dl'
  className?: string
  children: ReactNode
}) {
  return <Tag className={cx('grid grid-cols-12 gap-x-4 md:gap-x-gutter', className)}>{children}</Tag>
}
