import type { ReactNode } from 'react'
import { type InlineNode, parseInline } from '@/lib/inline'
import { SmartLink } from './SmartLink'

function render(nodes: readonly InlineNode[], prefix: string): ReactNode[] {
  return nodes.map((node, i) => {
    const key = `${prefix}${i}`
    switch (node.type) {
      case 'text':
        return node.value
      case 'code':
        return <code key={key}>{node.value}</code>
      case 'strong':
        return <strong key={key}>{render(node.children, `${key}.`)}</strong>
      case 'em':
        return <em key={key}>{render(node.children, `${key}.`)}</em>
    }
    return (
      <SmartLink key={key} href={node.href} className="link-prose">
        {render(node.children, `${key}.`)}
      </SmartLink>
    )
  })
}

/** Renders a content string's inline markup (bold, italic, code, links) as React nodes. */
export function Inline({ text }: { text: string }) {
  return <>{render(parseInline(text), '')}</>
}
