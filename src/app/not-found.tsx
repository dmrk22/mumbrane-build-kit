import { Mark } from '@/components/brand/Mark'
import { Footer } from '@/components/chrome/Footer'
import { Header } from '@/components/chrome/Header'
import { SkipLink } from '@/components/chrome/SkipLink'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { SURFACE_TOP } from '@/content/chrome'
import { HEADER } from '@/content/nav'
import { site } from '@/content/site'

// Unmatched URLs render here, outside the (site) layout, so the page brings its own chrome.
// Never echoes the requested path (SECURITY §2.3).
export default function NotFound() {
  const { eyebrow, title, body, links } = site.notFound
  return (
    <>
      <SkipLink />
      <Header nav={HEADER} surfaceTop={SURFACE_TOP} />
      <main id="main" tabIndex={-1}>
        <Section surface="paper" labelledBy="not-found-title">
          <div className="grid grid-cols-12 items-center gap-x-4 gap-y-12 lg:gap-x-6">
            <div className="col-span-12 lg:col-span-6">
              <Eyebrow>{eyebrow}</Eyebrow>
              <Heading level={1} size="display-l" id="not-found-title" className="mt-4 max-w-[18ch]">
                {title}
              </Heading>
              <p className="mt-6 max-w-[48ch] text-lede text-surface-muted">{body}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {links.map((l, i) => (
                  <Button
                    key={l.href}
                    href={l.href}
                    variant={i === 0 ? 'primary' : 'secondary'}
                    arrow={i === 0}
                  >
                    {l.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:col-start-8">
              <Mark width={320} draw className="h-auto w-full max-w-80 text-surface-fg" />
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  )
}
