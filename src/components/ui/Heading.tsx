import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

// Visual size and semantic level are chosen independently (DESIGN §3.2).
const SIZE = {
  'display-xl': 'font-serif text-display-xl',
  'display-l': 'font-serif text-display-l',
  'display-m': 'font-serif text-display-m',
  'display-s': 'font-serif text-display-s',
  title: 'font-sans text-title',
} as const

export type HeadingSize = keyof typeof SIZE
const TAG = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5', 6: 'h6' } as const

export function Heading({
  level,
  size,
  id,
  className,
  children,
}: {
  level: keyof typeof TAG
  size: HeadingSize
  id?: string
  className?: string
  children: ReactNode
}) {
  const Tag = TAG[level]
  return (
    <Tag id={id} className={cx(SIZE[size], 'text-balance', className)}>
      {children}
    </Tag>
  )
}

/** Mono label above a heading ("01 — Principle"); rendered uppercase. `dot` adds the cadmium spark. */
export function Eyebrow({
  as: Tag = 'p',
  dot = false,
  className,
  children,
}: {
  as?: 'p' | 'span' | 'div'
  dot?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <Tag
      className={cx(
        'flex items-center gap-2.5 font-mono text-label text-surface-subtle uppercase',
        className,
      )}
    >
      {dot && (
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-cadmium ring-3 ring-cadmium/25" />
      )}
      <span>{children}</span>
    </Tag>
  )
}
