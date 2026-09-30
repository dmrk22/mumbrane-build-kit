import { cx } from '@/lib/cx'

/**
 * FIG. 02 (PAGES §5): a muon's track passing through a membrane, line-drawn. The track is a row of
 * beads (a bubble-chamber trace) in the one pigment; the membrane is a gently bowed band in the
 * surface ink. Decorative — the caption carries the meaning. Labels are HTML placed in percent of
 * the 480 × 240 viewBox so they stay on the type scale at every width (see LightCone).
 */
export function MuonTrack({
  labels,
  className,
}: {
  labels: { muon: string; track: string; membrane: string }
  className?: string
}) {
  const label = 'absolute font-mono text-label uppercase'
  return (
    <div data-figure="muon-track" className={cx('relative', className)} aria-hidden="true">
      <svg viewBox="0 0 480 240" className="block h-auto w-full" aria-hidden="true">
        <path
          d="M0 128C120 98 360 158 480 128V146C360 176 120 116 0 146Z"
          className="fill-current"
          opacity={0.08}
        />
        <g fill="none" stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={0.7}>
          <path d="M0 128C120 98 360 158 480 128" />
          <path d="M0 146C120 116 360 176 480 146" />
        </g>
        <path
          d="M96 12L392 232"
          fill="none"
          className="stroke-vermilion"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="0 9"
        />
        <circle cx="266" cy="139" r="7" fill="none" className="stroke-vermilion" strokeWidth={1} />
      </svg>
      <span className={cx(label, 'top-0 left-[28%] text-surface-fg')}>
        <span className="font-serif text-title normal-case">{labels.muon}</span> {labels.track}
      </span>
      <span className={cx(label, 'top-[42%] right-0 text-surface-muted')}>{labels.membrane}</span>
    </div>
  )
}
