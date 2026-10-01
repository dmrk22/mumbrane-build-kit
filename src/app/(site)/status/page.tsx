import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/ui/Heading'
import { Note } from '@/components/ui/Note'
import { STATUS } from '@/content/pricing'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/status')

/** 90 empty outlined cells: the shape of a status history with no data in it (PAGES §13.2). */
function EmptyBar({ days }: { days: number }) {
  const w = 4
  const gap = 2
  return (
    <svg
      viewBox={`0 0 ${days * (w + gap) - gap} 24`}
      preserveAspectRatio="none"
      className="block h-6 w-full text-surface-rule"
      aria-hidden="true"
    >
      {Array.from({ length: days }, (_, n) => n).map((i) => (
        <rect
          key={i}
          x={i * (w + gap) + 0.5}
          y={0.5}
          width={w - 1}
          height={23}
          fill="none"
          stroke="currentColor"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}

// PAGES §13.2 — surfaces: paper · paper-2. "Not yet monitored" everywhere; no numbers.
export default function StatusPage() {
  return (
    <>
      <Section surface="paper" labelledBy="status-title" className="pt-12 md:pt-16 lg:pt-24" rhythm="compact">
        <Eyebrow>{STATUS.eyebrow}</Eyebrow>
        <h1 id="status-title" className="mt-4 font-display text-display-xl">
          {STATUS.title}
        </h1>
        <p className="mt-8 max-w-[52ch] text-lede text-surface-muted">{STATUS.lede}</p>
      </Section>

      <Section surface="paper-2" id="components" labelledBy="components-title">
        <Note className="max-w-3xl">{STATUS.banner}</Note>
        <h2 id="components-title" className="sr-only">
          {STATUS.title}
        </h2>
        <ul className="mt-10 border-t border-surface-rule">
          {STATUS.components.map((c) => (
            <li key={c.name} className="flex flex-col gap-4 border-b border-surface-rule py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <div>
                  <h3 className="text-title">{c.name}</h3>
                  <p className="mt-1 text-small text-surface-muted">{c.text}</p>
                </div>
                <span className="inline-flex h-7 items-center bg-paper-3 px-2.5 font-mono text-label text-text-2">
                  {STATUS.state}
                </span>
              </div>
              <EmptyBar days={STATUS.days} />
              <p className="flex justify-between font-mono text-label text-surface-subtle">
                <span className="sr-only">{STATUS.barLabel(STATUS.days)}</span>
                <span aria-hidden="true">{STATUS.noData}</span>
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-small text-surface-muted">{STATUS.note}</p>
      </Section>
    </>
  )
}
