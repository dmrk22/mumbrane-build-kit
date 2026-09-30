import type { PaintingId } from '@/content/paintings'
import { WIDTHS } from '@/content/paintings'
import { painting } from '@/content/paintingsData'
import { cx } from '@/lib/cx'

/**
 * A pre-built painting (DESIGN §8.3): `<picture>` with AVIF and WebP at every width, explicit
 * dimensions (no layout shift), and the generated LQIP class as its ground while it loads. Never
 * next/image. `decorative` renders `alt=""` and hides it from assistive tech.
 */
export function Painting({
  id,
  sizes,
  priority = false,
  decorative = false,
  fit = 'width',
  className,
}: {
  id: PaintingId
  sizes: string
  priority?: boolean
  decorative?: boolean
  /** `width`: natural height from the width; `cover`: fill a sized box (e.g. a hero). */
  fit?: 'width' | 'cover'
  className?: string
}) {
  const p = painting(id)
  const srcSet = (ext: 'avif' | 'webp') => WIDTHS.map((w) => `/paintings/${id}-${w}.${ext} ${w}w`).join(', ')
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      <img
        src={`/paintings/${id}-1600.webp`}
        width={p.width}
        height={p.height}
        alt={decorative ? '' : p.alt}
        aria-hidden={decorative || undefined}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'low'}
        decoding="async"
        className={cx(
          `lqip-${id} block`,
          fit === 'cover' ? 'size-full object-cover' : 'h-auto w-full',
          className,
        )}
      />
    </picture>
  )
}
