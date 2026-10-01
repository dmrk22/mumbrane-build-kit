import { cx } from '@/lib/cx'

/**
 * A line-drawn step diagram (DESIGN §8.6): 1 px rules, ring nodes, mono indices; horizontal from
 * 1024 px with each step's text beneath its node, a vertical rail below. A figure with its FIG
 * label and, for conceptual drawings, the "not an experimental result" style caption.
 */
export function Pipeline({
  steps,
  figure,
  caption,
  className,
}: {
  steps: readonly { name: string; text: string }[]
  figure: string
  caption?: string
  className?: string
}) {
  return (
    <figure className={cx('w-full', className)}>
      <ol className={cx('grid gap-0', steps.length === 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-5')}>
        {steps.map((s, i) => (
          <li key={s.name} className="relative flex gap-5 pb-10 lg:flex-col lg:gap-6 lg:pr-6 lg:pb-0">
            {/* Rail: vertical on mobile, horizontal from 1024 px; the last node has none. */}
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute top-5 bottom-0 left-[7.5px] w-px bg-surface-fg/70 lg:top-[7.5px] lg:right-0 lg:bottom-auto lg:left-4 lg:h-px lg:w-auto"
              />
            )}
            <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true" className="relative shrink-0">
              <circle cx="8" cy="8" r="6.5" className="fill-surface" stroke="currentColor" strokeWidth={1} />
              <circle cx="8" cy="8" r="2.5" className={i === 0 ? 'fill-verdigris' : 'fill-current'} />
            </svg>
            <div className="flex flex-col gap-2">
              <p className="font-mono text-label text-surface-subtle">{String(i + 1).padStart(2, '0')}</p>
              <p className="text-title">{s.name}</p>
              <p className="max-w-[40ch] text-small text-surface-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <figcaption className="mt-10 flex flex-wrap gap-x-4 gap-y-1 font-serif-italic text-small text-surface-subtle">
        <span>{figure}</span>
        {caption && <span className="normal-case">{caption}</span>}
      </figcaption>
    </figure>
  )
}
