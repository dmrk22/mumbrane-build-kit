'use client'

import { useState } from 'react'
import { StatusChip, Tag } from '@/components/ui/Chip'
import { Inline } from '@/components/ui/Inline'
import type { MOTH } from '@/content/moth'
import { cx } from '@/lib/cx'

type Purchasing = (typeof MOTH)['purchasing']
type Mode = 'inspection' | 'audit'

/**
 * The purchase-readiness explainer (PAGES §2.3). Toggling the supplier definition changes the
 * source and marks the build stale; "Rebuild" swaps the results and the build id (320 ms
 * cross-fade) and announces the new outcomes politely. Server HTML shows the inspection build.
 */
export function PurchasingExplainer({ p }: { p: Purchasing }) {
  const [source, setSource] = useState<Mode>('inspection')
  const [built, setBuilt] = useState<Mode>('inspection')
  const [announcement, setAnnouncement] = useState('')
  const stale = source !== built

  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-10 lg:gap-x-6">
      <div className="col-span-12 flex flex-col gap-8 lg:col-span-6">
        <div>
          <h3 className="font-mono text-label text-surface-subtle">{p.headings.definitions}</h3>
          <div className="mt-4 flex flex-col gap-2 text-lede">
            {p.definitions[source].map((d) => (
              <p key={d}>{d}</p>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-mono text-label text-surface-subtle">{p.headings.facts}</h3>
          <ul className="mt-4 flex flex-col gap-2 text-body">
            {p.facts.map((f) => (
              <li key={f}>
                <Inline text={f} />
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-surface-rule pt-6">
          <button
            type="button"
            role="switch"
            aria-checked={source === 'audit'}
            onClick={() => setSource(source === 'audit' ? 'inspection' : 'audit')}
            className="group inline-flex min-h-11 items-center gap-3 text-small"
          >
            <span
              aria-hidden="true"
              className={cx(
                'relative h-6 w-10 rounded-md border transition-colors duration-(--duration-micro)',
                source === 'audit' ? 'border-ink bg-ink' : 'border-text-3 bg-paper',
              )}
            >
              <span
                className={cx(
                  'absolute top-0.5 size-4.5 rounded-md transition-transform duration-(--duration-ui) ease-out',
                  source === 'audit' ? 'translate-x-4.5 bg-paper' : 'translate-x-0.5 bg-text-2',
                )}
              />
            </span>
            {p.toggle}
          </button>
        </div>
        <div className={cx('flex flex-wrap items-center gap-4', !stale && 'invisible')} aria-hidden={!stale}>
          <p className="flex items-center gap-2 text-small text-ice-fg">
            <span aria-hidden="true" className="size-2 rounded-md bg-ice" />
            {p.changed}
          </p>
          <button
            type="button"
            disabled={!stale}
            onClick={() => {
              setBuilt(source)
              setAnnouncement(p.announce[source])
            }}
            className="inline-flex h-11 items-center rounded-md bg-ink px-5 text-small font-medium text-on-dark transition-[scale] duration-(--duration-micro) active:scale-[0.98] disabled:cursor-not-allowed"
          >
            {p.rebuild}
          </button>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-5 lg:col-start-8">
        <div className="rounded-md border border-surface-rule bg-surface-raise p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-mono text-label text-surface-subtle">{p.headings.results}</h3>
            <Tag>{p.label}</Tag>
          </div>
          <div key={built} className="explainer-swap mt-6">
            <ul className="divide-y divide-surface-rule border-y border-surface-rule">
              {p.results[built].map((r) => (
                <li key={r.entity} className="flex flex-col gap-2 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <code className="font-mono text-code">{r.entity}</code>
                    <StatusChip outcome={r.outcome} />
                  </div>
                  <p className="text-small text-surface-muted">{r.reason}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-label text-surface-subtle">
              {p.headings.build} {p.builds[built]}
            </p>
          </div>
        </div>
        <p className="mt-4 text-caption text-surface-muted">{p.note}</p>
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>
    </div>
  )
}
