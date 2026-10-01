import { Mark } from '@/components/brand/Mark'
import { Container } from '@/components/layout/Container'
import { InView } from '@/components/motion/InView'
import { SmartLink } from '@/components/ui/SmartLink'
import { HEADER, FOOTER as NAV } from '@/content/nav'

// The footer, after Anthropic's: the mark, the line, dense link columns, a legal row.
export function Footer() {
  return (
    <footer
      data-surface="deep"
      className="relative overflow-hidden pt-16 pb-6 md:pt-20 lg:pt-24 print:hidden"
    >
      <Container className="relative">
        <div className="grid grid-cols-12 gap-x-4 gap-y-14 lg:gap-x-6">
          <InView className="col-span-12 lg:col-span-4">
            <SmartLink href="/" aria-label={HEADER.homeLabel} className="-m-2 inline-block p-2">
              <Mark width={88} className="draw-on-reveal" />
            </SmartLink>
            <p className="mt-8 max-w-[13ch] font-display text-display-s">{NAV.tagline}</p>
          </InView>
          <nav aria-label="Footer" className="col-span-12 lg:col-span-8">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:gap-x-6">
              {NAV.columns.map((col) => (
                <li key={col.title}>
                  <h2 className="font-mono text-label text-surface-subtle">{col.title}</h2>
                  <ul className="mt-4 flex flex-col gap-2">
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

        <div className="mt-20 flex flex-col gap-3 border-t border-surface-rule py-6 text-small text-surface-muted sm:grid sm:grid-cols-3 sm:items-center lg:mt-28">
          <p>{NAV.legal.copyright}</p>
          <SmartLink
            href={NAV.legal.privacyChoices.href}
            className="transition-colors duration-(--duration-hover) hover:text-surface-fg sm:justify-self-center"
          >
            {NAV.legal.privacyChoices.label}
          </SmartLink>
          <p className="flex items-baseline gap-3 sm:justify-self-end">{NAV.legal.motto}</p>
        </div>
      </Container>
    </footer>
  )
}
