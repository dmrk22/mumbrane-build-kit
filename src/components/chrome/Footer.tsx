import { Lockup } from '@/components/brand/Lockup'
import { Wordmark } from '@/components/brand/Wordmark'
import { Container } from '@/components/layout/Container'
import { InView } from '@/components/motion/InView'
import { SmartLink } from '@/components/ui/SmartLink'
import { HEADER, FOOTER as NAV } from '@/content/nav'

// DESIGN §9.3 + CONTENT §2.2: ink footer, six link columns, legal row, giant wordmark (§7.8).
export function Footer() {
  return (
    <footer data-surface="ink" className="overflow-hidden pt-16 md:pt-20 lg:pt-24 print:hidden">
      <Container>
        <div className="grid grid-cols-12 gap-x-4 gap-y-14 lg:gap-x-6">
          <InView className="col-span-12 lg:col-span-4">
            <SmartLink href="/" aria-label={HEADER.homeLabel} className="-m-2 inline-block p-2">
              <Lockup height={24} className="draw-on-reveal" />
            </SmartLink>
            <p className="mt-8 max-w-[14ch] font-serif text-display-s">{NAV.tagline}</p>
          </InView>
          <nav aria-label="Footer" className="col-span-12 lg:col-span-8">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-6">
              {NAV.columns.map((col) => (
                <li key={col.title}>
                  <h2 className="font-mono text-label text-surface-subtle uppercase">{col.title}</h2>
                  <ul className="mt-5 flex flex-col gap-2.5">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <SmartLink
                          href={l.href}
                          className="text-small text-surface-muted transition-colors duration-(--duration-hover) hover:text-surface-fg"
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

        <div className="mt-16 flex flex-col gap-3 border-t border-surface-rule py-6 text-small text-surface-muted sm:grid sm:grid-cols-3 sm:items-center lg:mt-24">
          <p>{NAV.legal.copyright}</p>
          <SmartLink
            href={NAV.legal.privacyChoices.href}
            className="transition-colors duration-(--duration-hover) hover:text-surface-fg sm:justify-self-center"
          >
            {NAV.legal.privacyChoices.label}
          </SmartLink>
          <p className="font-serif-italic sm:justify-self-end">{NAV.legal.motto}</p>
        </div>
      </Container>

      {/* The giant wordmark, clipped to its top ≈ 62 % (decorative); letters rise in once (§7.8). */}
      <Container className="mt-8 lg:mt-12">
        <InView className="aspect-[5340.4/434] overflow-hidden text-ink-3">
          <Wordmark className="wordmark-rise h-auto w-full" />
        </InView>
      </Container>
    </footer>
  )
}
