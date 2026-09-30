import { LOCKUP, MARK, WORDMARK } from '@/components/brand/mark-geometry'
import { site } from '@/content/site'

// P0 placeholder: the locked lockup on paper, drawn from the generated geometry. Replaced in P6.
export default function Home() {
  const { compact } = MARK.weights
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-paper px-6 text-ink">
      <h1 className="w-full max-w-160">
        <svg viewBox={LOCKUP.viewBox} role="img" aria-label={site.name} className="block h-auto w-full">
          <g
            transform={LOCKUP.markTransform}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g strokeWidth={compact.strut}>
              {MARK.struts.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
            <g strokeWidth={compact.edge}>
              <path d={MARK.band} />
              <path d={MARK.rim} />
            </g>
          </g>
          <g transform={LOCKUP.wordmarkTransform} fill="currentColor">
            {WORDMARK.letters.map((letter) => (
              <path key={letter.d} d={letter.d} />
            ))}
          </g>
        </svg>
      </h1>
    </main>
  )
}
