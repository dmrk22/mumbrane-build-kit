'use client'

import { useEffect, useRef, useState } from 'react'
import { ui } from '@/content/ui'
import { cx } from '@/lib/cx'
import { Icon } from './Icon'

/** Copies `text`; the icon swaps to a check for 1.6 s and "Copied" is announced (DESIGN §7.7). */
export function CopyButton({ text, label, className }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text)
          } catch {
            return // clipboard unavailable (permissions, insecure context): nothing to confirm
          }
          setCopied(true)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => setCopied(false), 1600)
        }}
        className={cx(
          'grid size-8 place-items-center rounded-xs text-surface-muted hover:text-surface-fg',
          className,
        )}
      >
        <Icon name={copied ? 'check' : 'copy'} label={label} className="size-4" />
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? ui.copied : ''}
      </span>
    </>
  )
}
