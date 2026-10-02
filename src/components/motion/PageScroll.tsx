'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { loadMotion } from './load'

/**
 * Native scrolling, as anthropic.com has it (D-148): no smooth-scroll layer, so the browser's own
 * wheel and trackpad momentum set the feel. This only re-measures ScrollTrigger once fonts settle
 * and keeps the route-change behaviour of DESIGN §7.9 (top of page, focus on the new page's H1).
 * Renders nothing.
 */
export function PageScroll() {
  const pathname = usePathname()
  const shown = useRef(pathname)

  useEffect(() => {
    loadMotion().then(({ ScrollTrigger }) => document.fonts.ready.then(() => ScrollTrigger.refresh()))
  }, [])

  // A client navigation: jump to the top and move focus to the new page's H1 for screen readers.
  useEffect(() => {
    if (pathname === shown.current) return
    shown.current = pathname
    window.scrollTo(0, 0)
    const h1 = document.querySelector<HTMLElement>('main h1')
    if (!h1) return
    h1.tabIndex = -1
    h1.focus({ preventScroll: true })
  }, [pathname])

  return null
}
