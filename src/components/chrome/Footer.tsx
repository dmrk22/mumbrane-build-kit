import { Lockup } from '@/components/brand/Lockup'
import { Wordmark } from '@/components/brand/Wordmark'
import { Container } from '@/components/layout/Container'
import { InView } from '@/components/motion/InView'
import { SmartLink } from '@/components/ui/SmartLink'
import { HEADER, FOOTER as NAV } from '@/content/nav'
import { cx } from '@/lib/cx'

const LINK = 'transition-colors duration-(--duration-hover) hover:text-surface-fg'

// A raised paper card on a paper-2 band, the giant wordmark resting faintly beneath it.
export function Footer() {
  return (
    <footer
      data-surface="paper-2"
      className="relative overflow-hidden bg-surface pt-10 text-surface-fg md:pt-14 print:hidden"
    >
      <Container className="relative">
        <div
          data-surface="paper"
          className="relative z-10 rounded-xl border bg-surface border-surface-rule px-6 pt-8 pb-5 shadow-card md:px-10 md:pt-10"
        >
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-5">
              <SmartLink href="/" aria-label={HEADER.homeLabel} className="-m-2 inline-block p-2">
                <Lockup height={22} className="h-5.5 w-auto" />
              </SmartLink>
              <p className="mt-5 max-w-[44ch] text-small text-surface-muted">{NAV.tagline}</p>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-small font-medium">
                {NAV.social.map((s) => (
                  <li key={s.href}>
                    <SmartLink href={s.href} className={LINK}>
                      {s.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
            <nav aria-label="Footer" className="lg:col-span-7">
              <ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
                {NAV.columns.map((col) => (
                  <li key={col.title}>
                    <h2 className="text-small font-medium">{col.title}</h2>
                    <ul className="mt-3 flex flex-col gap-1.5">
                      {col.links.map((l) => (
                        <li key={l.href}>
                          <SmartLink href={l.href} className={cx('text-small text-surface-muted', LINK)}>
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

          <div className="mt-10 flex flex-col gap-3 border-t border-surface-rule pt-5 text-caption text-surface-muted md:flex-row md:items-center md:justify-between">
            <p>{NAV.legal.copyright}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {NAV.legal.links.map((l) => (
                <li key={l.href}>
                  <SmartLink href={l.href} className={cx('underline underline-offset-[0.22em]', LINK)}>
                    {l.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <InView className="wordmark-rise -mt-6 px-5 pb-6 text-surface-fg/6 sm:px-6 lg:px-10">
        <Wordmark className="mx-auto h-auto w-full max-w-340" />
      </InView>
    </footer>
  )
}
