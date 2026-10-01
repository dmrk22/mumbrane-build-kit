'use client'

import { type ReactNode, useRef, useState } from 'react'
import { InstrumentWindow } from '@/components/instrument/InstrumentWindow'
import { Container } from '@/components/layout/Container'
import { usePinnedSteps } from '@/components/motion/usePinnedSteps'
import { Button } from '@/components/ui/Button'
import { StatusChip } from '@/components/ui/Chip'
import { Heading, TheoremLabel } from '@/components/ui/Heading'
import { Inline, Qed } from '@/components/ui/Inline'
import type { HOME } from '@/content/home'
import { cx } from '@/lib/cx'

type How = (typeof HOME)['how']
type Proof = How['sheet']['proofs'][number]

const DEFINE = 0
const COMPILE = 1
const ASK = 2
const CHECK = 3
const REPLAY = 4

/** One inference: premises over a bar, the rule's name beside it, the conclusion under it. */
function Rule({
  premises,
  conclusion,
  rule,
  open = false,
  className,
}: {
  premises: ReactNode
  conclusion: ReactNode
  rule: string
  /** A rule whose premise is not established: the bar breaks and the conclusion stays grey. */
  open?: boolean
  className?: string
}) {
  return (
    <div className={cx('ps-rule inline-flex flex-col items-center', className)}>
      <div className="flex items-end justify-center gap-x-6 gap-y-2 px-1">{premises}</div>
      <div className="relative mt-1.5 w-full">
        <div className={cx('ps-bar h-px w-full', open ? 'ps-bar-open' : 'bg-surface-fg')} />
        <span className="absolute top-1/2 left-full ml-2 -translate-y-1/2 font-serif-italic text-caption whitespace-nowrap text-surface-subtle">
          {rule}
        </span>
      </div>
      <div className={cx('mt-1.5 whitespace-nowrap', open && 'text-surface-subtle')}>{conclusion}</div>
    </div>
  )
}

function Derivation({ proof, shown }: { proof: Proof; shown: boolean }) {
  const open = proof.outcome !== 'supported'
  return (
    <figure data-shown={shown} className="ps-part flex flex-col gap-3">
      <div className="overflow-x-auto pb-2">
        <Rule
          rule={proof.rule}
          open={open}
          className="min-w-max pr-20 font-serif text-small"
          premises={
            <>
              <Rule
                rule={proof.lemmaRule}
                open={open}
                premises={
                  <span className={cx('whitespace-nowrap', open && 'text-cinnabar-glow')}>
                    {proof.premises[0]}
                    {open && <span aria-hidden="true"> ?</span>}
                  </span>
                }
                conclusion={proof.lemma}
              />
              {proof.side.map((s) => (
                <span key={s} className="whitespace-nowrap">
                  {s}
                </span>
              ))}
            </>
          }
          conclusion={<span className="font-semibold">{proof.conclusion}</span>}
        />
      </div>
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <StatusChip outcome={proof.outcome} />
        <span className="font-serif text-caption text-surface-muted">{proof.note}</span>
        {!open && <Qed className="text-surface-fg" />}
      </figcaption>
    </figure>
  )
}

/**
 * Example 2, "how Moth works", as a proof sheet on the blackboard. Desktop with motion: the section
 * pins and scroll walks the five steps (define → compile → ask → check → replay); the sheet fills
 * in step by step and the two derivations draw their bars. Everywhere else, and before the motion
 * code arrives, the final sheet shows. All text stays in the accessibility tree.
 */
