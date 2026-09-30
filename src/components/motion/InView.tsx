'use client'

import { type ReactNode, useEffect, useRef } from 'react'

/**
 * Marks its box `data-reveal="done"` the first time it scrolls into view; CSS keyed on that
 * attribute plays the reveal. The hidden start state (`pending`) is set only when motion is
 * allowed and the box is still below the fold, so no-JS, reduced-motion and already-visible
 * content always shows its final state (DESIGN §7.0 initial-state rule).
 */
export function InView({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return
    if (el.getBoundingClientRect().top < window.innerHeight) return
    el.dataset.reveal = 'pending'
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        el.dataset.reveal = 'done'
        io.disconnect()
      },
      // No bottom margin: boxes at the very end of the page must still be able to reach it.
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
