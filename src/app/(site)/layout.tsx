import type { ReactNode } from 'react'
import { Footer } from '@/components/chrome/Footer'
import { Header } from '@/components/chrome/Header'
import { SkipLink } from '@/components/chrome/SkipLink'
import { PageScroll } from '@/components/motion/PageScroll'
import { SURFACE_TOP } from '@/content/chrome'
import { HEADER } from '@/content/nav'

// PAGES §0.2. Scrolling is native, as on anthropic.com (D-148).
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <Header nav={HEADER} surfaceTop={SURFACE_TOP} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <PageScroll />
    </>
  )
}
