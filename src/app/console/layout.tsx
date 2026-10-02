import type { ReactNode } from 'react'
import { Footer } from '@/components/chrome/Footer'
import { Header } from '@/components/chrome/Header'
import { SkipLink } from '@/components/chrome/SkipLink'
import { SURFACE_TOP } from '@/content/chrome'
import { HEADER } from '@/content/nav'

// The console app is parked (D-147): /console is a coming-soon page in the site's chrome, and
// /console/* redirects to it (next.config). To bring the app back, restore this layout's app shell
// (ConsoleChrome, ConsoleSession, ThemeBootstrap, console.css) and the entry page from git.
export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <Header nav={HEADER} surfaceTop={SURFACE_TOP} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  )
}
