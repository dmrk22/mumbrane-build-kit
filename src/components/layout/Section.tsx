import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import type { Surface } from '@/lib/surface'
import { Container } from './Container'

// Section padding 64 / 96 / 128 px (DESIGN §4.2); heroes and pins set their own ('none').
const RHYTHM = {
  default: 'py-16 md:py-24 lg:py-32',
  compact: 'py-12 md:py-16 lg:py-20',
  none: '',
} as const

export function Section({
  surface = 'paper',
  id,
  labelledBy,
  rhythm = 'default',
  bleed = false,
  className,
  children,
}: {
  surface?: Surface
  id?: string
  labelledBy?: string
  rhythm?: keyof typeof RHYTHM
  /** Full-bleed: children manage their own container. */
  bleed?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <section
      data-surface={surface}
      id={id}
      aria-labelledby={labelledBy}
      className={cx(RHYTHM[rhythm], className)}
    >
      {bleed ? children : <Container>{children}</Container>}
    </section>
  )
}
