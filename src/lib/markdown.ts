// Blocks → markdown for the /md/* alternates (PAGES §0.7). No raw HTML: `<` in text is escaped,
// code fences are longer than any backtick run inside them, and internal links become absolute so
// the file stands alone.
import type { Block } from '../content/blocks.ts'
import { publicEnv } from './env.ts'

export type MarkdownMeta = {
  title: string
  description: string
  canonical: string
  published?: string
  updated?: string
  authors?: readonly string[]
}

const yamlString = (s: string) => `"${s.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`

/** Text with inline markup: escape `<`, absolutise internal link targets. */
export function mdText(text: string): string {
  return text
    .replaceAll('<', '&lt;')
    .replace(/\]\((\/[^)]*)\)/g, (_, path: string) => `](${new URL(path, publicEnv.siteUrl).href})`)
}

function fence(code: string, lang: string): string {
  const longest = Math.max(0, ...[...code.matchAll(/`+/g)].map((m) => m[0].length))
  const ticks = '`'.repeat(Math.max(3, longest + 1))
  return `${ticks}${lang}\n${code}\n${ticks}`
}

const cell = (s: string) => mdText(s).replaceAll('|', '\\|')

export function blockToMarkdown(b: Block): string {
  switch (b.type) {
    case 'p':
      return mdText(b.text)
    case 'h2':
      return `## ${mdText(b.text)}`
    case 'h3':
      return `### ${mdText(b.text)}`
    case 'list':
      return b.items.map((it, i) => `${b.ordered ? `${i + 1}.` : '-'} ${mdText(it)}`).join('\n')
    case 'quote':
      return `> ${mdText(b.text)}`
    case 'code':
      return fence(b.text, b.lang)
    case 'table':
      return [
        `*${mdText(b.caption)}*`,
        '',
        `| ${b.columns.map(cell).join(' | ')} |`,
        `| ${b.columns.map(() => '---').join(' | ')} |`,
        ...b.rows.map((r) => `| ${r.map(cell).join(' | ')} |`),
      ].join('\n')
    case 'figure':
      return `*Fig. ${String(b.fig).padStart(2, '0')} — ${mdText(b.caption)}*`
    case 'note':
      return `> **Note:** ${mdText(b.text)}`
    case 'callout':
      return `**${mdText(b.title)}** — ${mdText(b.text)}${b.link ? ` [${b.link.label}](${new URL(b.link.href, publicEnv.siteUrl).href})` : ''}`
  }
}

export function toMarkdown(meta: MarkdownMeta, blocks: readonly Block[]): string {
  const front = [
    '---',
    `title: ${yamlString(meta.title)}`,
    `description: ${yamlString(meta.description)}`,
    `canonical: ${yamlString(meta.canonical)}`,
    ...(meta.published ? [`published: ${yamlString(meta.published)}`] : []),
    ...(meta.updated ? [`updated: ${yamlString(meta.updated)}`] : []),
    ...(meta.authors?.length ? ['authors:', ...meta.authors.map((a) => `  - ${yamlString(a)}`)] : []),
    '---',
  ]
  return `${[...front, '', `# ${mdText(meta.title)}`, '', mdText(meta.description), '', ...blocks.map(blockToMarkdown).join('\n\n').split('\n')].join('\n')}\n`
}
