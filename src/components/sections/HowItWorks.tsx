'use client'

import { useRef, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { usePinnedSteps } from '@/components/motion/usePinnedSteps'
import { Button } from '@/components/ui/Button'
import { Heading } from '@/components/ui/Heading'
import type { HOME } from '@/content/home'
import { cx } from '@/lib/cx'

type How = (typeof HOME)['how']

const COMPILE = 1
const ASK = 2
const CHECK = 3
const REPLAY = 4

const CHAR = 6.7 // Geist Mono at 11 px, per character
const chipW = (text: string) => Math.round(text.length * CHAR + 22)

function Chip({ x, y, text, strong = false }: { x: number; y: number; text: string; strong?: boolean }) {
  const w = chipW(text)
  return (
    <g>
      <rect x={x} y={y - 11} width={w} height={22} rx={8} className={strong ? 'dg-hollow' : 'dg-chip'} />
      <text x={x + w / 2} y={y + 4} textAnchor="middle" className={strong ? 'dg-label-strong' : 'dg-label'}>
        {text}
      </text>
    </g>
  )
}

const NODES = [190, 360, 520] // x of each step node along a chain
const END = 670

/**
 * How Moth works, drawn in the site's diagram marks. Desktop with motion: the section pins and
 * scroll walks the five steps — the definitions, the compiled field, the two questions, one path
 * reaching its answer while the other breaks into "no support", then the replay. Everywhere else,
 * and before the motion code arrives, the finished diagram shows. All text stays in the
 * accessibility tree through the step list; the drawing is decorative.
 */
export function HowItWorks({ how }: { how: How }) {
  const ref = useRef<HTMLElement>(null)
  const last = how.steps.length - 1
  const [step, setStep] = useState(last)
  const goTo = usePinnedSteps(ref, { steps: how.steps.length, distanceVh: 200, onStep: setStep })
  const on = (k: number) => String(step >= k)
  const d = how.diagram
  const [defA = [], defB = []] = d.rules

  return (
    <section
      ref={ref}
      id="how-moth-works"
      data-surface="ink"
      aria-labelledby="how-title"
      className="relative flex items-center overflow-x-clip py-20 md:py-28 lg:min-h-dvh lg:pt-24 lg:pb-12"
    >
      <Container>
        <div className="grid grid-cols-12 items-center gap-x-4 gap-y-14 lg:gap-x-10">
          <div className="col-span-12 lg:col-span-5 xl:col-span-4">
            <Heading level={2} size="display-s" id="how-title" className="max-w-[16ch]">
              {how.title}
            </Heading>
            <p className="mt-6 max-w-[44ch] text-body text-surface-muted">{how.lede}</p>
            <ol className="mt-10">
              {how.steps.map((s, i) => {
                const active = i === step
                return (
                  <li key={s.name}>
                    <button
                      type="button"
                      aria-current={active ? 'step' : undefined}
                      onClick={() => goTo(i) || setStep(i)}
                      className="group grid w-full grid-cols-[2.25rem_1fr] items-baseline py-2.5 text-left"
                    >
                      <span
                        className={cx(
                          'font-mono text-label tabular-nums transition-colors duration-(--duration-ui)',
                          active ? 'text-surface-accent' : 'text-surface-subtle',
                        )}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={cx(
                          'text-title transition-colors duration-(--duration-ui)',
                          active ? 'text-surface-fg' : 'text-surface-subtle group-hover:text-surface-muted',
                        )}
                      >
                        {s.name}
                      </span>
                      <span
                        className={cx(
                          'hw-text col-start-2 text-small text-surface-muted',
                          active ? 'hw-open' : 'hw-closed',
                        )}
                      >
                        {s.text}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {how.actions.map((a) => (
                <Button key={a.href} href={a.href} variant="text" arrow>
                  {a.label}
                </Button>
              ))}
            </div>
          </div>

          <figure className="col-span-12 lg:col-span-7 xl:col-span-8">
            <section
              aria-label={d.label}
              // biome-ignore lint/a11y/noNoninteractiveTabindex: a horizontally scrollable region must be keyboard-focusable (WCAG 2.1.1; axe scrollable-region-focusable).
              tabIndex={0}
              className="-mx-5 overflow-x-auto px-5 focus-visible:outline-2 focus-visible:outline-surface-accent sm:mx-0 sm:px-0"
            >
              <svg
                viewBox="0 0 800 480"
                className="hw block h-auto w-full min-w-[640px]"
                aria-hidden="true"
                fill="none"
              >
                <g className="hw-part" data-on="true">
                  <text x={40} y={28} className="dg-label">
                    definitions
                  </text>
                  <Chip x={40} y={62} text={defA[0] ?? ''} />
                  <path d={`M${40 + chipW(defA[0] ?? '')} 62 H${232}`} className="dg-line" />
                  <Chip x={232} y={62} text={defA[1] ?? ''} />
                  <Chip x={40} y={108} text={defB[0] ?? ''} />
                  <path d={`M${40 + chipW(defB[0] ?? '')} 108 H${200}`} className="dg-line" />
                  <Chip x={200} y={108} text={defB[1] ?? ''} />
                  <Chip x={200 + chipW(defB[1] ?? '') + 10} y={108} text={defB[2] ?? ''} />
                </g>
                <g className="hw-part" data-on={on(COMPILE)}>
                  <Chip x={800 - 40 - chipW(d.build)} y={62} text={d.build} strong />
                  <path d="M40 152 H760" className="dg-line dg-dash" />
                </g>

                {d.chains.map((c, ci) => {
                  const y = 236 + ci * 120
                  const ok = c.outcome === 'supported'
                  const reach = ok ? END : (NODES[c.steps.length - 1] ?? NODES[0] ?? 0)
                  const qEnd = 40 + chipW(c.query)
                  return (
                    <g key={c.query}>
                      <g className="hw-part" data-on={on(COMPILE)}>
                        <path d={`M${qEnd} ${y} H${END}`} className="dg-line" />
                        {c.steps.map((s, i) => (
                          <g key={s}>
                            <circle cx={NODES[i]} cy={y} r={4} className="dg-node" />
                            <text x={NODES[i]} y={y + 28} textAnchor="middle" className="dg-label">
                              {s}
                            </text>
                          </g>
                        ))}
                        <text x={END} y={y + 28} textAnchor="middle" className="dg-label">
                          {c.end}
                        </text>
                      </g>
                      <g className="hw-part" data-on={on(ASK)}>
                        <Chip x={40} y={y} text={c.query} strong />
                      </g>
                      <g className="hw-draw" data-on={on(CHECK)}>
                        <path d={`M${qEnd} ${y} H${reach}`} className="dg-accent" pathLength={1} />
                        {!ok && <path d={`M${reach + 8} ${y} H${END - 10}`} className="dg-line dg-dash" />}
                      </g>
                      <g className="hw-part" data-on={on(CHECK)}>
                        {ok ? (
                          <circle cx={END} cy={y} r={7} className="dg-dot" />
                        ) : (
                          <circle cx={END} cy={y} r={6.5} className="dg-hollow" />
                        )}
                        <text x={END + 18} y={y + 4} className="dg-label-strong">
                          {c.note.split(' · ')[0]}
                        </text>
                        {c.note.includes(' · ') && (
                          <text x={END - 120} y={y - 18} className="dg-label">
                            {c.note.split(' · ')[1]}
                          </text>
                        )}
                      </g>
                      {ok && (
                        <g className="hw-part" data-on={on(REPLAY)}>
                          <path d={`M${qEnd} ${y - 14} H${END}`} className="dg-accent dg-dash hw-ghost" />
                        </g>
                      )}
                    </g>
                  )
                })}

                <g className="hw-part" data-on={on(REPLAY)}>
                  <path d="M40 440 H760" className="dg-line dg-dash" />
                  <text x={40} y={466} className="dg-label">
                    {d.replay}
                  </text>
                </g>
              </svg>
            </section>
            <figcaption className="mt-6 font-mono text-label text-surface-subtle">{how.caption}</figcaption>
          </figure>
        </div>
      </Container>
    </section>
  )
}
