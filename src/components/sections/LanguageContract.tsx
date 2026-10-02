import { CodeBlock } from '@/components/ui/CodeBlock'
import { Inline } from '@/components/ui/Inline'
import { MOTH } from '@/content/moth'

/**
 * The language contract module shared by /moth, /developers/models and /developers/docs
 * (PAGES §2.6, §11). `limits={false}` leaves the limits grid to a separate section.
 */
export function LanguageContract({ limits = true }: { limits?: boolean }) {
  const c = MOTH.contract
  return (
    <div className="flex flex-col gap-10">
      <p className="max-w-text text-body">{c.rules}</p>
      <CodeBlock code={c.examples} label={c.examplesLabel} className="max-w-3xl" />
      <p className="max-w-text text-body text-surface-muted">{c.skills}</p>
      {limits && <LimitsGrid />}
    </div>
  )
}

/** The documented language limits with their note (claims.test.ts checks every value). */
export function LimitsGrid() {
  const c = MOTH.contract
  return (
    <div>
      {/* One rounded frame; the cells' outer right/bottom rules tuck 1 px under its clipped edge. */}
      <div data-limits className="overflow-hidden rounded-md border border-surface-rule">
        <dl className="-mr-px -mb-px grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {c.limits.map((l) => (
            <div key={l.claim} className="flex flex-col gap-2 border-r border-b border-surface-rule p-5">
              <dt className="order-2 text-caption text-surface-muted">{l.label}</dt>
              <dd className="order-1 font-mono text-title tabular-nums">{l.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="mt-4 max-w-text text-caption text-surface-muted">
        <Inline text={c.limitsNote} />
      </p>
    </div>
  )
}
