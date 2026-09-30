import type { ReactNode } from 'react'
import { Footer } from '@/components/chrome/Footer'
import { Header } from '@/components/chrome/Header'
import { SkipLink } from '@/components/chrome/SkipLink'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { SURFACE_TOP } from '@/content/chrome'
import { HEADER } from '@/content/nav'

// PAGES §0.2. SmoothScroll is a no-op for reduced motion and coarse pointers.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <Header nav={HEADER} surfaceTop={SURFACE_TOP} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <SmoothScroll />
    </>
  )
}
