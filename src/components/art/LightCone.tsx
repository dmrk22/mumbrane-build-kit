import { cx } from '@/lib/cx'

/**
 * FIG. 01 (DESIGN §8.6): a decision's past light cone, line-drawn. Events inside the cone can reach
 * the decision; events outside cannot reach it yet. 1 px strokes in the surface ink at 70 %, mono
 * labels, one pigment dot. Decorative drawing — the figure caption carries the meaning.
 *
 * Labels are HTML over the SVG, placed in percent of the 480 × 300 viewBox: SVG text scales with
 * the drawing and fell to ~7 px at 375, while these stay on the label type scale at every width.
 */
export function LightCone({
  labels,
  className,
}: {
  labels: { decision: string; reachable: string; unreachable: string; time: string }
  className?: string
}) {
  const label = 'absolute font-serif-italic text-small'
  return (
    <div data-figure="light-cone" className={cx('relative', className)} aria-hidden="true">
      <svg viewBox="0 0 480 300" className="block h-auto w-full" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={0.7}>
          {/* Time axis and the cone's edges (45°: the speed of light). */}
          <path d="M240 280V24" strokeDasharray="3 5" />
          <path d="M240 56L40 256M240 56L440 256" />
          <path d="M40 256h400" opacity={0.4} />
          {/* Signal paths from events to the decision. */}
          <path d="M200 200L240 56" strokeDasharray="2 4" />
          <path d="M290 180L240 56" strokeDasharray="2 4" />
        </g>
        <g className="fill-current">
          <circle cx="200" cy="200" r="3.5" />
          <circle cx="290" cy="180" r="3.5" />
          <circle cx="96" cy="120" r="3.5" opacity={0.5} />
          <circle cx="400" cy="130" r="3.5" opacity={0.5} />
        </g>
        <circle cx="240" cy="56" r="5" className="fill-cinnabar" />
      </svg>
      {/* Right of the time axis (x 240 = 50 %) so the dashed line never strikes through a label. */}
      <span className={cx(label, 'top-[2%] left-[52%] text-surface-muted')}>{labels.time} ↑</span>
      <span className={cx(label, 'top-[11%] left-[53%]')}>{labels.decision}</span>
      <span className={cx(label, 'top-[74%] left-[53%]')}>{labels.reachable}</span>
      {/* Left of the cone's edge; wraps rather than crossing it on narrow screens. */}
      <span className={cx(label, 'top-[17%] left-0 max-w-[38%] text-surface-muted')}>
        {labels.unreachable}
      </span>
    </div>
  )
}
