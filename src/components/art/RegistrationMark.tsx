import { cx } from '@/lib/cx'

/** A 16 px printer's registration mark: circle and crosshair (DESIGN §8.5). Decorative. */
export function RegistrationMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      className={cx('block text-surface-subtle', className)}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="4.5" />
      <path d="M8 0.5v15M0.5 8h15" />
    </svg>
  )
}
