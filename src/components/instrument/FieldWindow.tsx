import { StatusChip } from '@/components/ui/Chip'
import { Inline } from '@/components/ui/Inline'
import type { FieldExample } from '@/content/solutions'
import { InstrumentWindow } from './InstrumentWindow'

/**
 * A field as an instrument window (DESIGN §9.6): DEFINE, FACTS, then each question with its
 * outcome and reason as ledger rows. Static — the home page's pinned demo animates the same parts.
 */
export function FieldWindow({
  field,
  tag,
  tags,
  className,
}: {
  field: FieldExample
  tag: string
  tags: { define: string; facts: string; ask: string }
  className?: string
}) {
  return (
    <InstrumentWindow title={field.title} tag={tag} footer {...(className ? { className } : {})}>
      <div className="flex flex-col gap-4">
        <div>
          <span className="demo-tag">{tags.define}</span>
          {field.define.map((d) => (
            <p key={d} className="mt-2">
              {d}
            </p>
          ))}
        </div>
        <div>
          <span className="demo-tag">{tags.facts}</span>
          {field.facts.map((f) => (
            <p key={f} className="mt-2">
              <Inline text={f} />
            </p>
          ))}
        </div>
        <div>
          <span className="demo-tag">{tags.ask}</span>
          <ul className="mt-2 divide-y divide-dashed divide-surface-rule border-y border-dashed border-surface-rule">
            {field.questions.map((q) => (
              <li key={q.entity} className="flex flex-col gap-2 py-3">
                {/* One text box: bare inline nodes would each become a flex item. */}
                <p>
                  <Inline text={q.ask} />
                </p>
                <span className="flex flex-wrap items-center gap-3">
                  <StatusChip outcome={q.outcome} />
                  <span className="text-surface-muted">{q.reason}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </InstrumentWindow>
  )
}
