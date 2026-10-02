import { cx } from '@/lib/cx'
import { keepNumberUnits } from '@/lib/format'

/**
 * Evidence tables (DESIGN §9.8): full width, 1 px rules, a mono header row on paper-3, numbers
 * in the body face; the caption above names the source. The site's evidence tables have two columns and
 * wrap to fit 320 px, so nothing needs a keyboard-scrollable region (the wrapper only guards).
 */
export function DataTable({
  caption,
  source,
  columns,
  rows,
  className,
}: {
  caption: string
  source?: string
  columns: readonly string[]
  rows: readonly (readonly string[])[]
  className?: string
}) {
  return (
    <div className={cx('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-left">
        <caption className="mb-3 text-left text-caption text-surface-muted">
          {caption}
          {source && <span className="text-surface-subtle"> — {source}</span>}
        </caption>
        <thead>
          <tr data-surface="paper" className="bg-paper-3 font-mono text-label">
            {columns.map((c, i) => (
              <th key={c} scope="col" className={cx('px-3 py-3 font-medium sm:px-4', i > 0 && 'text-right')}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-b border-surface-rule">
              {r.map((cell, i) => {
                const Cell = i === 0 ? 'th' : 'td'
                return (
                  <Cell
                    key={`${r[0]}-${columns[i]}`}
                    scope={i === 0 ? 'row' : undefined}
                    className={cx(
                      'px-3 py-4 align-top text-small sm:px-4',
                      // No tabular-nums: Fustat's tnum also widens spaces and commas ("2 ,115").
                      i === 0 ? 'font-normal' : 'text-right',
                    )}
                  >
                    {keepNumberUnits(cell)}
                  </Cell>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
