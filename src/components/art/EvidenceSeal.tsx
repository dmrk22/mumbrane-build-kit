import { useId } from 'react'
import { MarkPaths } from '@/components/brand/Mark'
import { InView } from '@/components/motion/InView'
import { ui } from '@/content/ui'
import { rosette } from '@/lib/art/guilloche'
import { cx } from '@/lib/cx'

const VIEW = 220
const RING_R = 92 // legend baseline radius
const MARK_SHARE = 0.4 // mark width as a share of the seal

/**
 * The checked-answer seal (DESIGN §8.5): guilloche rosette, the legend on a circular path, and the
 * mark uniformly scaled at the centre. `size` is the rendered width in px (160–220). Decorative:
 * the section's caption carries the meaning. Draws on once when it scrolls into view (§7.5).
 */
export function EvidenceSeal({
  size = 220,
  seed = 7,
  className,
}: {
  size?: number
  seed?: number
  className?: string
}) {
  const id = useId()
  const rings = rosette(seed, 150)
  const markScale = (MARK_SHARE * VIEW) / 1000
  const circumference = 2 * Math.PI * RING_R
  return (
    <InView className={cx('text-surface-fg', className)}>
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        width={size}
        height={size}
        className="block h-auto max-w-full"
        aria-hidden="true"
      >
        <defs>
          <path
            id={`${id}-ring`}
            d={`M${VIEW / 2} ${VIEW / 2} m-${RING_R} 0 a${RING_R} ${RING_R} 0 1 1 ${RING_R * 2} 0 a${RING_R} ${RING_R} 0 1 1 -${RING_R * 2} 0`}
          />
        </defs>
        <g
          className="seal-rings"
          transform="translate(35 35)"
          fill="none"
          stroke="currentColor"
          strokeWidth={0.6}
          opacity={0.55}
        >
          {rings.map((d) => (
            <path key={d} className="seal-ring" d={d} pathLength={1} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <circle
          cx={VIEW / 2}
          cy={VIEW / 2}
          r={RING_R + 12}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.75}
          opacity={0.4}
        />
        <g className="seal-legend">
          <text className="fill-current font-mono" fontSize={9.5}>
            <textPath href={`#${id}-ring`} textLength={circumference - 2} lengthAdjust="spacing">
              {ui.sealLegend.repeat(3)}
            </textPath>
          </text>
        </g>
        {/* A clear disc so the rosette frames the mark instead of running through it. */}
        <circle cx={VIEW / 2} cy={VIEW / 2} r={VIEW * MARK_SHARE * 0.6} className="fill-surface" />
        <g
          transform={`translate(${VIEW / 2 - 500 * markScale} ${VIEW / 2 - 196.4 * markScale}) scale(${markScale})`}
        >
          <MarkPaths widthPx={size * MARK_SHARE} />
        </g>
      </svg>
    </InView>
  )
}
