import { cx } from '@/lib/cx'
import { WORDMARK } from './mark-geometry'

/** The outlined wordmark (brand/logo/mumbrane-wordmark.svg). Decorative (`aria-hidden`): name it from its context. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <svg viewBox={WORDMARK.viewBox} className={cx('block', className)} aria-hidden="true">
      <g fill="currentColor" transform={WORDMARK.transform}>
        {WORDMARK.letters.map((l, i) => (
          <path key={l.d} className="mb-letter" data-letter={i} d={l.d} />
        ))}
      </g>
    </svg>
  )
}
