import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

// Four 12 px L-marks, 1 px, 6 px outside the frame's corners (DESIGN §8.3, §8.5).
const CORNERS = [
  '-top-1.5 -left-1.5 border-t border-l',
  '-top-1.5 -right-1.5 border-t border-r',
  '-bottom-1.5 -left-1.5 border-b border-l',
  '-bottom-1.5 -right-1.5 border-b border-r',
] as const

export function CropMarks({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx('relative', className)}>
      {children}
      {CORNERS.map((c) => (
        <span
          key={c}
          aria-hidden="true"
          className={cx('crop-mark pointer-events-none absolute size-3 border-surface-subtle', c)}
        />
      ))}
    </div>
  )
}
