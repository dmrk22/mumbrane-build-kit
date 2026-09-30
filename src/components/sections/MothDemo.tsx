'use client'

import { useRef, useState } from 'react'
import { InstrumentStack, InstrumentWindow } from '@/components/instrument/InstrumentWindow'
import { Container } from '@/components/layout/Container'
import { usePinnedSteps } from '@/components/motion/usePinnedSteps'
import { Button } from '@/components/ui/Button'
import { StatusChip } from '@/components/ui/Chip'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { Inline } from '@/components/ui/Inline'
import type { HOME } from '@/content/home'
import { cx } from '@/lib/cx'

type How = (typeof HOME)['how']

/**
 * "How Moth works" (DESIGN §7.4). Desktop with motion: the section pins for 120 vh and scroll
 * drives the five steps (define → compile → ask → check → replay). Everywhere else — and before
 * the motion code arrives — it shows the final state. All window text is real and stays in the
 * accessibility tree; steps only fade in visually.
 */
export function MothDemo({ how }: { how: How }) {
  const ref = useRef<HTMLElement>(null)
  const last = how.steps.length - 1
  const [step, setStep] = useState(last)
  const goTo = usePinnedSteps(ref, { steps: how.steps.length, distanceVh: 120, onStep: setStep })
  const shown = (k: number) => step >= k
  const f = how.field

  return (
    <section
      ref={ref}
      id="how-moth-works"
      data-surface="ink"
      aria-labelledby="how-title"
      className="flex items-center overflow-x-clip py-16 md:py-24 lg:min-h-dvh lg:py-20"
    >
      <Container>
        <div className="grid grid-cols-12 items-center gap-x-4 gap-y-14 lg:gap-x-6">
          <div className="col-span-12 lg:col-span-5">
            <Eyebrow>{how.eyebrow}</Eyebrow>
            <Heading level={2} size="display-m" id="how-title" className="mt-4">
              {how.title}
            </Heading>
            <p className="mt-6 max-w-[48ch] text-lede text-surface-muted">{how.lede}</p>
            <ol className="mt-10 border-t border-surface-rule">
              {how.steps.map((s, i) => {
                const active = i === step
                return (
                  <li key={s.name} className="border-b border-surface-rule">
                    <button
                      type="button"
                      aria-current={active ? 'step' : undefined}
                      onClick={() => goTo(i) || setStep(i)}
                      className="grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-4 text-left"
                    >
                      <span
                        className={cx(
                          'font-mono text-label tabular-nums transition-colors duration-(--duration-ui)',
                          active ? 'text-cherenkov' : 'text-surface-subtle',
                        )}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={cx(
                          'text-body transition-colors duration-(--duration-ui)',
                          active ? 'text-surface-fg' : 'text-surface-muted',
                        )}
                      >
                        {s.name}
                      </span>
                      <span className="text-right font-mono text-label text-surface-subtle uppercase">
                        {s.tag}
                      </span>
                      <span
                        className={cx(
                          'col-start-2 col-end-4 mt-1.5 text-small text-surface-muted max-lg:block',
                          active ? 'block' : 'hidden',
                        )}
                      >
                        {s.text}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              {how.actions.map((a) => (
                <Button key={a.href} href={a.href} variant="text" arrow>
                  {a.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <InstrumentStack>
              <InstrumentWindow title={f.title} tag={f.tag} footer>
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="demo-tag">{how.tags.define}</span>
                    {f.define.map((d) => (
                      <p key={d} className="mt-2">
                        {d}
                      </p>
                    ))}
                  </div>
                  <div>
                    <span className="demo-tag">{how.tags.facts}</span>
                    <p className="mt-2">
                      {f.facts.map((fact) => (
                        <span key={fact}>
                          <Inline text={fact} />{' '}
                        </span>
                      ))}
                    </p>
                  </div>
                  <div data-shown={shown(1)} className="demo-part flex items-center gap-3">
                    <span aria-hidden="true" className="h-px flex-1 bg-surface-rule">
                      <span data-shown={shown(1)} className="demo-fill block h-px bg-cherenkov" />
                    </span>
                    <span className="border border-surface-rule px-1.5 text-label uppercase">{f.build}</span>
                  </div>
                  <div data-shown={shown(2)} className="demo-part">
                    <span className="demo-tag">{how.tags.ask}</span>
                    <p className="mt-2">
                      <Inline text={f.ask} />
                    </p>
                  </div>
                  <ul
                    data-shown={shown(3)}
                    className="demo-part divide-y divide-dashed divide-surface-rule border-t border-dashed border-surface-rule"
                  >
                    {f.results.map((r) => (
                      <li
                        key={r.entity}
                        className="grid gap-2 py-3 sm:grid-cols-[6.5rem_auto_1fr] sm:items-center sm:gap-4"
                      >
                        <span>{r.entity}</span>
                        <StatusChip outcome={r.outcome} />
                        <span className="text-surface-muted">{r.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </InstrumentWindow>
              <div data-shown={shown(4)} className="demo-trace">
                <InstrumentWindow title={how.trace.title}>
                  <ul className="flex flex-col gap-2">
                    {how.trace.lines.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                    <li className="mt-1 border-t border-viridian pt-3 text-surface-muted">
                      {how.trace.replay}
                    </li>
                  </ul>
                </InstrumentWindow>
              </div>
            </InstrumentStack>
            <p className="mt-6 font-mono text-label text-surface-muted uppercase lg:mt-10">{how.caption}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}
