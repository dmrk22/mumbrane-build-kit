import { Icon } from '@/components/ui/Icon'
import { SmartLink } from '@/components/ui/SmartLink'
import { CONSOLE_UI } from '@/content/console/ui'
import { WORLDS } from '@/content/console/worlds'
import { ask, makeBuild } from '@/lib/console/sim'
import { cx } from '@/lib/cx'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/console')

const { entry } = CONSOLE_UI
// Each example's outcome in the diagram marks: filled = supported, hollow = everything else, in
// its outcome's colour.
const MARK = {
  supported: 'fill-supported stroke-supported',
  unproven: 'fill-none stroke-unproven',
  conflict: 'fill-none stroke-conflict',
  refused: 'fill-none stroke-refused',
  limit: 'fill-none stroke-surface-subtle',
} as const

// CONSOLE §3: one sentence of honesty, four worlds, a footnote. No credential fields, no sign-in.
export default function ConsoleEntry() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-12 pb-20 md:px-10 md:pt-20">
      <h1 className="font-display text-display-m">{entry.title}</h1>
      <p className="mt-5 max-w-[56ch] text-lede text-surface-muted">{entry.text}</p>
      <ol className="mt-12 flex max-w-3xl flex-col gap-4 font-mono text-label text-surface-muted sm:flex-row sm:items-center sm:gap-0">
        {entry.steps.map((s, i) => {
          const last = i === entry.steps.length - 1
          return (
            <li key={s} className={cx('flex items-center gap-3', !last && 'sm:flex-1')}>
              <span
                aria-hidden="true"
                className={cx(
                  'shrink-0 rounded-md',
                  last ? 'size-3 bg-surface-accent' : 'size-2 bg-surface-fg',
                )}
              />
              <span className={cx('whitespace-nowrap', last && 'text-surface-fg')}>{s}</span>
              {!last && (
                <span aria-hidden="true" className="mx-4 hidden h-px flex-1 bg-surface-accent/70 sm:block" />
              )}
            </li>
          )
        })}
      </ol>

      <h2 className="sr-only">{entry.worlds}</h2>
      <ul className="mt-14 grid gap-px overflow-hidden rounded-md border border-surface-rule bg-surface-rule md:grid-cols-2">
        {WORLDS.map((w) => {
          const build = makeBuild(w, null)
          const main = w.definitions.at(-1)
          const outcomes = w.examples.map((q) => ({ q, outcome: ask(w, build, q, q).outcome }))
          return (
            <li
              key={w.id}
              className="group relative flex min-w-0 flex-col bg-surface transition-colors duration-(--duration-hover) ease-out focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-surface-accent hover:bg-surface-raise"
            >
              <div className="flex items-center justify-between gap-3 px-6 pt-6 font-mono text-label tracking-normal text-surface-subtle">
                <span className="shrink-0 text-surface-fg">{w.id}.world</span>
                <span className="hidden min-w-0 truncate sm:block">
                  {entry.counts(w.entities.length, w.definitions.length, w.facts.length)}
                </span>
              </div>
              <div className="flex flex-1 flex-col px-6 pt-8 pb-6">
                <h3 className="font-display text-display-s">
                  <SmartLink
                    href={`/console/playground?world=${w.id}`}
                    className="outline-none after:absolute after:inset-0"
                  >
                    {w.name}
                  </SmartLink>
                </h3>
                <p className="mt-1.5 text-small text-surface-muted">{w.blurb}</p>
                {main && (
                  <p className="mt-6 border-l border-surface-accent/70 pl-4 font-mono text-code text-surface-muted">
                    {main.text}
                  </p>
                )}
                <div className="mt-auto flex items-center gap-3 pt-5">
                  <p className="text-caption text-surface-subtle">{entry.examples(outcomes.length)}</p>
                  <svg aria-hidden="true" viewBox={`0 0 ${outcomes.length * 14} 12`} className="h-3 w-auto">
                    {outcomes.map(({ q, outcome }, i) => (
                      <circle
                        key={q}
                        cx={6 + i * 14}
                        cy={6}
                        r={4}
                        strokeWidth={1.5}
                        className={MARK[CONSOLE_UI.chip[outcome]]}
                      />
                    ))}
                  </svg>
                  <span
                    aria-hidden="true"
                    className="ml-auto flex items-center gap-1.5 font-sans text-small font-medium text-surface-fg"
                  >
                    {entry.open}
                    <Icon
                      name="arrow-right"
                      className="size-4 transition-transform duration-(--duration-hover) ease-out group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-10 max-w-[64ch] text-caption text-surface-subtle">
        {entry.footnote}{' '}
        <SmartLink href={entry.moth.href} className="link-prose">
          {entry.moth.label}
        </SmartLink>
      </p>
    </div>
  )
}
