import { Lockup } from '@/components/brand/Lockup'
import { Wordmark } from '@/components/brand/Wordmark'
import { Container } from '@/components/layout/Container'
import { InView } from '@/components/motion/InView'
import { SmartLink } from '@/components/ui/SmartLink'
import { HEADER, FOOTER as NAV } from '@/content/nav'

// A raised card on the deep band; the giant wordmark sits below it, fading out toward the bottom.
export function Footer() {
  return (
    <footer
      data-surface="deep"
      className="relative overflow-hidden bg-surface pt-6 text-surface-fg md:pt-8 print:hidden"
    >
      <Container>
        <div className="rounded-md border border-surface-rule bg-surface-raise px-6 pt-8 pb-5 md:px-10 md:pt-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-gutter lg:gap-y-6">
            <div className="lg:col-span-3">
              <SmartLink href="/" aria-label={HEADER.homeLabel} className="-m-2 inline-block p-2">
                <Lockup height={22} className="h-5.5 w-auto" />
              </SmartLink>
              {/* Every footer line is anthropic.com's footer size, 12 px (D-145). */}
              <p className="mt-4 text-fine text-surface-muted">{NAV.tagline}</p>
            </div>
            <nav aria-label="Footer" className="lg:col-span-9">
              <ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
                {NAV.columns.map((col) => (
                  <li key={col.title}>
                    {/* Headings bright and bold over muted links, so the columns read at a glance. */}
                    <h2 className="text-fine font-semibold text-surface-fg">{col.title}</h2>
                    <ul className="mt-3 flex flex-col gap-1.5">
                      {col.links.map((l) => (
                        <li key={l.href}>
                          <SmartLink
                            href={l.href}
                            className="text-fine text-surface-muted transition-colors duration-(--duration-hover) hover:text-surface-fg"
                          >
                            {l.label}
                          </SmartLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-surface-rule pt-5 text-fine text-surface-muted sm:flex-row sm:justify-between">
            <p>{NAV.legal.copyright}</p>
            <p>{NAV.legal.motto}</p>
          </div>
        </div>

        {/* Uniform colour on the wordmark itself; the fade is a mask on its wrapper (owner request, D-130). */}
        <InView className="wordmark-rise mt-4 text-surface-fg/16 mask-b-from-0% md:mt-6">
          <Wordmark className="h-auto w-full" />
        </InView>
      </Container>
    </footer>
  )
}
