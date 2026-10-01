import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

/**
 * The instrument window: a printed, monochrome window that stays light on any ground — a black
 * title bar with the mono filename, an optional label chip and three outline squares, a mono body
 * on plaster, an optional dot-screen footer, and a hard offset shadow. Real content only, and
 * rationed: one or two per page, never wallpaper.
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
    <figure
      data-surface="paper-2"
      className={cx('instrument-window border-[1.5px] border-ink shadow-window', className)}
    >
      <figcaption
        data-surface="ink"
        className="flex h-8 items-center gap-3 px-3 font-mono text-label [font-stretch:87.5%]"
      >
        <span className="truncate">{title}</span>
        {tag && (
          <span data-surface="paper" className="shrink-0 px-1.5 py-px text-label">
            {tag}
          </span>
        )}
        <span aria-hidden="true" className="ml-auto flex gap-1.5">
          <span className="size-2 border border-on-dark/70" />
          <span className="size-2 border border-on-dark/70" />
          <span className="size-2 border border-on-dark/70" />
        </span>
      </figcaption>
      <div className="instrument-body p-5 font-mono text-code [font-stretch:87.5%]">{children}</div>
      {footer && (
        <div
          aria-hidden="true"
          className="dot-screen h-7 border-t border-ink/30 [--dot-color:var(--color-ink)]"
        />
      )}
    </figure>
  )
}

/** Two windows, the second offset down and right, overlapping the first's lower corner. */
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
