import { cx } from '@/lib/cx'
import { MarkPaths } from './Mark'
import { LOCKUP, WORDMARK } from './mark-geometry'

const [, , VB_W = 1410.41, VB_H = 222.79] = LOCKUP.viewBox.split(' ').map(Number)
// The mark occupies 1000 × 0.567185 units of the lockup's width (LOGO.md).
const MARK_SHARE = 567.185 / VB_W

/**
 * Mark + wordmark exactly as in brand/logo/mumbrane-lockup.svg. `height` is the rendered height in
 * px (it sizes the strokes). `collapsible` exposes the letters to the header collapse (DESIGN §7.1);
 * the state lives on an ancestor's `data-collapsed`.
 */
export function Lockup({
  height,
  collapsible = false,
  className,
}: {
  height: number
  collapsible?: boolean
  className?: string
}) {
  const width = Math.round(((height * VB_W) / VB_H) * 100) / 100
  return (
    <svg
      viewBox={LOCKUP.viewBox}
      width={width}
      height={height}
      className={cx('block', collapsible && 'lockup-collapsible', className)}
      aria-hidden="true"
    >
      {/* Outer group: the only transform CSS may add to the mark is a uniform scale (the bump). */}
      <g className="mb-mark-bump">
        <MarkPaths widthPx={width * MARK_SHARE} transform={LOCKUP.markTransform} />
      </g>
      <g className="mb-wordmark" fill="currentColor" transform={LOCKUP.wordmarkTransform}>
        {WORDMARK.letters.map((l, i) => (
          <path key={l.d} className="mb-letter" data-letter={i} d={l.d} />
        ))}
      </g>
    </svg>
  )
}
