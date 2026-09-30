'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { alreadySeen, loadMotion, MOTION_OK } from './load'

/**
 * Default reveal (DESIGN §7.0): y 16 → 0 and fade, 560 ms mb.out, when the box reaches 85 % of the
 * viewport, once. With `stagger` (seconds) the box's direct children reveal in sequence instead
 * (cards 0.08, rows 0.05). Content is visible in CSS; the start state is set only when motion is
 * allowed and the box has not been seen yet.
 */
export function Reveal({
  stagger,
  delay = 0,
  className,
  children,
}: {
  stagger?: number
  delay?: number
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let revert: (() => void) | undefined
    let cancelled = false
    loadMotion().then(({ gsap }) => {
      if (cancelled) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        if (alreadySeen(el)) return
        gsap.from(stagger ? [...el.children] : el, {
          y: 16,
          opacity: 0,
          duration: 0.56,
          delay,
          stagger: stagger ?? 0,
          ease: 'mb.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      })
      revert = () => mm.revert()
    })
    return () => {
      cancelled = true
      revert?.()
    }
  }, [stagger, delay])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
