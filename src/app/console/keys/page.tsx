import { KeysDemo } from '@/components/console/KeysDemo'
import { Icon } from '@/components/ui/Icon'
import { CONSOLE_UI } from '@/content/console/ui'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/console/keys')

const { keys } = CONSOLE_UI

// CONSOLE §9: how key management will work, with nothing created, displayed or stored.
export default function KeysPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 pt-8 pb-16 md:px-10 md:pt-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="flex max-w-[52ch] items-start gap-2.5 text-body text-surface-muted">
          <Icon name="lock" className="mt-0.5 text-surface-subtle" />
          {keys.note}
        </p>
        <KeysDemo />
      </div>
      <table className="mt-8 w-full border-separate border-spacing-0 overflow-hidden rounded-md border border-surface-rule text-left">
        <thead data-console-panel className="bg-surface">
          <tr>
            {keys.columns.map((c) => (
              <th
                key={c}
                scope="col"
                className="border-b border-surface-rule px-4 py-2.5 font-serif-italic text-small font-normal text-surface-subtle"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={keys.columns.length} className="px-4 py-14 text-center">
              <span className="mx-auto mb-3 grid size-10 place-items-center rounded-full border border-surface-rule text-surface-subtle">
                <Icon name="key" />
              </span>
              <span className="text-small text-surface-muted">{keys.empty}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
