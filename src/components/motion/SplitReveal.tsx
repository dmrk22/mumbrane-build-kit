'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { alreadySeen, loadMotion, MOTION_OK } from './load'

/**
 * Masked line reveal for H1/H2 below the fold (DESIGN §7.0): lines rise yPercent 105 → 0,
 * 850 ms mb.out, 70 ms stagger. Wrap a heading; its text stays in the accessibility tree
 * (SplitText `aria: 'auto'`). Above-the-fold heroes use CSS keyframes instead. SplitText writes
 * through the CSSOM, so it stays inside the CSP (verified on /lab/motion).
 */
export function SplitReveal({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const target = ref.current?.firstElementChild as HTMLElement | null
    if (!target) return
    let revert: (() => void) | undefined
    let cancelled = false
    Promise.all([loadMotion(), import('gsap/SplitText')]).then(([{ gsap }, { SplitText }]) => {
      if (cancelled) return
      gsap.registerPlugin(SplitText)
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        if (alreadySeen(target)) return
        const split = SplitText.create(target, {
          type: 'lines',
          mask: 'lines',
          aria: 'auto',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 105,
              duration: 0.85,
              stagger: 0.07,
              ease: 'mb.out',
              scrollTrigger: { trigger: target, start: 'top 85%', once: true },
            }),
        })
        return () => split.revert()
      })
      revert = () => mm.revert()
    })
    return () => {
      cancelled = true
      revert?.()
    }
  }, [])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
