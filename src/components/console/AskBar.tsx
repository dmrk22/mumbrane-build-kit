'use client'

import type { KeyboardEvent, RefObject } from 'react'
import { Button } from '@/components/ui/Button'
import { CONSOLE_UI } from '@/content/console/ui'
import { MAX_QUESTION } from '@/lib/console/sim'
import type { World } from '@/lib/console/types'
import { cx } from '@/lib/cx'

const { ask: copy, world: worldCopy } = CONSOLE_UI
const COUNTER_FROM = 1800

/**
 * The ask bar (CONSOLE §4.1): one growing line, the only primary button, a counter past 1,800
 * characters, and example chips that ask at once. Enter always asks; ↑ in an empty box recalls the
 * previous question; Esc leaves the box so the single-key shortcuts work.
 */
export function AskBar({
  world,
  text,
  onText,
  onAsk,
  previous,
  inputRef,
  onSkip,
}: {
  world: World
  text: string
  onText: (text: string) => void
  onAsk: (question: string) => void
  previous: string | undefined
  inputRef: RefObject<HTMLTextAreaElement | null>
  /** "Skip to evidence", once there is a result. */
  onSkip: (() => void) | undefined
}) {
  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      onAsk(text)
    } else if (e.key === 'Escape') {
      e.currentTarget.blur()
    } else if (e.key === 'ArrowUp' && text === '' && previous) {
      e.preventDefault()
      onText(previous)
    }
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onAsk(text)
        }}
      >
        <label htmlFor="ask" className="sr-only">
          {copy.label}
        </label>
        <div className="flex items-end gap-2 rounded-md border border-surface-fg/30 bg-surface p-1.5 transition-[border-color] duration-(--duration-micro) ease-out focus-within:border-surface-fg/60 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-surface-accent">
          <textarea
            id="ask"
            ref={inputRef}
            rows={1}
            value={text}
            maxLength={MAX_QUESTION * 2}
            onChange={(e) => onText(e.target.value)}
            onKeyDown={onKey}
            placeholder={copy.placeholder(world.name, world.examples[0] ?? '')}
            aria-describedby={text.length > COUNTER_FROM ? 'ask-count' : undefined}
            className="field-sizing-content max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 font-sans text-body text-surface-fg outline-none placeholder:text-surface-subtle"
          />
          <Button type="submit" className="shrink-0">
            {copy.submit}
          </Button>
        </div>
        {text.length > COUNTER_FROM && (
          <p
            id="ask-count"
            className={cx(
              'mt-2 text-right font-mono text-label tabular-nums',
              text.length > MAX_QUESTION ? 'text-(--console-bad)' : 'text-surface-subtle',
            )}
          >
            {copy.counter(text.length, MAX_QUESTION)}
          </p>
        )}
      </form>

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="sr-only text-small underline focus:not-sr-only focus:mt-3 focus:inline-block"
        >
          {copy.skip}
        </button>
      )}

      <div className="mt-6">
        <p id="examples-label" className="font-mono text-label text-surface-subtle">
          {copy.examples}
        </p>
        {world.examples.length === 0 ? (
          <p className="mt-3 text-small text-surface-muted">{worldCopy.empty}</p>
        ) : (
          <ul aria-labelledby="examples-label" className="mt-3 flex flex-wrap gap-2">
            {world.examples.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => onAsk(q)}
                  className="inline-flex min-h-9 items-center rounded-md border border-surface-fg/25 px-3.5 py-1.5 text-left text-small text-surface-fg transition-[background-color,border-color] duration-(--duration-micro) ease-out hover:border-surface-fg/45 hover:bg-surface-raise pointer-coarse:min-h-11"
                >
                  {q.length > MAX_QUESTION ? copy.long : q}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
