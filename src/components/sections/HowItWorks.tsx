'use client'

import { useRef, useState } from 'react'
import { CropMarks } from '@/components/art/CropMarks'
import { Container } from '@/components/layout/Container'
import { usePinnedSteps } from '@/components/motion/usePinnedSteps'
import { Button } from '@/components/ui/Button'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import type { HOME } from '@/content/home'
import { cx } from '@/lib/cx'

type How = (typeof HOME)['how']
type Pt = readonly [number, number]

const ENCODE = 1
const ASK = 2
const SETTLE = 3
const REPLAY = 4

const CHAR = 6.6 // Commit Mono at 11 px, per character (measured in Chromium)
const chipW = (text: string) => Math.round(text.length * CHAR + 22)
const pad = (n: number) => String(n).padStart(2, '0')

// The field map (viewBox 800 × 500): each question's route, station by station. The first runs
// down into the answer's basin; the second ends where no definition leads on.
const LANES = [214, 404] as const
const ROUTES: readonly (readonly Pt[])[] = [
  [
    [190, 214],
    [345, 196],
    [495, 240],
    [664, 312],
  ],
  [
    [190, 404],
    [350, 420],
    [512, 394],
  ],
]
const BASIN = [16, 30, 46, 64, 86, 110] // contour rings around the supported answer
const WELL = [9, 16] // around each fact on record

/** A smooth curve through the points (Catmull–Rom as cubic Béziers). */
function curve(points: readonly Pt[]): string {
  const at = (i: number): Pt => points[Math.min(points.length - 1, Math.max(0, i))] ?? [0, 0]
  let d = `M${at(0)[0]} ${at(0)[1]}`
  for (let i = 1; i < points.length; i++) {
    const [p0, p1, p2, p3] = [at(i - 2), at(i - 1), at(i), at(i + 1)]
    const c1 = `${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)}`
    const c2 = `${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)}`
    d += ` C${c1} ${c2} ${p2[0]} ${p2[1]}`
  }
  return d
}

function Chip({ x, y, text, strong = false }: { x: number; y: number; text: string; strong?: boolean }) {
  const w = chipW(text)
  return (
    <g>
      <rect x={x} y={y - 11} width={w} height={22} rx={10} className={strong ? 'dg-hollow' : 'dg-chip'} />
      <text x={x + w / 2} y={y + 4} textAnchor="middle" className={strong ? 'dg-label-strong' : 'dg-label'}>
        {text}
      </text>
    </g>
  )
}

/**
 * The hero's field seen from above, behind the whole section: equipotential rings (closer near
 * the well, as on a funnel) crossed by field lines. Decorative, static, a few dozen elements.
 */
function Backdrop() {
  const rings = Array.from({ length: 14 }, (_, k) => Math.round(30 * 1.28 ** (k + 1)))
  const spokes = Array.from({ length: 36 }, (_, k) => (k * Math.PI) / 18)
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className="hw-backdrop pointer-events-none absolute inset-0 size-full"
      fill="none"
      aria-hidden="true"
    >
      <g transform="translate(1180 470)">
        {spokes.map((a) => (
          <path
            key={a}
            d={`M${Math.round(70 * Math.cos(a))} ${Math.round(70 * Math.sin(a))}L${Math.round(1500 * Math.cos(a))} ${Math.round(1500 * Math.sin(a))}`}
            className="hw-spoke"
          />
        ))}
        {rings.map((r, k) => (
          <circle key={r} r={r} className={k % 4 === 3 ? 'hw-ring hw-index' : 'hw-ring'} />
        ))}
      </g>
      <g transform="translate(620 140)">
        {[22, 40, 62, 88].map((r) => (
          <circle key={r} r={r} className="hw-ring" />
        ))}
      </g>
    </svg>
  )
}

/**
 * How Moth works, as a map of the field (D-138): the purchasing world's definitions, its facts as
 * wells, two questions, and where each comes to rest — one in its answer's basin, one stopped
 * where no definition leads on. Desktop with motion: the section pins and scroll walks the five
 * steps. Everywhere else, and before the motion code arrives, the finished map shows. The text
 * stays in the accessibility tree through the step list; the drawing is decorative.
 */
