import type { Route } from 'next'
import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { OUTCOMES, type Outcome } from '@/content/outcomes'
import { cx } from '@/lib/cx'

const CHIP =
  'inline-flex h-8 items-center gap-2 rounded-md border px-3.5 font-sans text-small transition-[color,background-color,border-color] duration-(--duration-micro) ease-out'

/**
 * Tag or filter pill (DESIGN §9.7). With `pressed` it renders a toggle button; otherwise a label.
 * Selected = the surface's inverse fill.
 */
export function Chip({
  pressed,
  className,
  children,
  ...rest
}: { pressed?: boolean; className?: string; children: ReactNode } & Omit<
  ComponentProps<'button'>,
  'className' | 'children' | 'aria-pressed'
>) {
  if (pressed === undefined) {
    return <span className={cx(CHIP, 'border-surface-rule text-surface-muted', className)}>{children}</span>
  }
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cx(
        CHIP,
        pressed
          ? 'border-surface-invert bg-surface-invert text-surface-on-invert'
          : 'border-surface-fg/25 text-surface-fg hover:bg-surface-raise',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/**
 * A filter as a link (URL state, works without JS): replaces the history entry and keeps the scroll
 * position, so filtering feels like a toggle. Current = the pressed look + `aria-current`.
 */
export function FilterChip({
  href,
  current,
  children,
}: {
  href: Route
  current: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      replace
      scroll={false}
      aria-current={current ? 'true' : undefined}
      className={cx(
        CHIP,
        current
          ? 'border-surface-invert bg-surface-invert text-surface-on-invert'
          : 'border-surface-fg/25 text-surface-fg hover:bg-surface-raise',
      )}
    >
      {children}
    </Link>
  )
}

// Fill + text pairs (contrast.test.ts): every outcome ground takes ink text.
const TONE: Record<Outcome, string> = {
  supported: 'bg-supported text-ink',
  unproven: 'bg-unproven text-ink',
  conflict: 'bg-conflict text-ink',
  refused: 'bg-refused text-ink',
  limit: 'bg-limit text-text-2',
  incomplete: 'bg-limit text-text-2',
  incompatible: 'bg-limit text-text-2',
}

/** Moth outcome: text first, colour second. Sentence case; the diamond is the chalk mark. */
export function StatusChip({ outcome, className }: { outcome: Outcome; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex h-7 items-center gap-2 rounded-md px-2.5 font-sans text-small font-medium whitespace-nowrap',
        TONE[outcome],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 rotate-45 bg-current" />
      {OUTCOMES[outcome].label}
    </span>
  )
}

/**
 * A content label (CONTENT §4): Preview, Illustrative, Simulation, Proposed, Draft, Synthetic
 * example world, Conceptual illustration, Explanatory example. Mono, 10 px radius, bordered.
 */
export function Tag({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cx(
        'inline-flex min-h-6 items-center rounded-md border border-surface-fg/30 px-2 py-0.5 font-mono text-label text-surface-muted',
        className,
      )}
    >
      {children}
    </span>
  )
}
