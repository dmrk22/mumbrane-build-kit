import { InView } from '@/components/motion/InView'
import { cx } from '@/lib/cx'

const CX = 270
const HW = 180 // half-width of a plane
const HH = 64 // half-height of a plane
const LEVELS = [110, 220, 330]

const plane = (y: number) => `M${CX} ${y - HH} L${CX + HW} ${y} L${CX} ${y + HH} L${CX - HW} ${y} Z`

/** Hairlines across a plane, parallel to both of its edges. */
function hair(y: number) {
  const lines: string[] = []
  for (let k = 1; k < 5; k++) {
    const t = k / 5
    const ax = CX - HW + HW * t
    const ay = y - HH * t
    lines.push(`M${ax} ${ay} L${ax + HW} ${ay + HH}`, `M${ax} ${y + HH * t} L${ax + HW} ${y + HH * t - HH}`)
  }
  return lines.join(' ')
}

/**
 * Moth as three stacked planes (after the original mumbrane.com layer figure): your facts, your
 * definitions, the compiled field — and one path dropping through them to a checked answer. The
 * planes settle into place once, the first time the figure is seen. Decorative.
 */
export function LayerStack({
  layers,
  answer,
  className,
}: {
  layers: readonly string[]
  answer: string
  className?: string
}) {
  const bottom = LEVELS[LEVELS.length - 1] ?? 0
  return (
    <InView className={cx('layer-stack', className)}>
      <svg viewBox="0 0 640 460" className="block h-auto w-full" aria-hidden="true" fill="none">
        {LEVELS.map((y, i) => (
          <g key={y} className={`ls-plane ls-${i}`}>
            <path d={plane(y)} className="dg-chip" />
            <path d={hair(y)} className="dg-line ls-hair" />
            <path d={`M${CX + HW} ${y} H${CX + HW + 26}`} className="dg-line" />
            <text x={CX + HW + 34} y={y + 4} className="dg-label">
              {layers[i]}
            </text>
          </g>
        ))}
        <g className="ls-path">
          <circle cx={CX} cy={30} r={4.5} className="dg-hollow" />
          <path d={`M${CX} 36 V${bottom}`} className="dg-accent" pathLength={1} />
          {LEVELS.slice(0, -1).map((y) => (
            <circle key={y} cx={CX} cy={y} r={3} className="dg-node" />
          ))}
          <circle cx={CX} cy={bottom} r={7} className="dg-dot" />
          <path d={`M${CX} ${bottom + 12} V${bottom + 80}`} className="dg-line dg-dash" />
          <text x={CX} y={bottom + 100} textAnchor="middle" className="dg-label-strong">
            {answer}
          </text>
        </g>
      </svg>
    </InView>
  )
}
