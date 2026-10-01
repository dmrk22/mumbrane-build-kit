import type { Block } from '@/content/blocks'
import { CodeBlock } from './CodeBlock'
import { DataTable } from './DataTable'
import { Inline } from './Inline'
import { Note } from './Note'
import { SmartLink } from './SmartLink'

/** Renders typed blocks inside <Prose> (DESIGN §9.11). Figures render through the page template. */
export function Blocks({ blocks }: { blocks: readonly Block[] }) {
  return blocks.map((b, i) => {
    const key = `${b.type}-${i}`
    switch (b.type) {
      case 'p':
        return (
          <p key={key}>
            <Inline text={b.text} />
          </p>
        )
      case 'h2':
        return (
          <h2 key={key} id={b.id}>
            <Inline text={b.text} />
          </h2>
        )
      case 'h3':
        return (
          <h3 key={key} id={b.id}>
            <Inline text={b.text} />
          </h3>
        )
      case 'list': {
        const L = b.ordered ? 'ol' : 'ul'
        return (
          <L key={key}>
            {b.items.map((it) => (
              <li key={it}>
                <Inline text={it} />
              </li>
            ))}
          </L>
        )
      }
      case 'quote':
        return (
          <blockquote key={key}>
            <Inline text={b.text} />
          </blockquote>
        )
      case 'code':
        return (
          <div key={key} className="not-prose font-sans">
            <CodeBlock code={b.text} label={b.label ?? b.lang} illustrative={b.illustrative ?? false} />
          </div>
        )
      case 'table':
        return (
          <div key={key} className="not-prose font-sans">
            <DataTable
              caption={b.caption}
              columns={b.columns}
              rows={b.rows}
              {...(b.source ? { source: b.source } : {})}
            />
          </div>
        )
      case 'note':
        return (
          <div key={key} className="not-prose font-sans">
            <Note tone={b.tone}>
              <p>
                <Inline text={b.text} />
              </p>
            </Note>
          </div>
        )
      case 'callout':
        return (
          <aside key={key} className="not-prose border-l-2 border-moss pl-6 font-sans">
            <p className="text-title">{b.title}</p>
            <p className="mt-2 font-sans text-body text-surface-muted">
              <Inline text={b.text} />
            </p>
            {b.link && (
              <SmartLink href={b.link.href} className="link-prose mt-3 inline-block text-small">
                {b.link.label}
              </SmartLink>
            )}
          </aside>
        )
    }
    return null // figures: rendered by the page template
  })
}
