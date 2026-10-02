import { FieldCanvas } from '@/components/art/FieldCanvas'
import { FieldStill } from '@/components/art/FieldStill'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { SmartLink } from '@/components/ui/SmartLink'
import { HOME } from '@/content/home'

/**
 * The home hero: the headline on the left, the membrane behind the right of the hero (D-137) —
 * facts dent a sheet, a question rolls to rest. The text entrance is CSS-only (motion.css), so the
 * H1 stays the LCP element. From 1024 px the figure is a full-bleed layer under the text column,
 * fading toward it, its core centred on the grid columns beside the copy (D-140); below, it
 * follows the actions. Slides under the transparent header.
 */
export function HomeHero() {
  const h = HOME.hero
  return (
    <section
      data-surface="paper"
      aria-labelledby="home-title"
      className="hero @container relative -mt-15 overflow-hidden lg:-mt-18"
    >
      <Container className="grid min-h-[max(640px,94svh)] grid-cols-[minmax(0,1fr)] items-center gap-y-6 pt-28 pb-16 lg:min-h-[min(100svh,960px)] lg:grid-cols-12 lg:gap-x-gutter lg:pt-24 lg:pb-12">
        <div data-hero-copy className="relative z-10 min-w-0 lg:col-span-7">
          <SmartLink
            href={h.announcement.href}
            className="hero-rise hero-d1 group inline-flex max-w-full items-center gap-2.5 font-mono text-label text-surface-muted transition-colors duration-(--duration-hover) hover:text-surface-fg"
          >
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-md bg-surface-accent" />
            <span className="truncate decoration-1 underline-offset-[0.25em] group-hover:underline">
              {h.announcement.label}
            </span>
          </SmartLink>
          <h1 id="home-title" className="hero-title mt-7 font-display text-hero">
            {h.titleLines.map((line, i) => (
              <span key={line}>
                {i > 0 && ' '}
                <span className="hero-line">
                  <span className={`hero-line-inner hero-d-line-${i}`}>{line}</span>
                </span>
              </span>
            ))}
          </h1>
          {/* anthropic.com's home lede (D-145): 24 px serif, capped at their 40ch, 594.229 px. */}
          <p className="hero-rise hero-d3 mt-8 max-w-[594.229px] text-hero-lede text-surface-muted">
            {h.lede}
          </p>
          <div className="hero-rise hero-d4 mt-10 flex flex-wrap gap-3">
            <Button href={h.primary.href} size="lg" arrow>
              {h.primary.label}
            </Button>
            <Button href={h.secondary.href} size="lg" variant="secondary">
              {h.secondary.label}
            </Button>
          </div>
        </div>
        <figure className="-mx-inset lg:absolute lg:top-18 lg:right-0 lg:bottom-0 lg:left-[40%] lg:mx-0 xl:left-[30%]">
          <FieldCanvas
            labels={h.field}
            beside="[data-hero-copy]"
            className="aspect-square sm:aspect-[4/3] lg:absolute lg:inset-0 lg:aspect-auto"
          >
            <FieldStill labels={h.field} />
          </FieldCanvas>
          <figcaption className="mt-3 max-w-[52ch] px-inset font-mono text-label text-surface-subtle lg:absolute lg:right-inset lg:bottom-8 lg:mt-0 lg:max-w-[46ch] lg:px-0">
            {h.field.caption}
          </figcaption>
        </figure>
      </Container>
    </section>
  )
}
