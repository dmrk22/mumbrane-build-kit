import { Section } from '@/components/layout/Section'
import { InView } from '@/components/motion/InView'
import { ScrubText } from '@/components/motion/ScrubText'
import { TheoremLabel } from '@/components/ui/Heading'
import { Formula } from '@/components/ui/Inline'
import { HOME } from '@/content/home'
import { cx } from '@/lib/cx'

const STAGGER = ['ts-i-0', 'ts-i-1', 'ts-i-2'] as const

/**
 * Definition 1: the whole product as one judgement, Γ ⊢ φ, each symbol annotated in plain words,
 * then its negation. Symbols rise and their leader lines draw when the figure enters (CSS on
 * InView's data-reveal); no-JS and reduced motion show the final figure.
 */
export function Turnstile() {
  const p = HOME.principle
  return (
    <Section surface="paper" id="principle" labelledBy="principle-title" className="overflow-hidden">
      <div className="grid gap-x-6 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <TheoremLabel kind={p.kind} term={p.term} />
          <h2 id="principle-title" className="sr-only">
            {p.lead}
          </h2>
          <ScrubText className="mt-6 max-w-[24ch] font-display text-display-s" lead={p.lead} rest={p.rest} />
        </div>

        <InView className="turnstile lg:col-span-7 lg:col-start-6">
          <figure aria-label={p.formula.map((s) => `${s.symbol}: ${s.name}`).join(', ')}>
            <ol className="grid grid-cols-3 items-end">
              {p.formula.map((s, i) => (
                <li key={s.symbol} className={cx('flex flex-col', STAGGER[i])}>
                  {s.symbol === '⊢' ? (
                    // The serif has no turnstile; drawn here with the serif's own stem weight.
                    <span aria-hidden="true" className="ts-sym block text-center font-serif text-formula">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 100 100"
                        className="mx-auto inline-block h-[0.69em] w-auto align-baseline"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={6}
                      >
                        <path d="M22 3 V97 M22 50 H90" />
                      </svg>
                    </span>
                  ) : (
                    <span
                      aria-hidden="true"
                      className={cx(
                        'ts-sym block text-center font-serif text-formula',
                        s.symbol === 'φ' && 'font-serif-italic',
                      )}
                    >
                      {s.symbol}
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className="ts-lead mx-auto mt-4 block h-12 w-px bg-surface-fg/40 lg:h-16"
                  />
                  <span className="ts-note mt-4 block px-2 text-center sm:px-4">
                    <span className="block font-sans text-small font-semibold sm:text-title">{s.name}</span>
                    <span className="mt-1.5 block font-serif text-caption text-surface-muted sm:text-small">
                      {s.text}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </figure>

          <div className="ts-neg mt-14 flex flex-col gap-4 border-t border-surface-rule pt-6 sm:flex-row sm:items-baseline sm:gap-8">
            <p
              aria-hidden="true"
              className="shrink-0 font-serif text-display-s whitespace-nowrap text-cinnabar-fg"
            >
              <Formula text={p.negation.symbol} />
            </p>
            <p className="max-w-[44ch] font-serif text-lede text-surface-muted">{p.negation.text}</p>
          </div>
        </InView>
      </div>
    </Section>
  )
}
