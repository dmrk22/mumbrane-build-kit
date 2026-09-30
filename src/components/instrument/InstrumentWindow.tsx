import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

/**
 * The typesafe-style instrument window (DESIGN §9.6): a 28 px paper title bar with a mono
 * filename, an optional tag chip and three outline squares; a code body on ink-2 (dark surfaces)
 * or paper; an optional DotScreen footer strip. Square, 1 px rule, `shadow-window`. Show real
 * content only, at most two per viewport.
 */
export function InstrumentWindow({
  title,
  tag,
  footer = false,
  className,
  children,
}: {
  title: string
  tag?: string
  footer?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <figure className={cx('instrument-window border border-surface-rule shadow-window', className)}>
      <figcaption
        data-surface="paper"
        className="flex h-7 items-center gap-3 border-b border-ink px-3 font-mono text-label"
      >
        <span className="truncate">{title}</span>
        {tag && (
          <span data-surface="ink" className="shrink-0 px-1.5 py-px text-label uppercase">
            {tag}
          </span>
        )}
        <span aria-hidden="true" className="ml-auto flex gap-1.5">
          <span className="size-2 border border-ink" />
          <span className="size-2 border border-ink" />
          <span className="size-2 border border-ink" />
        </span>
      </figcaption>
      <div className="instrument-body p-5 font-mono text-code">{children}</div>
      {footer && <div aria-hidden="true" className="dot-screen h-6 border-t border-surface-rule" />}
    </figure>
  )
}

/** Two windows, the second offset 24 px down and right, overlapping the first's lower corner. */
export function InstrumentStack({
  className,
  children,
}: {
  className?: string
  children: [ReactNode, ReactNode]
}) {
  return (
    <div className={cx('relative', className)}>
      <div className="lg:mr-12">{children[0]}</div>
      <div className="relative z-10 mt-4 lg:-mt-16 lg:ml-24 lg:translate-x-6 lg:translate-y-6">
        {children[1]}
      </div>
    </div>
  )
}
