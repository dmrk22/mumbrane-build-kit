'use client'

import { type RefObject, useCallback, useLayoutEffect, useRef } from 'react'
import { loadMotion } from './load'

// DESIGN §7.0 pins: desktop ≥ 1024 only, motion allowed, scrub 0.6, snapped to steps, ≤ 200 vh.
export const PIN_OK = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'

type Range = { start: number; end: number }

/**
 * Pins `ref` for `distanceVh` of scroll and reports the active step (0 … steps − 1). Below 1024 px
 * and under reduced motion nothing pins and `onStep` is never called: the section's own final,
 * static layout applies. Returns `goTo(step)`, which scrolls to that step while pinned and
 * returns false otherwise (the caller then sets the step itself).
 */
export function usePinnedSteps(
  ref: RefObject<HTMLElement | null>,
  { steps, distanceVh, onStep }: { steps: number; distanceVh: number; onStep: (step: number) => void },
): (step: number) => boolean {
  const latest = useRef(onStep)
  latest.current = onStep
  const range = useRef<Range | null>(null)

  // Layout effect, not passive: `pin` moves the element into a GSAP pin-spacer, and on unmount
  // React removes the element from its original parent before passive cleanups run. A layout
  // cleanup unpins first, so the removeChild finds it (NotFoundError on navigating away otherwise).
  useLayoutEffect(() => {
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
            range.current = { start: self.start, end: self.end }
            const step = Math.round(self.progress * (steps - 1))
            if (step === current) return
            current = step
            latest.current(step)
          },
          onRefresh: (self) => {
            range.current = { start: self.start, end: self.end }
          },
        })
        range.current = { start: st.start, end: st.end }
        // Report where the pin stands now, not only on the first scroll inside it: a section still
        // below the viewport starts at its first step instead of jumping back there as it pins.
        current = Math.round(st.progress * (steps - 1))
        latest.current(current)
        // The spacer GSAP inserts has no ground of its own; give it the section's, so fast scrolls
        // and full-page captures never show the page colour through it.
        const spacer = el.parentElement
        if (spacer?.classList.contains('pin-spacer'))
          spacer.style.backgroundColor = getComputedStyle(el).backgroundColor
        return () => {
          st.kill()
          range.current = null
        }
      })
      revert = () => mm.revert()
    })
    return () => {
      cancelled = true
      revert?.()
    }
  }, [ref, steps, distanceVh])

  return useCallback(
    (step: number) => {
      const r = range.current
      if (!r) return false
      window.scrollTo({ top: r.start + ((r.end - r.start) * step) / (steps - 1), behavior: 'smooth' })
      return true
    },
    [steps],
  )
}
