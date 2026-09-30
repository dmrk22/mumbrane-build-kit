import { cx } from '@/lib/cx'

export type Swatch = { hex: string; weight: number }

/**
 * A 6 px strip of a painting's palette, each colour as wide as its weight, no gaps (DESIGN §8.5).
 * Colours come from the generated paintings manifest. Decorative.
 */
export function SpectralStrip({ palette, className }: { palette: readonly Swatch[]; className?: string }) {
  const total = palette.reduce((s, p) => s + p.weight, 0) || 1
  let x = 0
  return (
    <svg
      viewBox="0 0 1000 6"
      preserveAspectRatio="none"
      className={cx('block h-1.5 w-full', className)}
      aria-hidden="true"
    >
      {palette.map((p) => {
        const w = (p.weight / total) * 1000
        const rect = <rect key={`${p.hex}-${x}`} x={x} y={0} width={w + 0.5} height={6} fill={p.hex} />
        x += w
        return rect
      })}
    </svg>
  )
}
