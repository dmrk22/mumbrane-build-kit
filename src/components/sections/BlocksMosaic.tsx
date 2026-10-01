'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { PIN_OK, usePinnedSteps } from '@/components/motion/usePinnedSteps'
import { Icon } from '@/components/ui/Icon'
import { SmartLink } from '@/components/ui/SmartLink'
import type { BlockFill, CompanyBlock } from '@/content/company'
import { cx } from '@/lib/cx'

// Ground + text pairs (contrast.test.ts): paper tones, three quiet accents, one dark block.
const FILL: Record<BlockFill, { bg: string; fg: string }> = {
  ice: { bg: 'bg-ice', fg: 'text-ink' },
  sand: { bg: 'bg-sand', fg: 'text-ink' },
  clay: { bg: 'bg-clay', fg: 'text-ink' },
  lilac: { bg: 'bg-lilac', fg: 'text-ink' },
  paper: { bg: 'bg-paper', fg: 'text-text' },
  'paper-2': { bg: 'bg-paper-2', fg: 'text-text' },
  'paper-3': { bg: 'bg-paper-3', fg: 'text-text' },
  ink: { bg: 'bg-ink-3', fg: 'text-on-dark' },
}

/**
 * "The lab, block by block". Each block starts locked (hatched) and unlocks as you go: its ground
 * wipes in from the corner and its statement rises. Genuinely future work stays locked in every
 * state, labelled honestly. Locked blocks are drawn by CSS from the first paint
 * (`@media (scripting: enabled)` + motion allowed, art.css), so nothing is re-hidden when this
 * hydrates; without JavaScript or with reduced motion every block is open and the counter reads
 * 12 of 12. Desktop with motion: the section pins and scroll unlocks the blocks in `step` order.
 * Smaller screens: each block unlocks as it enters the viewport. Focusing a linked block unlocks
 * it at once. Block text is always in the accessibility tree; the hatch is decorative.
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
      data-surface="deep"
      data-blocks=""
      data-live={mode === 'pending' ? undefined : ''}
      aria-labelledby="company-title"
      className="-mt-15 pt-27 pb-16 md:pb-24 lg:-mt-18 lg:min-h-dvh lg:pt-24 lg:pb-6"
    >
      <Container>
        {/* Heading left; lede and counter right, so the pinned section fits a 900 px viewport. */}
        <div className="grid gap-x-6 gap-y-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">{heading}</div>
          <div className="flex flex-col gap-5 lg:col-span-5 lg:col-start-8">
            <p className="max-w-[50ch] text-body text-surface-muted">{lede}</p>
            <div className="flex items-center gap-4 lg:justify-end">
              <span aria-hidden="true" className="flex gap-1">
                {blocks
                  .filter((b) => b.kind === 'open')
                  .map((b) => (
                    <span
                      key={b.label}
                      className={cx(
                        'size-2.5 border border-surface-fg/50 transition-colors duration-(--duration-ui)',
                        isOpen(b.step) && mode !== 'pending' && 'bg-ice',
                        mode === 'pending' && 'bg-ice',
                      )}
                    />
                  ))}
              </span>
              <p className="font-mono text-label text-surface-muted tabular-nums">
                {String(count).padStart(2, '0')} of {String(total).padStart(2, '0')} {labels.unlocked}
              </p>
            </div>
          </div>
        </div>
        {/* Rows are 200 px unless the viewport is too short to pin all three. */}
        <ul className="mt-10 grid grid-cols-2 gap-1.5 max-lg:grid-flow-row-dense lg:mt-12 lg:auto-rows-[clamp(140px,calc((100dvh-300px)/3),200px)] lg:grid-cols-6">
          {blocks.map((b) =>
            b.kind === 'locked' ? (
              <li
                key={b.label}
                className="block-hatch relative flex min-h-35 flex-col justify-between rounded-md border border-surface-rule p-4 lg:min-h-0 lg:p-5"
              >
                <p className="font-mono text-label text-surface-subtle">{labels.locked}</p>
                <p className="pr-2 font-sans text-small text-surface-muted">{b.label}</p>
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
        className="block-lock block-hatch absolute inset-0 border border-surface-rule text-on-dark-3"
      >
        <span className="absolute top-4 left-4 font-mono text-label tabular-nums lg:top-5 lg:left-5">
          {String(block.step).padStart(2, '0')}
        </span>
        <span className="absolute bottom-4 left-4 font-mono text-label lg:bottom-5 lg:left-5">{locked}</span>
      </span>
      <span className="block-copy relative flex h-full flex-col justify-between gap-4">
        <span className="flex items-start justify-between gap-4 font-mono text-label">
          {block.label}
          {block.href && <Icon name="arrow-up-right" className="size-4 shrink-0" />}
        </span>
        <span className="flex items-end justify-between gap-3">
          <span
            className={cx(
              'max-w-[24ch] font-display text-title leading-tight font-medium text-pretty',
              block.wide && 'xl:max-w-[28ch]',
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
      </span>
    </>
  )
  const className = cx(
    'relative flex h-full min-h-35 flex-col overflow-hidden rounded-md p-4 lg:min-h-0 lg:p-5',
    fill.fg,
  )
  const attrs = { 'data-step': block.step, 'data-unlocked': open ? '' : undefined }
  return block.href ? (
    // The site's focus ring, drawn outside the block in the grid gap: an inset ring would be
    // painted over by the fill and hatch layers.
    <SmartLink href={block.href} onFocus={onFocus} className={className} {...attrs}>
      {body}
    </SmartLink>
  ) : (
    <div className={className} {...attrs}>
      {body}
    </div>
  )
}
