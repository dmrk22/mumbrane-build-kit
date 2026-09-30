import { CodeBlock } from '@/components/ui/CodeBlock'
import { Inline } from '@/components/ui/Inline'
import { MOTH } from '@/content/moth'

/** The language contract module shared by /moth and /developers/models (PAGES §2.6, §11.3). */
export function LanguageContract() {
  const c = MOTH.contract
  return (
    <div className="flex flex-col gap-10">
      <p className="max-w-[64ch] text-body">{c.rules}</p>
      <CodeBlock code={c.examples} label={c.examplesLabel} className="max-w-3xl" />
      <p className="max-w-[64ch] text-body text-surface-muted">{c.skills}</p>
      <div>
        <dl className="grid grid-cols-2 border-t border-l border-surface-rule sm:grid-cols-3 lg:grid-cols-5">
          {c.limits.map((l) => (
            <div key={l.claim} className="flex flex-col gap-2 border-r border-b border-surface-rule p-5">
              <dt className="order-2 text-caption text-surface-muted">{l.label}</dt>
              <dd className="order-1 font-mono text-title tabular-nums">{l.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 max-w-[64ch] text-caption text-surface-muted">
          <Inline text={c.limitsNote} />
        </p>
      </div>
    </div>
  )
}
