'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { PIN_OK, usePinnedSteps } from '@/components/motion/usePinnedSteps'
import { Icon } from '@/components/ui/Icon'
import { SmartLink } from '@/components/ui/SmartLink'
import type { BlockFill, CompanyBlock } from '@/content/company'
import { cx } from '@/lib/cx'

// DESIGN §2.4 pairs (contrast.test.ts): the pigment ground and the text that sits on it.
const FILL: Record<BlockFill, { bg: string; fg: string }> = {
  ultramarine: { bg: 'bg-ultramarine', fg: 'text-on-dark' },
  paper: { bg: 'bg-paper', fg: 'text-text' },
  cadmium: { bg: 'bg-cadmium', fg: 'text-ink' },
  viridian: { bg: 'bg-viridian', fg: 'text-ink' },
  ink: { bg: 'bg-ink', fg: 'text-on-dark' },
  vermilion: { bg: 'bg-vermilion', fg: 'text-ink' },
  // The violet-fg token in variable form: the write hook mistakes the utility name for Tailwind's palette.
  violet: { bg: 'bg-(--color-violet-fg)', fg: 'text-on-dark' },
  madder: { bg: 'bg-madder', fg: 'text-ink' },
  cherenkov: { bg: 'bg-cherenkov', fg: 'text-ink' },
  'paper-3': { bg: 'bg-paper-3', fg: 'text-text' },
  cobalt: { bg: 'bg-cobalt', fg: 'text-on-dark' },
  'paper-2': { bg: 'bg-paper-2', fg: 'text-text' },
}

/**
 * "The lab, block by block" (DESIGN §7.6). Locked blocks are drawn by CSS from the first paint
 * (`@media (scripting: enabled)` + motion allowed, art.css), so nothing is re-hidden when this
 * hydrates; without JavaScript or with reduced motion every block is open and the counter reads
 * 12 / 12. Desktop with motion: the section pins and scroll unlocks the blocks in `step` order.
 * Smaller screens: each block unlocks as it enters the viewport. Focusing a linked block unlocks
 * it at once. Block text is always in the accessibility tree; the lock overlay is decorative.
 */
export function BlocksMosaic({
  blocks,
  labels,
  heading,
  lede,
}: {
  blocks: readonly CompanyBlock[]
  labels: { unlocked: string; locked: string }
  /** The section's heading (server-rendered): eyebrow and H1. */
  heading: ReactNode
  lede: string
}) {
  const ref = useRef<HTMLElement>(null)
  const total = blocks.filter((b) => b.kind === 'open').length
  const [mode, setMode] = useState<'pending' | 'all' | 'pin' | 'view'>('pending')
  const [step, setStep] = useState(0)
  const [seen, setSeen] = useState<ReadonlySet<number>>(new Set())
  usePinnedSteps(ref, { steps: total + 1, distanceVh: 180, onStep: setStep })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // The CSS failsafe opened everything (JS arrived > 4 s late): keep it open, never re-lock.
    const failsafe = el
      .getAnimations({ subtree: true })
      .some(
        (a) =>
          'animationName' in a &&
          String(a.animationName).startsWith('blocks-failsafe') &&
          a.playState === 'finished',
      )
    if (failsafe || !window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      setMode('all')
      return
    }
    if (window.matchMedia(PIN_OK).matches) {
      // Loaded part-way down the page: start open; the pin's first update sets the real step.
      if (el.getBoundingClientRect().top <= 0) setStep(total)
      setMode('pin')
      return
    }
    // ponytail: the mode is fixed at mount; crossing 1024 px keeps the blocks already opened.
    setMode('view')
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const s = Number((e.target as HTMLElement).dataset.step)
          setSeen((prev) => new Set(prev).add(s))
          io.unobserve(e.target)
        }
      },
      { threshold: 0.35 },
    )
    for (const b of el.querySelectorAll('[data-step]')) io.observe(b)
    return () => io.disconnect()
  }, [total])

  const isOpen = (s: number) => mode === 'all' || (mode === 'pin' && s <= step) || seen.has(s)
  const count = mode === 'pending' ? total : blocks.filter((b) => b.kind === 'open' && isOpen(b.step)).length
  const open = (s: number) => setSeen((prev) => (prev.has(s) ? prev : new Set(prev).add(s)))

  return (
    <section
      ref={ref}
      data-surface="paper"
      data-blocks=""
      data-live={mode === 'pending' ? undefined : ''}
      aria-labelledby="company-title"
      className="pt-12 pb-16 md:pt-16 md:pb-24 lg:min-h-dvh lg:pt-24 lg:pb-6"
    >
      <Container>
        {/* Heading left; lede and counter right, so the pinned section fits a 900 px viewport. */}
        <div className="grid gap-x-6 gap-y-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">{heading}</div>
          <div className="flex flex-col gap-6 lg:col-span-5 lg:col-start-8">
            <p className="max-w-[52ch] text-body text-surface-muted">{lede}</p>
            <p className="font-mono text-label text-surface-subtle tabular-nums uppercase lg:text-right">
              {String(count).padStart(2, '0')} / {String(total).padStart(2, '0')} {labels.unlocked}
            </p>
          </div>
        </div>
        {/* Rows are 200 px (DESIGN §7.6) unless the viewport is too short to pin all three. */}
        <ul className="mt-10 grid grid-cols-2 gap-2 max-lg:grid-flow-row-dense lg:mt-12 lg:auto-rows-[clamp(140px,calc((100dvh-300px)/3),200px)] lg:grid-cols-6">
          {blocks.map((b) =>
            b.kind === 'locked' ? (
              <li
                key={b.label}
                className="dot-screen relative flex min-h-35 flex-col justify-end border border-surface-rule p-4 lg:min-h-0 lg:p-5"
              >
                <Icon
                  name="lock"
                  className="absolute top-4 right-4 size-4 text-surface-subtle lg:top-5 lg:right-5"
                />
                <p className="pr-6 font-mono text-label text-surface-muted uppercase">{b.label}</p>
              </li>
            ) : (
              <li key={b.label} className={b.wide ? 'col-span-2' : 'col-span-1'}>
                <Block block={b} open={isOpen(b.step)} onFocus={() => open(b.step)} locked={labels.locked} />
              </li>
            ),
          )}
        </ul>
      </Container>
    </section>
  )
}

