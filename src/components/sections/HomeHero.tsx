import { FieldCanvas } from '@/components/art/FieldCanvas'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { SmartLink } from '@/components/ui/SmartLink'
import { HOME } from '@/content/home'

/**
 * The home hero: the headline on the left, the field on the right — the original mumbrane.com
 * figure, alive. The entrance is CSS-only (motion.css), so the H1 stays the LCP element. Slides
 * under the transparent header.
 */
export function HomeHero() {
  const h = HOME.hero
  return (
    <section
      data-surface="ink"
      aria-labelledby="home-title"
      className="hero relative -mt-15 overflow-hidden lg:-mt-18"
    >
      <Container className="relative grid min-h-[max(640px,94svh)] items-center gap-y-6 pt-28 pb-16 lg:min-h-[min(100svh,960px)] lg:grid-cols-12 lg:gap-x-6 lg:pt-24 lg:pb-12">
        <div className="relative z-10 lg:col-span-7">
          <SmartLink
            href={h.announcement.href}
            className="hero-rise hero-d1 group inline-flex max-w-full items-center gap-2.5 font-mono text-label text-surface-muted transition-colors duration-(--duration-hover) hover:text-surface-fg"
          >
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-surface-accent" />
            <span className="truncate decoration-1 underline-offset-[0.25em] group-hover:underline">
              {h.announcement.label}
            </span>
          </SmartLink>
          <h1 id="home-title" className="hero-title mt-7 font-display text-display-l lg:text-hero">
            {h.titleLines.map((line, i) => (
              <span key={line}>
                {i > 0 && ' '}
                <span className="hero-line">
                  <span className={`hero-line-inner hero-d-line-${i}`}>{line}</span>
                </span>
              </span>
            ))}
          </h1>
          <p className="hero-rise hero-d3 mt-8 max-w-[38ch] text-lede text-surface-muted">{h.lede}</p>
          <div className="hero-rise hero-d4 mt-10 flex flex-wrap gap-3">
            <Button href={h.primary.href} size="lg" arrow>
              {h.primary.label}
            </Button>
            <Button href={h.secondary.href} size="lg" variant="secondary">
              {h.secondary.label}
            </Button>
          </div>
        </div>
        <FieldCanvas
          labels={h.field}
          className="hero-rise hero-d5 -mx-5 aspect-[640/520] sm:mx-0 lg:col-span-5 lg:-mr-10 lg:-ml-16 xl:-mr-20 xl:-ml-28"
        />
      </Container>
    </section>
  )
}