export function ProofSheet({ how }: { how: How }) {
  const ref = useRef<HTMLElement>(null)
  const last = how.steps.length - 1
  const [step, setStep] = useState(last)
  const goTo = usePinnedSteps(ref, { steps: how.steps.length, distanceVh: 200, onStep: setStep })
  const shown = (k: number) => step >= k
  const sh = how.sheet

  return (
    <section
      ref={ref}
      id="how-moth-works"
      data-surface="ink"
      aria-labelledby="how-title"
      className="proof-sheet relative flex items-center overflow-x-clip py-16 md:py-24 lg:min-h-dvh lg:pt-22 lg:pb-10"
    >
      <Container>
        <div className="grid grid-cols-12 items-center gap-x-4 gap-y-12 lg:gap-x-8">
          <div className="col-span-12 lg:col-span-4">
            <TheoremLabel kind={how.kind} />
            <Heading level={2} size="display-s" id="how-title" className="mt-4">
              {how.title}
            </Heading>
            <p className="mt-5 max-w-[44ch] font-serif text-body text-surface-muted">{how.lede}</p>
            <ol className="mt-8 border-t border-surface-rule">
              {how.steps.map((s, i) => {
                const active = i === step
                return (
                  <li key={s.name} className="border-b border-surface-rule">
                    <button
                      type="button"
                      aria-current={active ? 'step' : undefined}
                      onClick={() => goTo(i) || setStep(i)}
                      className="grid w-full grid-cols-[2rem_1fr_auto] items-baseline gap-x-3 py-3 text-left"
                    >
                      <span
                        className={cx(
                          'font-serif-italic text-small tabular-nums transition-colors duration-(--duration-ui)',
                          active ? 'text-sulfur' : 'text-surface-subtle',
                        )}
                      >
                        {i + 1}.
                      </span>
                      <span className="font-sans text-title">{s.name}</span>
                      <span className="font-serif-italic text-caption text-surface-subtle">{s.tag}</span>
                      <span
                        className={cx(
                          'ps-step-text col-start-2 col-end-4 font-serif text-small text-surface-muted',
                          active ? 'ps-step-open' : 'ps-step-closed',
                        )}
                      >
                        {s.text}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {how.actions.map((a) => (
                <Button key={a.href} href={a.href} variant="text" arrow>
                  {a.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="relative col-span-12 lg:col-span-8">
            <article className="sheet relative rounded-lg border border-surface-rule bg-ink-2/60 p-5 sm:px-7 sm:py-5">
              <header className="flex items-center justify-between gap-4 border-b border-surface-rule pb-3">
                <p className="font-mono text-code">{sh.title}</p>
                <p
                  data-shown={shown(COMPILE)}
                  className="ps-part rounded-xs border border-sulfur/60 px-2 py-0.5 font-mono text-label text-sulfur"
                >
                  {sh.build}
                </p>
              </header>

              <div data-shown={shown(DEFINE)} className="ps-part mt-4 grid gap-5 md:grid-cols-2">
                <dl className="flex flex-col gap-2.5">
                  {sh.definitions.map((d) => (
                    <div key={d.name} className="grid grid-cols-[6.5rem_1fr] gap-3">
                      <dt className="font-serif-italic text-caption text-surface-subtle">{d.name}</dt>
                      <dd className="font-serif text-small">{d.text}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="sheet-facts flex flex-col gap-1.5 font-serif text-small text-surface-muted">
                  {sh.facts.map((f) => (
                    <li key={f}>
                      <Inline text={f} />
                    </li>
                  ))}
                </ul>
              </div>

              <p
                data-shown={shown(ASK)}
                className="ps-part sheet-facts mt-4 border-t border-surface-rule pt-4 font-serif text-body lg:text-lede"
              >
                <span className="mr-3 font-serif-italic text-small text-sulfur">Ask.</span>
                <Inline text={sh.ask} />
              </p>

              <div className="ps-proofs mt-4 grid gap-5 border-t border-surface-rule pt-5">
                {sh.proofs.map((p) => (
                  <Derivation key={p.entity} proof={p} shown={shown(CHECK)} />
                ))}
              </div>

              <p
                data-shown={shown(REPLAY)}
                className="ps-part mt-4 flex items-center gap-3 border-t border-surface-rule pt-3 font-mono text-label text-surface-muted"
              >
                <span aria-hidden="true" className="size-1.5 rotate-45 bg-malachite" />
                {sh.replay}
              </p>
            </article>

            <div
              data-shown={shown(REPLAY)}
              className="ps-part ps-cli relative z-10 mt-6 lg:absolute lg:right-[-2.5rem] lg:bottom-[-4.5rem] lg:mt-0 lg:w-[21rem]"
            >
              <InstrumentWindow title={how.cli.title} tag={how.cli.tag} footer>
                <p className="text-surface-fg">
                  <span aria-hidden="true" className="text-surface-subtle">
                    ${' '}
                  </span>
                  {how.cli.command}
                </p>
                <dl className="mt-3 grid grid-cols-[6rem_1fr] gap-y-1">
                  {how.cli.lines.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-surface-subtle">{k}</dt>
                      <dd>{k === 'result' ? <mark className="cli-chip">{v}</mark> : v}</dd>
                    </div>
                  ))}
                </dl>
              </InstrumentWindow>
            </div>
            <p className="mt-6 font-serif-italic text-caption text-surface-subtle lg:mt-5">{how.caption}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}
