import { ui } from '@/content/ui'
import { cx } from '@/lib/cx'
import { Tag } from './Chip'
import { CopyButton } from './CopyButton'

/**
 * Mono code on paper-2 (light) or ink-2 (dark), no syntax rainbow (DESIGN §9.10): a header row with
 * the language or label, an optional "Illustrative" tag, and a copy button.
 */
export function CodeBlock({
  code,
  label,
  illustrative = false,
  className,
}: {
  code: string
  label: string
  /** true = the standard "Illustrative" tag; a string replaces its wording. */
  illustrative?: boolean | string
  className?: string
}) {
  return (
    <figure className={cx('code-block border border-surface-rule', className)}>
      <figcaption className="flex min-h-10 items-center gap-3 border-b border-surface-rule py-1.5 pr-1 pl-4">
        <span className="font-mono text-label text-surface-subtle">{label}</span>
        {illustrative && <Tag>{illustrative === true ? ui.illustrative : illustrative}</Tag>}
        <CopyButton text={code} label={ui.copy} className="ml-auto" />
      </figcaption>
      {/* Wraps instead of scrolling: a horizontal scroller would need keyboard focus (axe), and wrapped
          lines read better on a phone. */}
      <pre className="p-5 font-mono text-code whitespace-pre-wrap [overflow-wrap:anywhere]">
        <code>{code}</code>
      </pre>
    </figure>
  )
}
