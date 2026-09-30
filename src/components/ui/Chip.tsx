import type { ComponentProps, ReactNode } from 'react'
import { OUTCOMES, type Outcome } from '@/content/outcomes'
import { cx } from '@/lib/cx'

const CHIP =
  'inline-flex h-8 items-center gap-2 rounded-pill border px-3.5 font-sans text-small transition-[color,background-color,border-color] duration-(--duration-micro) ease-out'

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

// Fill + text pairs from DESIGN §2.4; refused uses violet-fg so its small text passes AA.
const TONE: Record<Outcome, string> = {
  supported: 'bg-supported text-ink',
  unproven: 'bg-unproven text-ink',
  conflict: 'bg-conflict text-ink',
  refused: 'bg-refused text-on-dark',
  limit: 'bg-limit text-text-2',
  incomplete: 'bg-limit text-text-2',
  incompatible: 'bg-limit text-text-2',
}

/** Moth outcome: text first, colour second (DESIGN §9.7). */
export function StatusChip({ outcome, className }: { outcome: Outcome; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex h-6 items-center gap-2 rounded-xs px-2 font-mono text-label whitespace-nowrap uppercase',
        TONE[outcome],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 bg-current" />
      {OUTCOMES[outcome].label}
    </span>
  )
}
