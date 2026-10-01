import { CropMarks } from '@/components/art/CropMarks'
import { Painting } from '@/components/art/Painting'
import { SpectralStrip } from '@/components/art/SpectralStrip'
import { InView } from '@/components/motion/InView'
import { SmartLink } from '@/components/ui/SmartLink'
import { TitleText } from '@/components/ui/TitleText'
import type { PaintingId } from '@/content/paintings'
import { painting } from '@/content/paintingsData'
import { cx } from '@/lib/cx'
import { monoDate, roman } from '@/lib/format'

/**
 * A research plate (DESIGN §8.3): paper card, "PLATE II" and the date, the painting inside crop
 * marks, a serif title (the card's link, stretched over the whole card), the mono meta line with
 * the painting's real seed, and the spectral strip of its palette. Reveal and hover per §7.5.
 */
export function Plate({
  paintingId,
  number,
  date,
  title,
  meta,
  href,
  sizes,
  headingLevel = 3,
  className,
}: {
  paintingId: PaintingId
  number: number
  date: string
  title: string
  meta: string
  href?: string
  sizes: string
  headingLevel?: 2 | 3 | 4
  className?: string
}) {
  const p = painting(paintingId)
  const H = `h${headingLevel}` as const
  return (
    <InView className={cx('h-full', className)}>
      <article
        data-surface="paper"
        className="plate group relative flex h-full flex-col rounded-lg border border-surface-rule p-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-surface-accent"
      >
        <header className="flex items-baseline justify-between font-serif-italic text-small text-surface-subtle">
          <span>Plate {roman(number)}</span>
          <time dateTime={date} className="font-serif not-italic tabular-nums">
            {monoDate(date)}
          </time>
        </header>
        <CropMarks className="mx-2 mt-6">
          <div className="plate-frame overflow-hidden">
            <Painting id={paintingId} sizes={sizes} className="plate-painting" />
          </div>
        </CropMarks>
        <H className="mt-7 px-1 font-display text-display-s">
          {href ? (
            <SmartLink
              href={href}
              className="decoration-1 underline-offset-[0.18em] outline-none group-hover:underline after:absolute after:inset-0"
            >
              <TitleText text={title} />
            </SmartLink>
          ) : (
            <TitleText text={title} />
          )}
        </H>
        <p className="mt-3 px-1 font-serif-italic text-small text-surface-subtle">
          {meta}, oil on code, seed {p.seed}
        </p>
        {/* Spacing lives on a wrapper: padding on the 6 px SVG itself would leave it no height. */}
        <div className="mt-auto px-1 pt-6">
          <SpectralStrip palette={p.palette} className="plate-strip" />
        </div>
      </article>
    </InView>
  )
}