export function HowItWorks({ how }: { how: How }) {
  const ref = useRef<HTMLElement>(null)
  const last = how.steps.length - 1
  const [step, setStep] = useState(last)
  const goTo = usePinnedSteps(ref, { steps: how.steps.length, distanceVh: 200, onStep: setStep })
  const on = (k: number) => String(step >= k)
  const d = how.diagram
  const now = how.steps[step]

  return (
    <section
      ref={ref}
      id="how-moth-works"
      data-surface="ink"
      aria-labelledby="how-title"
      className="relative flex items-center overflow-x-clip py-20 md:py-28 lg:min-h-dvh lg:pt-24 lg:pb-12"
    >
      <Backdrop />
      <Container className="relative">
        <div className="grid grid-cols-12 items-center gap-x-4 gap-y-14 lg:gap-x-10">
          <div className="col-span-12 lg:col-span-5 xl:col-span-4">
            <Eyebrow dot>{how.eyebrow}</Eyebrow>
            <Heading level={2} size="display-s" id="how-title" className="mt-5 max-w-[16ch]">
              {how.title}
            </Heading>
            <p className="mt-6 max-w-[44ch] text-body text-surface-muted">{how.lede}</p>
            <ol className="mt-10 border-l border-surface-rule">
              {how.steps.map((s, i) => {
                const active = i === step
                return (
                  <li key={s.name}>
                    <button
                      type="button"
                      aria-current={active ? 'step' : undefined}
                      onClick={() => goTo(i) || setStep(i)}
                      className={cx(
                        'group -ml-px grid w-full grid-cols-[2.25rem_1fr] items-baseline border-l py-2.5 pl-5 text-left transition-colors duration-(--duration-ui)',
                        i <= step ? 'border-surface-accent' : 'border-transparent',
                      )}
                    >
                      <span
                        className={cx(
                          'font-mono text-label tabular-nums transition-colors duration-(--duration-ui)',
                          active ? 'text-surface-accent' : 'text-surface-subtle',
                        )}
                      >
                        {pad(i + 1)}
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
            <CropMarks>
              {/* The ground lets the backdrop's rings show through faintly: one field, inside and out. */}
              <div data-square className="overflow-hidden border border-surface-rule bg-surface/80">
                <div
                  aria-hidden="true"
                  className="flex items-center justify-between gap-4 border-surface-rule border-b px-5 py-3 font-mono text-label text-surface-subtle"
                >
                  <span>{d.world}</span>
                  <span className="tabular-nums">
                    {pad(step + 1)} / {pad(how.steps.length)} · {now?.name.toLowerCase()}
                  </span>
                </div>
                <section
                  aria-label={d.label}
                  // biome-ignore lint/a11y/noNoninteractiveTabindex: a horizontally scrollable region must be keyboard-focusable (WCAG 2.1.1; axe scrollable-region-focusable).
                  tabIndex={0}
                  className="dot-screen overflow-x-auto [--dot-color:color-mix(in_oklab,var(--surface-subtle)_18%,transparent)] focus-visible:outline-2 focus-visible:outline-surface-accent"
                >
                  <svg
                    viewBox="0 0 800 500"
                    className="hw block h-auto w-full min-w-[640px]"
                    aria-hidden="true"
                    fill="none"
                  >
                    <g className="hw-part" data-on="true">
                      <text x={32} y={30} className="dg-label">
                        {d.definitionsLabel}
                      </text>
                      {d.definitions.map((def, i) => {
                        const x = 32 + i * 380
                        return (
                          <g key={def.term}>
                            <rect x={x} y={44} width={356} height={58} rx={10} className="dg-chip" />
                            <text x={x + 16} y={68} className="dg-label-strong">
                              {def.term}
                            </text>
                            <text x={x + 16} y={88} className="dg-label">
                              {def.means}
                            </text>
                          </g>
                        )
                      })}
                      <path d="M32 132 H768" className="dg-line dg-dash" />
                      <text x={32} y={156} className="dg-label">
                        {d.fieldLabel}
                      </text>
                    </g>

                    {/* Encode: the field forms — a basin around the answer, a well around each fact. */}
                    <g className="hw-part" data-on={on(ENCODE)}>
                      <Chip x={768 - chipW(d.build)} y={156} text={d.build} strong />
                      {BASIN.map((r) => (
                        <circle key={r} cx={664} cy={312} r={r} className="dg-line hw-contour" />
                      ))}
                      {ROUTES.flatMap((route) =>
                        route
                          .slice(0, 2)
                          .flatMap(([x, y]) =>
                            WELL.map((r) => (
                              <circle
                                key={`${x},${y},${r}`}
                                cx={x}
                                cy={y}
                                r={r}
                                className="dg-line hw-contour"
                              />
                            )),
                          ),
                      )}
                    </g>

                    {d.chains.map((c, ci) => {
                      const y = LANES[ci] ?? 0
                      const route = ROUTES[ci] ?? []
                      const ok = c.outcome === 'supported'
                      const start: Pt = [32 + chipW(c.query), y]
                      const reached = ok ? route : route.slice(0, -1)
                      const end = route.at(-1) ?? start
                      const stop = reached.at(-1) ?? start
                      return (
                        <g key={c.query}>
                          <g className="hw-part" data-on="true">
                            {c.steps.map((s, i) => {
                              const [x, sy] = route[i] ?? start
                              return (
                                <g key={s}>
                                  <circle cx={x} cy={sy} r={4} className="dg-node" />
                                  <text x={x} y={sy + 28} textAnchor="middle" className="dg-label">
                                    {s}
                                  </text>
                                </g>
                              )
                            })}
                            {ok && (
                              <text x={end[0]} y={end[1] + 30} textAnchor="middle" className="dg-label">
                                {c.end}
                              </text>
                            )}
                          </g>
                          <g className="hw-part" data-on={on(ENCODE)}>
                            <path d={curve([start, ...route])} className="dg-line hw-route" />
                          </g>
                          <g className="hw-part" data-on={on(ASK)}>
                            <Chip x={32} y={y} text={c.query} strong />
                          </g>
                          <g className="hw-draw" data-on={on(SETTLE)}>
                            <path d={curve([start, ...reached])} className="dg-accent" pathLength={1} />
                            {!ok && (
                              <path
                                d={`M${stop[0] + 10} ${stop[1]} L${end[0] - 10} ${end[1]}`}
                                className="dg-line dg-dash"
                              />
                            )}
                          </g>
                          <g className="hw-part" data-on={on(SETTLE)}>
                            {ok ? (
                              <>
                                <circle cx={end[0]} cy={end[1]} r={7} className="dg-dot" />
                                <circle cx={end[0]} cy={end[1]} r={13} className="dg-accent hw-halo" />
                                <text x={end[0] + 24} y={end[1] + 4} className="dg-label-strong">
                                  {c.note}
                                </text>
                              </>
                            ) : (
                              <>
                                <circle cx={end[0]} cy={end[1]} r={6.5} className="dg-hollow" />
                                <text x={end[0]} y={end[1] + 28} textAnchor="middle" className="dg-label">
                                  {c.end}
                                </text>
                                <text x={end[0] + 22} y={end[1] + 4} className="dg-label-strong">
                                  {c.note.split(' · ')[0]}
                                </text>
                                <text
                                  x={(stop[0] + end[0]) / 2}
                                  y={Math.min(stop[1], end[1]) - 16}
                                  textAnchor="middle"
                                  className="dg-label"
                                >
                                  {c.note.split(' · ')[1]}
                                </text>
                              </>
                            )}
                          </g>
                          {ok && (
                            <g className="hw-part" data-on={on(REPLAY)}>
                              <path
                                d={curve([start, ...route].map(([x, ry]) => [x, ry - 14] as const))}
                                className="dg-accent dg-dash hw-ghost"
                              />
                            </g>
                          )}
                        </g>
                      )
                    })}

                    <g className="hw-part" data-on={on(REPLAY)}>
                      <path d="M32 462 H768" className="dg-line dg-dash" />
                      <text x={32} y={486} className="dg-label">
                        {d.replay}
                      </text>
                      <path d="M0 140 V456" className="dg-accent hw-scan" data-on={on(REPLAY)} />
                    </g>
                  </svg>
                </section>
              </div>
            </CropMarks>
            <ul
              aria-hidden="true"
              className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-label text-surface-subtle"
            >
              {(
                [
                  ['record', <circle key="m" cx={11} cy={5} r={3.5} className="dg-node" />],
                  ['missing', <circle key="m" cx={11} cy={5} r={3.5} className="dg-hollow" />],
                  ['route', <path key="m" d="M1 5 H21" className="dg-accent" />],
                  ['none', <path key="m" d="M1 5 H21" className="dg-line dg-dash" />],
                ] as const
              ).map(([k, mark]) => (
                <li key={k} className="flex items-center gap-2">
                  <svg viewBox="0 0 22 10" className="h-2.5 w-5.5" fill="none" aria-hidden="true">
                    {mark}
                  </svg>
                  {d.legend[k]}
                </li>
              ))}
            </ul>
            <figcaption className="mt-4 font-mono text-label text-surface-subtle">{how.caption}</figcaption>
          </figure>
        </div>
      </Container>
    </section>
  )
}
