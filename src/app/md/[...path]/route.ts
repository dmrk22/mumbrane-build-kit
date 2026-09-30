import { ARTICLES, articleBody, articlePath } from '@/content/articleDocs'
import { publicEnv } from '@/lib/env'
import { toMarkdown } from '@/lib/markdown'

// Markdown alternates (PAGES §0.7): GET only, an allowlist built from content, static at build.
// Key pages (index, moth, research, …) join in P13 with llms.txt.
export const dynamic = 'force-static'

const DOCS: ReadonlyMap<string, string> = new Map(
  ARTICLES.map((a) => {
    const path = articlePath(a)
    return [
      path.slice(1),
      toMarkdown(
        {
          title: a.title,
          description: a.description,
          canonical: new URL(path, publicEnv.siteUrl).href,
          published: a.published,
          ...('updated' in a ? { updated: a.updated } : {}),
          authors: a.authors,
        },
        articleBody(a.slug),
      ),
    ]
  }),
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
