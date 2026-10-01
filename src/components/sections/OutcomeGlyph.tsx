import type { Outcome } from '@/content/outcomes'
import { cx } from '@/lib/cx'

/**
 * Each outcome drawn in the site's diagram marks: a filled dot is established, a hollow dot is
 * missing, the accent line is the path to an answer, a dashed line has no support. Decorative —
 * the outcome's name always sits beside it. Boxes use rx 3.6: the diagram chip (22 tall, rx 8 —
 * the site radius, D-132) at this glyph's 10-unit scale, so they stay boxes, not pills.
 */
export function OutcomeGlyph({ outcome, className }: { outcome: Outcome; className?: string }) {
  return (
    <svg viewBox="0 0 120 32" className={cx('block h-8 w-30', className)} aria-hidden="true" fill="none">
      {GLYPHS[outcome]}
    </svg>
  )
}

const node = (x: number, y = 16) => <circle cx={x} cy={y} r={3} className="dg-node" />

const GLYPHS: Record<Outcome, React.ReactNode> = {
  supported: (
    <>
      <path d="M8 16 H108" className="dg-accent" />
      {node(8)}
      {node(52)}
      <circle cx={108} cy={16} r={5} className="dg-dot" />
    </>
  ),
  unproven: (
    <>
      <path d="M8 16 H52" className="dg-accent" />
      <path d="M58 16 H102" className="dg-line dg-dash" />
      {node(8)}
      {node(52)}
      <circle cx={108} cy={16} r={4.5} className="dg-hollow" />
    </>
  ),
  conflict: (
    <>
      <path d="M8 7 C 40 7, 56 16, 80 16" className="dg-accent" />
      <path d="M8 25 C 40 25, 56 16, 80 16" className="dg-accent" />
      {node(8, 7)}
      {node(8, 25)}
      <circle cx={88} cy={16} r={6} className="dg-hollow" />
      <path d="M84.5 12.5 L91.5 19.5 M91.5 12.5 L84.5 19.5" className="dg-line" />
    </>
  ),
  refused: (
    <>
      <rect x={6} y={11} width={22} height={10} rx={3.6} className="dg-chip" />
      <rect x={32} y={11} width={16} height={10} rx={3.6} className="dg-chip" />
      <rect x={52} y={11} width={28} height={10} rx={3.6} className="dg-line dg-dash" />
      <circle cx={108} cy={16} r={4.5} className="dg-hollow" />
    </>
  ),
  limit: (
    <>
      <path d="M8 16 H70" className="dg-accent" />
      <path d="M72 8 V24" className="dg-line" />
      <path d="M78 16 H108" className="dg-line dg-dash" />
      {node(8)}
      {node(44)}
    </>
  ),
  incomplete: (
    <>
      <path d="M8 16 H62" className="dg-accent" />
      <path d="M68 16 H108" className="dg-line dg-dash" />
      {node(8)}
    </>
  ),
  incompatible: (
    <>
      <path d="M8 16 H52" className="dg-accent" />
      {node(8)}
      {node(52)}
      <path d="M60 16 C 70 16, 74 6, 84 6 H100" className="dg-line dg-dash" />
      <rect x={100} y={1} width={10} height={10} rx={3.6} className="dg-hollow" />
    </>
  ),
}
