'use client'

import { Button } from '@/components/ui/Button'
import { StatusChip } from '@/components/ui/Chip'
import { CONSOLE_UI } from '@/content/console/ui'
import { WORLDS } from '@/content/console/worlds'
import type { Outcome } from '@/lib/console/types'
import { keepNumberUnits } from '@/lib/format'
import { useConsoleSession } from './ConsoleSession'

const { usage } = CONSOLE_UI
const OUTCOMES: readonly Outcome[] = [
  'SUPPORTED',
  'NO_SUPPORTED_PROOF',
  'CONFLICT',
  'REFUSED',
  'RESOURCE_LIMIT',
]
const FILL: Record<Outcome, string> = {
  SUPPORTED: 'fill-supported',
  NO_SUPPORTED_PROOF: 'fill-unproven',
  CONFLICT: 'fill-conflict',
  REFUSED: 'fill-refused',
  RESOURCE_LIMIT: 'fill-surface-subtle',
}

function median(values: readonly number[]): number {
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? (s[mid] ?? 0) : ((s[mid - 1] ?? 0) + (s[mid] ?? 0)) / 2
}

/** A labelled horizontal bar: SVG presentation attributes only (no inline styles under the CSP). */
function Bar({ value, max, fill }: { value: number; max: number; fill: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 6" preserveAspectRatio="none" className="h-1.5 w-full">
      <rect width="100" height="6" rx="1" className="fill-surface-rule" />
      <rect width={max ? (value / max) * 100 : 0} height="6" rx="1" className={fill} />
    </svg>
  )
}

/** This tab's activity, computed from the in-memory session only (CONSOLE §9). */
export function UsageView() {
  const { entries } = useConsoleSession()
  const results = entries.flatMap((e) => (e.result ? [e.result] : []))

  if (entries.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-surface-rule px-6 py-14 text-center">
        <p className="text-body text-surface-muted">{usage.empty}</p>
        <Button href="/console" arrow className="mt-6">
          {usage.open}
        </Button>
        <p className="mt-8 text-caption text-surface-subtle">{usage.note}</p>
      </div>
    )
  }

  const counts = OUTCOMES.map((o) => ({ o, n: results.filter((r) => r.outcome === o).length }))
  const worlds = WORLDS.map((w) => ({ w, n: entries.filter((e) => e.worldId === w.id).length }))
  const top = Math.max(...counts.map((c) => c.n), 1)
  const topWorld = Math.max(...worlds.map((w) => w.n), 1)
  const ms = median(results.map((r) => r.ms))

  return (
    <div className="space-y-6">
      <h2 className="font-mono text-label text-surface-subtle uppercase">{usage.title}</h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        {[
          { label: usage.asked, value: String(entries.length) },
          { label: usage.median, value: keepNumberUnits(`${ms < 0.1 ? '<0.1' : ms.toFixed(1)} ms`) },
        ].map((s) => (
          <div
            key={s.label}
            data-console-panel
            className="rounded-md border border-surface-rule bg-surface px-5 py-4"
          >
            <dt className="text-small text-surface-muted">{s.label}</dt>
            <dd className="mt-1 font-display text-display-s tabular-nums lining-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 md:grid-cols-2">
        <section data-console-panel className="rounded-md border border-surface-rule bg-surface px-5 py-5">
          <h3 className="text-small font-semibold">{usage.outcomes}</h3>
          <ul className="mt-4 space-y-3.5">
            {counts.map(({ o, n }) => (
              <li key={o}>
                <div className="flex items-center justify-between gap-3">
                  <StatusChip outcome={CONSOLE_UI.chip[o]} />
                  <span className="font-mono text-code tabular-nums">{n}</span>
                </div>
                <div className="mt-2">
                  <Bar value={n} max={top} fill={FILL[o]} />
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section data-console-panel className="rounded-md border border-surface-rule bg-surface px-5 py-5">
          <h3 className="text-small font-semibold">{usage.worlds}</h3>
          <ul className="mt-4 space-y-3.5">
            {worlds.map(({ w, n }) => (
              <li key={w.id}>
                <div className="flex items-center justify-between gap-3 text-small">
                  <span>{w.name}</span>
                  <span className="font-mono text-code tabular-nums">{n}</span>
                </div>
                <div className="mt-2">
                  <Bar value={n} max={topWorld} fill="fill-surface-fg" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="text-caption text-surface-subtle">{usage.note}</p>
    </div>
  )
}
