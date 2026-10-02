import {
  aim,
  bead,
  FACTS,
  framing,
  height,
  mesh,
  points,
  project,
  QUESTIONS,
  RELIEF,
  settle,
  WELLS,
} from '@/lib/art/field'

type Labels = { facts: string; question: string; answer: string }

const W = 1000
const H = 800
const LIFT = 0.012 // the path rides just above the sheet so the mesh never cuts it
const RETICLE = 14

/**
 * The membrane at rest, as SVG: the formed sheet, the facts, the first question's spiral and its
 * answer. A server component passed to the client figure as children, so it ships no JS and never
 * re-renders on hydration (a 2,000-step settle need not match bit for bit across JS engines).
 * Shown before the canvas draws, without JavaScript, under reduced motion and in forced colours.
 * Decorative.
 */
export function FieldStill({ labels }: { labels: Labels }) {
  // As the canvas draws it on the desktop layer (D-140): 15 % under full size, the core where the
  // grid columns beside the copy fall on a typical layer (the still cannot measure the page).
  const cam = aim(framing(W, H, 0.85), W * 0.65, H * 0.48)
  const at = (x: number, y: number, lift = 0) => project([x, y, height(x, y) * RELIEF + lift], cam)
  const run = settle(QUESTIONS[0])
  const path = run.path
    .filter((_, i) => i % 2 === 0)
    .map(([x, y]) => [x, y, height(x, y) * RELIEF + LIFT] as const)
  const [sx, sy] = at(QUESTIONS[0][0], QUESTIONS[0][1], LIFT)
  const end = WELLS[run.end] ?? [0, 0]
  const [ex, ey] = at(end[0], end[1], LIFT)
  const facts = WELLS[3] ?? [0, 0]
  const [fx, fy] = at(facts[0], facts[1])
  const reticle = [-1, 1]
    .flatMap((h) => [-1, 1].map((v) => [h, v] as const))
    .map(([h, v]) => {
      const x = ex + h * RETICLE
      const y = ey + v * RETICLE
      return `M${x} ${y - v * 5}V${y}H${x - h * 5}`
    })
    .join('')
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="field-poster absolute inset-0 size-full"
      fill="none"
      aria-hidden="true"
    >
      <g className="field-sheet">
        {mesh().map((line) => {
          const pts = points(line, cam)
          return <polyline key={pts} points={pts} />
        })}
      </g>
      <polyline points={points(path, cam)} className="field-path" />
      {FACTS.map((f, i) => {
        const well = WELLS[i] ?? [f.x, f.y]
        const [x, y] = at(well[0], well[1])
        return (
          <g key={`${f.x},${f.y}`}>
            <circle cx={x} cy={y} r={bead(f)} className={i === run.end ? 'field-answer' : 'field-bead'} />
            {f.priority && <circle cx={x} cy={y} r={bead(f) + 5.5} className="field-ring" />}
          </g>
        )
      })}
      <circle cx={sx} cy={sy} r={5} className="field-path" />
      <path d={reticle} className="field-reticle" />
      <g className="field-labels">
        <path d={`M${sx + 6} ${sy - 6}L${sx + 35} ${sy - 19}`} className="field-lead" />
        <text x={sx + 48} y={sy - 26} className="field-label">
          {labels.question}
        </text>
        <path d={`M${ex + 6} ${ey + 6}L${ex + 50} ${ey + 37}`} className="field-lead" />
        <text x={ex + 70} y={ey + 52} className="field-label">
          {labels.answer}
        </text>
        {run.end !== 3 && (
          <>
            <path d={`M${fx + 6} ${fy + 6}L${fx + 43} ${fy + 24}`} className="field-lead" />
            <text x={fx + 60} y={fy + 34} className="field-label">
              {labels.facts}
            </text>
          </>
        )}
      </g>
    </svg>
  )
}
