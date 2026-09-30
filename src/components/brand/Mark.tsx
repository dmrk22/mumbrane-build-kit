import { cx } from '@/lib/cx'
import { MARK } from './mark-geometry'

// Locked geometry (brand/logo/LOGO.md): paths, angles and weights come only from mark-geometry.ts.
const [, , VB_W = 1000, VB_H = 392.79] = MARK.viewBox.split(' ').map(Number)
export const MARK_RATIO = VB_H / VB_W

// DESIGN §6: compact weight below 200 px rendered width. At ≤ 48 px tall the compact mark switches
// to non-scaling strokes with a hairline floor, so struts never fall below what a screen can draw
// (D-108). The floors only engage at those sizes; above them the file's weights apply unchanged.
const FLOOR = { edge: 1, strut: 0.5 } as const

export type MarkStrokes = { nonScaling: boolean; edge: number; strut: number }

export function markStrokes(widthPx: number): MarkStrokes {
  if (widthPx >= 200) return { nonScaling: false, ...MARK.weights.display }
  const { edge, strut } = MARK.weights.compact
  if (widthPx * MARK_RATIO > 48) return { nonScaling: false, edge, strut }
  const pxPerUnit = widthPx / VB_W
  return {
    nonScaling: true,
    edge: Math.max(edge * pxPerUnit, FLOOR.edge),
    strut: Math.max(strut * pxPerUnit, FLOOR.strut),
  }
}

/** The mark's paths (struts → band → rim) as an SVG group; shared by <Mark> and <Lockup>. */
export function MarkPaths({ widthPx, transform }: { widthPx: number; transform?: string }) {
  const s = markStrokes(widthPx)
  const effect = s.nonScaling ? 'non-scaling-stroke' : undefined
  return (
    <g
      className="mb-mark"
      transform={transform}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g className="mb-struts" strokeWidth={s.strut}>
        {MARK.struts.map((d) => (
          <path key={d} d={d} vectorEffect={effect} pathLength={1} />
        ))}
      </g>
      <g className="mb-edges" strokeWidth={s.edge}>
        <path className="mb-band" d={MARK.band} vectorEffect={effect} pathLength={1} />
        <path className="mb-rim" d={MARK.rim} vectorEffect={effect} pathLength={1} />
      </g>
    </g>
  )
}

/**
 * The Möbius mark. `width` is the rendered width in px (it picks the stroke weight). Always
 * decorative (`aria-hidden`): name it from its context, e.g. the link around it. `draw` plays the
 * stroke draw-on (struts → band → rim, CSS only; static under reduced motion).
 */
export function Mark({
  width,
  draw = false,
  className,
}: {
  width: number
  draw?: boolean
  className?: string
}) {
  const height = Math.round(width * MARK_RATIO * 100) / 100
  return (
    <svg
      viewBox={MARK.viewBox}
      width={width}
      height={height}
      className={cx('block', draw && 'mark-draw', className)}
      aria-hidden="true"
    >
      <MarkPaths widthPx={width} />
    </svg>
  )
}
