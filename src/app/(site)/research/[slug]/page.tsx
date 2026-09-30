import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Article } from '@/components/sections/Article'
import { ARTICLES, articleBySlug } from '@/content/articles'
import { JsonLd } from '@/lib/security/json-ld'
import { articleJsonLd, articleMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

const SECTION = 'research'

// Only this section's slugs; anything else is a 404 (SECURITY §2.2: slugs checked against content).
function find(slug: string) {
  const a = articleBySlug(slug)
  return a?.section === SECTION ? a : undefined
}

export function generateStaticParams() {
  return ARTICLES.filter((a) => a.section === SECTION).map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = find((await params).slug)
  return a ? articleMetadata(a) : {}
}

export default async function ArticlePage({ params }: Props) {
  const a = find((await params).slug)
  if (!a) notFound()
  const related = ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 2)
  return (
    <>
      <JsonLd data={articleJsonLd(a)} />
      <Article article={a} related={related} />
    </>
  )
}
