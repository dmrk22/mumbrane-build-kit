'use client'

import { useEffect, useState } from 'react'
import { cx } from '@/lib/cx'

/**
 * Sticky contents list (PAGES §11.1): marks the section being read with `aria-current="location"`.
 * The current section is the last heading above a line 30 % down the viewport.
 * Without JavaScript it is a plain list of fragment links.
 */
export function DocsToc({
  label,
  items,
}: {
  label: string
  items: readonly { id: string; title: string }[]
}) {
  const [current, setCurrent] = useState<string | null>(null)

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => e !== null)
    // Measured on scroll, not tracked with an IntersectionObserver: a jump from the bottom back
    // to the top moves headings from above the viewport to below the line without ever
    // intersecting it, so an observer never fires and its state goes stale.
    let frame = 0
    const measure = () => {
      frame = 0
      const line = window.innerHeight * 0.3
      const last = els.filter((el) => el.getBoundingClientRect().top < line).at(-1)
      setCurrent(last?.id ?? els[0]?.id ?? null)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [items])

  return (
    <nav aria-label={label}>
      <p className="font-serif-italic text-small text-surface-subtle">{label}</p>
      <ol className="mt-4 flex flex-col gap-1 border-l border-surface-rule">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={current === i.id ? 'location' : undefined}
              className={cx(
                '-ml-px block border-l py-1.5 pl-4 text-small transition-colors duration-(--duration-micro)',
                current === i.id
                  ? 'border-surface-fg text-surface-fg'
                  : 'border-transparent text-surface-muted hover:text-surface-fg',
              )}
            >
              {i.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
