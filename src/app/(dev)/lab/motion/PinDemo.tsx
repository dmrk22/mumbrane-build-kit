'use client'

import { useRef, useState } from 'react'
import { usePinnedSteps } from '@/components/motion/usePinnedSteps'
import { cx } from '@/lib/cx'

const STEPS = ['Define', 'Compile', 'Ask', 'Check', 'Replay'] as const

/** Dev-only: the pinned-steps helper driving a five-step ledger (desktop, motion allowed). */
export function PinDemo() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(STEPS.length - 1) // static final state until a pin runs
  usePinnedSteps(ref, { steps: STEPS.length, distanceVh: 120, onStep: setActive })
  return (
    <section ref={ref} data-surface="ink" aria-label="Pin demo" className="flex min-h-dvh items-center">
      <ol className="mx-auto w-full max-w-xl divide-y divide-surface-rule px-5">
        {STEPS.map((s, i) => (
          <li
            key={s}
            aria-current={i === active ? 'step' : undefined}
            className={cx(
              'flex items-baseline gap-4 py-5 transition-colors duration-(--duration-ui)',
              i === active ? 'text-surface-fg' : 'text-surface-subtle',
            )}
          >
            <span className={cx('font-mono text-label', i === active && 'text-verdigris')}>0{i + 1}</span>
            <span className="text-title">{s}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
