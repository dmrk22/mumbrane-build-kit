import { MD_DOCS } from '@/content/mdDocs'
import { publicEnv } from '@/lib/env'
import { toMarkdown } from '@/lib/markdown'

// Markdown alternates (PAGES §0.7): GET only, an allowlist built from content, static at build.
export const dynamic = 'force-static'

const DOCS: ReadonlyMap<string, string> = new Map(
  MD_DOCS.map((d) => [
    d.key,
    toMarkdown(
      {
        title: d.title,
        description: d.description,
        canonical: new URL(d.path, publicEnv.siteUrl).href,
        ...(d.published ? { published: d.published } : {}),
        ...(d.updated ? { updated: d.updated } : {}),
        ...(d.authors ? { authors: d.authors } : {}),
      },
      d.blocks,
    ),
  ]),
)

export function generateStaticParams() {
  return [...DOCS.keys()].map((key) => ({ path: key.split('/') }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const doc = DOCS.get(path.join('/'))
  if (!doc) {
    return new Response('Not found\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
  return new Response(doc, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  })
}
