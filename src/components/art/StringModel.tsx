import { stringPaths } from '@/lib/art/minimal'
import { cx } from '@/lib/cx'

/**
 * A string model of the associate-family surface at angle `theta` (0 = helicoid, π/2 = catenoid),
 * drawn as hairline SVG strings in currentColor. Server-rendered and static: the no-WebGL poster
 * of the hero and a quiet figure elsewhere. Decorative.
 */
export function StringModel({
  theta = 0.36 * Math.PI,
  strings = 72,
  yaw,
  className,
}: {
  theta?: number
  strings?: number
  yaw?: number
  className?: string
}) {
  const paths = stringPaths(theta, { strings, ...(yaw === undefined ? {} : { yaw }) })
  return (
    <svg
      viewBox="-500 -500 1000 1000"
      className={cx('block', className)}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      vectorEffect="non-scaling-stroke"
    >
      {paths.map((d) => (
        <path key={d} d={d} vectorEffect="non-scaling-stroke" strokeOpacity={0.55} />
      ))}
    </svg>
  )
}
