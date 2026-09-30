import { band, border, rosette } from '@/lib/art/guilloche'
import { cx } from '@/lib/cx'

type Kind = 'band' | 'rosette' | 'border'

/**
 * Seeded security-print line work (DESIGN §8.4), 0.6 px non-scaling strokes in `currentColor`.
 * Decorative. `band` stretches to its box; `rosette` and `border` keep their proportions.
 */
export function Guilloche({
  kind,
  seed = 1,
  width,
  height,
  className,
}: {
  kind: Kind
  seed?: number
  width?: number
  height?: number
  className?: string
}) {
  const w = width ?? (kind === 'band' ? 1440 : kind === 'rosette' ? 200 : 1200)
  const h = kind === 'rosette' ? w : (height ?? (kind === 'band' ? 240 : 630))
  const paths =
    kind === 'band' ? band(seed, w, h) : kind === 'rosette' ? rosette(seed, w) : border(seed, w, h)
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio={kind === 'band' ? 'none' : 'xMidYMid meet'}
      fill="none"
      stroke="currentColor"
      strokeWidth={0.6}
      className={cx('block', className)}
      aria-hidden="true"
    >
      {paths.map((d) => (
        <path key={d} d={d} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  )
}
