'use client'

import { type RefObject, useEffect, useRef } from 'react'
import { loadMotion } from './load'

// DESIGN §7.0 pins: desktop ≥ 1024 only, motion allowed, scrub 0.6, snapped to steps, ≤ 200 vh.
const PIN_OK = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'

/**
 * Pins `ref` for `distanceVh` of scroll and reports the active step (0 … steps − 1). Below 1024 px
 * and under reduced motion nothing pins and `onStep` is never called: the section's own final,
 * static layout applies. `onStep` may change between renders; the latest one is used.
 */
export function usePinnedSteps(
  ref: RefObject<HTMLElement | null>,
  { steps, distanceVh, onStep }: { steps: number; distanceVh: number; onStep: (step: number) => void },
) {
  const latest = useRef(onStep)
  latest.current = onStep
  useEffect(() => {
    const el = ref.current
    if (!el || steps < 2) return
    let revert: (() => void) | undefined
    let cancelled = false
    loadMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return
      const mm = gsap.matchMedia()
      mm.add(PIN_OK, () => {
        let current = -1
        const st = ScrollTrigger.create({
          trigger: el,
          pin: true,
          start: 'top top',
          end: `+=${Math.min(distanceVh, 200)}%`,
          scrub: 0.6,
          snap: { snapTo: 1 / (steps - 1), duration: 0.3, ease: 'mb.inOut' },
          onUpdate: (self) => {
            const step = Math.round(self.progress * (steps - 1))
            if (step === current) return
            current = step
            latest.current(step)
          },
        })
        // The spacer GSAP inserts has no ground of its own; give it the section's, so fast scrolls
        // and full-page captures never show the page colour through it.
        const spacer = el.parentElement
        if (spacer?.classList.contains('pin-spacer'))
          spacer.style.backgroundColor = getComputedStyle(el).backgroundColor
        return () => st.kill()
      })
      revert = () => mm.revert()
    })
    return () => {
      cancelled = true
      revert?.()
    }
  }, [ref, steps, distanceVh])
}
