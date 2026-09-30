'use client'

import { useEffect, useRef } from 'react'
import { cx } from '@/lib/cx'
import { loadMotion, MOTION_OK } from './load'

/**
 * The principle scrub (DESIGN §7.3): `lead` is always full ink; `rest` starts in text-3 and lights
 * word by word as the block scrolls from `top 75%` to `bottom 45%`. Server HTML and reduced
 * motion show everything lit; each word switches through a 120 ms colour transition in CSS.
 */
export function ScrubText({ lead, rest, className }: { lead: string; rest: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  // Words repeat, so their position is their identity; ids are fixed before rendering.
  const words = rest
    .split(' ')
    .map((word, i, all) => ({ id: `w${i}`, text: i < all.length - 1 ? `${word} ` : word }))
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let revert: (() => void) | undefined
    let cancelled = false
    loadMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return
      const spans = [...el.querySelectorAll<HTMLElement>('[data-word]')]
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const light = (n: number) => {
          spans.forEach((s, i) => {
            s.dataset.lit = String(i < n)
          })
        }
        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top 75%',
          end: 'bottom 45%',
          scrub: 0.5,
          onUpdate: (self) => light(Math.round(self.progress * spans.length)),
        })
        light(Math.round(st.progress * spans.length))
        return () => {
          st.kill()
          for (const s of spans) delete s.dataset.lit
        }
      })
      revert = () => mm.revert()
    })
    return () => {
      cancelled = true
      revert?.()
    }
  }, [])
  return (
    <p ref={ref} className={cx('scrub-text', className)}>
      {lead}{' '}
      {words.map((w) => (
        <span key={w.id} data-word>
          {w.text}
        </span>
      ))}
    </p>
  )
}
