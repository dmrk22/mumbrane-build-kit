import { DataTable } from '@/components/ui/DataTable'
import { MOTH } from '@/content/moth'

/** The qualification table and its caveats, shared by /moth and /developers/models. */
export function Qualification() {
  const q = MOTH.qualification
  return (
    <div className="flex flex-col gap-8">
      <DataTable
        caption={q.caption}
        source={q.source}
        columns={q.columns}
        rows={q.rows}
        className="max-w-3xl"
      />
      {q.caveats.map((c) => (
        <p key={c} className="max-w-text text-small text-surface-muted">
          {c}
        </p>
      ))}
    </div>
  )
}
