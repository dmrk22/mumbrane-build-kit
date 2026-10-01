import { Icon } from '@/components/ui/Icon'
import { SmartLink } from '@/components/ui/SmartLink'
import { CONSOLE_UI } from '@/content/console/ui'
import { WORLDS } from '@/content/console/worlds'
import { ask, makeBuild } from '@/lib/console/sim'
import { cx } from '@/lib/cx'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/console')

const { entry } = CONSOLE_UI
const DOT = {
  supported: 'bg-supported',
  unproven: 'bg-unproven',
  conflict: 'bg-conflict',
  refused: 'bg-refused',
  limit: 'bg-limit border border-surface-fg/30',
} as const

// CONSOLE §3: one sentence of honesty, four worlds, a footnote. No credential fields, no sign-in.
export default function ConsoleEntry() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 pt-10 pb-16 md:px-10 md:pt-16">
      <h1 className="font-serif text-display-s">{entry.title}</h1>
      <p className="mt-4 max-w-[58ch] text-body text-surface-muted">{entry.text}</p>
      <ol className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-label text-surface-subtle uppercase">
        {entry.steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <span className="tabular-nums text-surface-fg">{String(i + 1).padStart(2, '0')}</span>
            <span>{s}</span>
            {i < entry.steps.length - 1 && <Icon name="arrow-right" className="size-3.5" />}
          </li>
        ))}
      </ol>

      <h2 className="sr-only">{entry.worlds}</h2>
      <ul className="mt-10 grid gap-4 md:grid-cols-2 md:gap-5">
        {WORLDS.map((w) => {
          const build = makeBuild(w, null)
          const main = w.definitions.at(-1)
          const outcomes = w.examples.map((q) => ({ q, outcome: ask(w, build, q, q).outcome }))
          return (
            <li
              key={w.id}
              data-console-panel
              className="group relative flex min-w-0 flex-col rounded-md border border-surface-rule bg-surface transition-[border-color] duration-(--duration-hover) ease-out focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-surface-accent hover:border-surface-fg/40"
            >
              <div className="flex items-center justify-between gap-3 border-b border-surface-rule px-5 py-2.5 font-mono text-label tracking-normal text-surface-subtle">
                <span className="shrink-0 text-surface-fg">{w.id}.world</span>
                <span className="hidden min-w-0 truncate sm:block">
                  {entry.counts(w.entities.length, w.definitions.length, w.facts.length)}
                </span>
              </div>
              <div className="flex flex-1 flex-col px-5 pt-5 pb-4">
                <h3 className="font-sans text-title">
                  <SmartLink
                    href={`/console/playground?world=${w.id}`}
                    className="outline-none after:absolute after:inset-0"
                  >
                    {w.name}
                  </SmartLink>
                </h3>
                <p className="mt-1.5 text-small text-surface-muted">{w.blurb}</p>
                {main && (
                  <p className="mt-5 rounded-sm border border-surface-rule bg-surface-raise px-3.5 py-3 font-mono text-code text-surface-muted">
                    {main.text}
                  </p>
                )}
                <div className="mt-auto flex items-center gap-3 pt-5">
                  <p className="text-caption text-surface-subtle">{entry.examples(outcomes.length)}</p>
                  <span aria-hidden="true" className="flex gap-1">
                    {outcomes.map(({ q, outcome }) => (
                      <span key={q} className={cx('size-2.5 rounded-xs', DOT[CONSOLE_UI.chip[outcome]])} />
                    ))}
                  </span>
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
        <span aria-hidden="true"> →</span>
      </p>
    </div>
  )
}
