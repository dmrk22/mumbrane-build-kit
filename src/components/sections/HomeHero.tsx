import { MembraneCanvas } from '@/components/art/MembraneCanvas'
import { StringModel } from '@/components/art/StringModel'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { SmartLink } from '@/components/ui/SmartLink'
import { HOME } from '@/content/home'

/**
 * The home hero: a string-model membrane on the deep ground, the headline over its left half, and
 * the surface's own equations as the figure legend, with the live θ the canvas reports. The
 * entrance is CSS-only (motion.css), so the H1 stays the LCP element. Slides under the header.
 */
export function HomeHero() {
  const h = HOME.hero
  const f = h.figure
  return (
    <section
      data-surface="deep"
      aria-labelledby="home-title"
      className="hero relative -mt-15 flex min-h-[max(620px,92svh)] flex-col overflow-hidden lg:-mt-18 lg:min-h-[min(100svh,980px)]"
    >
      <MembraneCanvas
        readoutId="hero-theta"
        poster={<StringModel className="absolute inset-y-0 right-0 h-full w-auto text-on-dark opacity-60" />}
      />
      <div aria-hidden="true" className="hero-scrim absolute inset-0" />
      <Container className="relative flex flex-1 flex-col pt-15 lg:pt-18">
        <div className="flex flex-1 flex-col justify-center py-14 lg:py-20">
          <SmartLink
            href={h.announcement.href}
            className="hero-rise hero-d1 group inline-flex max-w-full items-center gap-3 self-start rounded-pill border border-surface-rule bg-surface/40 py-1.5 pr-4 pl-2 text-small backdrop-blur-sm transition-colors duration-(--duration-hover) hover:border-surface-subtle"
          >
            <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center">
              <span className="size-2 rotate-45 bg-sulfur" />
            </span>
            <span className="truncate decoration-1 underline-offset-[0.2em] group-hover:underline">
              {h.announcement.label}
            </span>
          </SmartLink>

          <h1 id="home-title" className="hero-title mt-8 font-display text-display-xl lg:max-w-[12ch]">
            {h.titleLines.map((line, i) => (
              <span key={line}>
                {i > 0 && ' '}
                <span className="hero-line">
                  <span className={`hero-line-inner hero-d-line-${i}`}>{line}</span>
                </span>
              </span>
            ))}
          </h1>
          <p className="hero-rise hero-d3 mt-8 max-w-[34ch] text-lede text-surface-muted">{h.lede}</p>
          <div className="hero-rise hero-d4 mt-10 flex flex-wrap gap-3">
            <Button href={h.primary.href} size="lg" arrow>
              {h.primary.label}
            </Button>
            <Button href={h.secondary.href} size="lg" variant="secondary">
              {h.secondary.label}
            </Button>
          </div>
        </div>

        <div className="hero-rise hero-d5 grid gap-6 border-t border-surface-rule pt-5 pb-8 lg:grid-cols-12">
          <p className="max-w-[46ch] font-serif text-caption text-surface-muted lg:col-span-5">
            <span className="font-semibold text-surface-fg">{f.label}</span> {f.text}
          </p>
          <div
            aria-hidden="true"
            className="hidden font-serif-italic text-caption text-surface-muted lg:col-span-6 lg:col-start-7 lg:flex lg:items-end lg:justify-end lg:gap-10"
          >
            <dl className="grid grid-cols-[auto_auto_1fr] gap-x-2 gap-y-0.5">
              {f.equations.map(([lhs, eq, rhs]) => (
                <div key={lhs} className="contents">
                  <dt className="text-surface-fg">{lhs}</dt>
                  <dd className="not-italic">{eq}</dd>
                  <dd>{rhs}</dd>
                </div>
              ))}
            </dl>
            <p className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-surface-fg">{f.theta}</span>
              <span className="not-italic">=</span>
              <span id="hero-theta" className="min-w-[5ch] text-sulfur tabular-nums">
                0.36π
              </span>
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
