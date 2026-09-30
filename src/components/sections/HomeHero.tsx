import { MembraneCanvas } from '@/components/art/MembraneCanvas'
import { Painting } from '@/components/art/Painting'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Heading'
import { Inline } from '@/components/ui/Inline'
import { HOME } from '@/content/home'

/**
 * The home hero (PAGES §1.1, DESIGN §7.2): the membrane over its CSS field, a scrim that keeps the
 * lede at ≥ 4.5:1 over any line, and a CSS-only entrance (no JS on the critical path, so the H1
 * stays the LCP element). The section slides under the transparent header.
 */
export function HomeHero() {
  const h = HOME.hero
  return (
    <section
      data-surface="ultramarine"
      aria-labelledby="home-title"
      className="relative -mt-15 flex min-h-[max(560px,88svh)] flex-col overflow-hidden lg:-mt-18 lg:min-h-[min(100svh,920px)]"
    >
      <MembraneCanvas poster={<Painting id="membrane-poster" decorative fit="cover" sizes="100vw" />} />
      <div aria-hidden="true" className="hero-scrim absolute inset-0" />
      <Container className="relative flex flex-1 flex-col pt-15 lg:pt-18">
        <div className="flex flex-1 flex-col justify-center py-14 lg:py-16">
          <Eyebrow dot className="hero-rise hero-d1">
            {h.eyebrow}
          </Eyebrow>
          {/* Lines are block masks from 1024 px; below that they flow inline, so the H1 is one text
              box and stays the LCP element (motion.css). The space joins the lines when inline. */}
          <h1 id="home-title" className="hero-title mt-5 font-serif text-display-xl">
            {h.titleLines.map((line, i) => (
              <span key={line}>
                {i > 0 && ' '}
                <span className="hero-line">
                  <span className={`hero-line-inner hero-d-line-${i}`}>
                    <Inline text={line} />
                  </span>
                </span>
              </span>
            ))}
          </h1>
          <p className="hero-rise hero-d3 mt-8 max-w-[36ch] text-lede text-surface-fg">{h.lede}</p>
          <div className="hero-rise hero-d4 mt-8 flex flex-wrap gap-3">
            <Button href={h.primary.href} arrow>
              {h.primary.label}
            </Button>
            <Button href={h.secondary.href} variant="secondary">
              {h.secondary.label}
            </Button>
          </div>
        </div>
        <div className="hero-rise hero-d5 flex items-end justify-between gap-6 pb-8">
          <p className="font-mono text-label text-surface-muted uppercase">{h.caption}</p>
          <p
            aria-hidden="true"
            className="hero-scroll hidden items-end gap-3 font-mono text-label uppercase sm:flex"
          >
            <span className="hero-scroll-line block h-10 w-px bg-surface-fg/30" />
            {h.scroll}
          </p>
        </div>
      </Container>
    </section>
  )
}
