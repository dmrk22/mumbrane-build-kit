import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from './Icon'

// Tones (PAGES §0.4 blocks): info · caveat · proposed. Each on its pigment's soft tint with its
// -ink text (DESIGN §2.4 pairs).
const TONE = {
  info: { box: 'bg-verdigris-soft text-verdigris-ink border-verdigris-ink/30', icon: 'info' },
  caveat: { box: 'bg-sulfur-soft text-sulfur-ink border-sulfur-ink/30', icon: 'warning' },
  proposed: { box: 'bg-iris-soft text-iris-ink border-iris-ink/30', icon: 'flask' },
} as const

export function Note({
  tone = 'info',
  title,
  className,
  children,
}: {
  tone?: keyof typeof TONE
  title?: string
  className?: string
  children: ReactNode
}) {
  const t = TONE[tone]
  return (
    <aside className={cx('flex gap-4 border p-5', t.box, className)}>
      <Icon name={t.icon} className="mt-0.5" />
      <div className="flex flex-col gap-2 text-small">
        {title && <p className="font-medium">{title}</p>}
        {children}
      </div>
    </aside>
  )
}
