import { InView } from '@/components/motion/InView'
import { butterflyPath } from '@/lib/art/curves'
import { cx } from '@/lib/cx'

const PATH = butterflyPath()
// The curve spans about x ∈ [−3.4, 3.4], y ∈ [−2.6, 4.4] (units of 100 px in the path).
const VIEW = '-400 -470 800 780'
const TICKS = [-3, -2, -1, 1, 2, 3]

/**
 * Fig. 1 of the Moth page: Fay's butterfly curve plotted like a figure in a paper — hairline axes
 * with unit ticks, the curve drawing itself once on reveal (static under reduced motion), and its
 * parametric equations as the caption.
 */
export function MothCurve({ className }: { className?: string }) {
  return (
    <figure className={cx('flex flex-col gap-5', className)}>
      <InView className="moth-curve">
        <svg viewBox={VIEW} className="block h-auto w-full" aria-hidden="true" fill="none">
          <g
            stroke="currentColor"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            className="text-surface-rule"
          >
            <path d="M-380 0 H380 M0 -450 V290" vectorEffect="non-scaling-stroke" />
            {TICKS.map((k) => (
              <path
                key={`x${k}`}
                d={`M${k * 100} -5 V5 M-5 ${-k * 100} H5`}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
          <path
            className="moth-curve-path text-surface-fg"
            d={PATH}
            stroke="currentColor"
            strokeWidth={1.1}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
          />
        </svg>
      </InView>
      <figcaption className="grid gap-3 border-t border-surface-rule pt-4 font-serif text-caption text-surface-muted sm:grid-cols-[auto_1fr] sm:gap-8">
        <p>
          <span className="font-semibold text-surface-fg">Fig. 1.</span> Fay’s butterfly curve, 0 ≤{' '}
          <i className="font-serif-italic">t</i> ≤ 12π.
        </p>
        <p className="font-serif-italic sm:text-right">
          x = sin t (e<sup>cos t</sup> − 2 cos 4t − sin<sup>5</sup>(t/12)),
          <br />y = cos t (e<sup>cos t</sup> − 2 cos 4t − sin<sup>5</sup>(t/12))
        </p>
      </figcaption>
    </figure>
  )
}
