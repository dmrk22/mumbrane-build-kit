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

// Single Latin or lowercase Greek letters are variables (italic, as TeX sets them); runs of two or
// more Latin letters are names (cost, sin) and stay upright, as do capitals like Γ and operators.
const TOKEN = /([A-Za-z]{2,})|([a-zα-ω](?![A-Za-z]))|([^A-Za-zα-ω]+|[A-Z])/g

/** A formula in the serif with TeX's italics for variables. Decorative callers add aria-hidden. */
export function Formula({ text, className }: { text: string; className?: string }) {
  const parts = [...text.matchAll(TOKEN)].map((m, i) => {
    const key = `${i}${m[0]}`
    return m[2] ? (
      <i key={key} className="font-serif-italic">
        {m[2]}
      </i>
    ) : (
      <span key={key}>{m[0]}</span>
    )
  })
  return <span className={className}>{parts}</span>
}

/** The end-of-proof tombstone, drawn as a square (the fallback glyph is a tall bar). */
export function Qed({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-[0.62em] bg-current align-baseline ${className ?? ''}`}
    />
  )
}