function Block({
  block,
  open,
  onFocus,
  locked,
}: {
  block: Extract<CompanyBlock, { kind: 'open' }>
  open: boolean
  onFocus: () => void
  locked: string
}) {
  const fill = FILL[block.fill]
  const body = (
    <>
      <span aria-hidden="true" className={cx('block-fill absolute inset-0', fill.bg)} />
      <span
        aria-hidden="true"
        className="block-lock dot-screen absolute inset-0 border border-rule text-text-2"
      >
        <span className="absolute bottom-4 left-4 font-mono text-label uppercase lg:bottom-5 lg:left-5">
          {locked}
        </span>
        <Icon name="lock" className="absolute top-4 right-4 size-4 lg:top-5 lg:right-5" />
      </span>
      <span className="block-copy relative flex h-full flex-col justify-between gap-4">
        <span className="flex items-start justify-between gap-4 font-mono text-label uppercase">
          {block.label}
          {block.href && <Icon name="arrow-up-right" className="size-4 shrink-0" />}
        </span>
        <span
          className={cx(
            'max-w-[26ch] font-serif leading-tight font-normal text-pretty',
            block.wide ? 'text-title' : 'text-lede',
          )}
        >
          {/* An address breaks after the @ rather than overflowing a narrow block. */}
          {block.text.includes('@') ? (
            <>
              {block.text.slice(0, block.text.indexOf('@') + 1)}
              <wbr />
              {block.text.slice(block.text.indexOf('@') + 1)}
            </>
          ) : (
            block.text
          )}
        </span>
      </span>
    </>
  )
  const className = cx(
    'relative flex h-full min-h-35 flex-col overflow-hidden p-4 lg:min-h-0 lg:p-5',
    fill.fg,
  )
  const attrs = { 'data-step': block.step, 'data-unlocked': open ? '' : undefined }
  return block.href ? (
    // The site's focus ring, drawn outside the block in the grid gap: an inset ring was painted
    // over by the fill and lock layers, so focus was invisible (a11y.spec focus test).
    <SmartLink href={block.href} onFocus={onFocus} className={className} {...attrs}>
      {body}
    </SmartLink>
  ) : (
    <div className={className} {...attrs}>
      {body}
    </div>
  )
}
