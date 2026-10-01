import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Painting } from '@/components/art/Painting'
import { Lockup } from '@/components/brand/Lockup'
import { Inline } from '@/components/ui/Inline'
import { OG_CARDS } from '@/content/og'

export const metadata: Metadata = { title: 'Social card', robots: { index: false, follow: false } }

// PAGES §0.9 — the social card templates (CONTENT §6) at 1200 × 630, captured by `pnpm og`
// (tests/e2e/og.spec.ts) into public/og/<family>.png. Development only. It sits outside the (dev)
// group, which has no layout, only to stay within four directory levels under src/ (D-124).
export default async function OgCardPage({ params }: { params: Promise<{ family: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { family } = await params
  const card = OG_CARDS.find((c) => c.family === family)
  if (!card) notFound()
  return (
    <main
      data-surface="paper"
      data-og-card
      className="grid h-[630px] w-[1200px] grid-cols-[1fr_456px] overflow-hidden"
    >
      <div className="flex flex-col justify-between p-16">
        <Lockup height={40} />
        <div>
          <p className="font-mono text-label text-surface-subtle">{card.eyebrow}</p>
          <h1 className="mt-5 font-display text-display-l text-balance">
            <Inline text={card.title} />
          </h1>
        </div>
        <p className="font-mono text-label text-surface-muted">{card.meta}</p>
      </div>
      <div className="relative border-l border-surface-rule">
        <Painting
          id={card.painting}
          sizes="456px"
          priority
          decorative
          fit="cover"
          className="absolute inset-0"
        />
      </div>
    </main>
  )
}
