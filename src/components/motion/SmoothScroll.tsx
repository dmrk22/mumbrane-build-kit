'use client'

import type Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { loadMotion } from './load'

// Lenis only for fine pointers with motion allowed (DESIGN §7.0); touch keeps native scrolling.
const SMOOTH_OK = '(prefers-reduced-motion: no-preference) and (pointer: fine)'

/**
 * Smooth scroll driven by GSAP's ticker, with ScrollTrigger updated on every Lenis scroll, and the
 * route-change behaviour of DESIGN §7.9 (top of page, focus on the new page's H1). Renders nothing.
 */
export function SmoothScroll() {
  const pathname = usePathname()
  const lenis = useRef<Lenis | null>(null)
  const shown = useRef(pathname)

  useEffect(() => {
    let cancelled = false
    let stop: (() => void) | undefined
    loadMotion().then(async ({ gsap, ScrollTrigger }) => {
      document.fonts.ready.then(() => ScrollTrigger.refresh())
      if (cancelled || !window.matchMedia(SMOOTH_OK).matches) return
      const { default: LenisClass } = await import('lenis')
      if (cancelled) return
      const instance = new LenisClass({ lerp: 0.1, smoothWheel: true, anchors: { offset: -96 } })
      instance.on('scroll', ScrollTrigger.update)
      const tick = (time: number) => instance.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      lenis.current = instance
      stop = () => {
        gsap.ticker.remove(tick)
        instance.destroy()
        lenis.current = null
      }
    })
    return () => {
      cancelled = true
      stop?.()
    }
  }, [])

  // A client navigation: jump to the top and move focus to the new page's H1 for screen readers.
  useEffect(() => {
    if (pathname === shown.current) return
    shown.current = pathname
    lenis.current?.scrollTo(0, { immediate: true })
    const h1 = document.querySelector<HTMLElement>('main h1')
    if (!h1) return
    h1.tabIndex = -1
    h1.focus({ preventScroll: true })
  }, [pathname])

  return null
}
