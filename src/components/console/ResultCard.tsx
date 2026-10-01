'use client'

import type { ReactNode } from 'react'
import { StatusChip } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { Inline } from '@/components/ui/Inline'
import { CONSOLE_UI } from '@/content/console/ui'
import { article } from '@/lib/console/sim'
import type { Result, Trace } from '@/lib/console/types'
import { cx } from '@/lib/cx'
import { keepNumberUnits } from '@/lib/format'
import type { Entry } from './ConsoleSession'

const { answer: a, results: copy } = CONSOLE_UI
const quote = (sentences: readonly string[]) => sentences.map((s) => `“${s}”`).join(' and ')

/** Negative facts that explain a gap ("halltwo has no licence for events."). */
function recorded(t: Trace | undefined): string[] {
  if (!t) return []
  return t.requirements.flatMap((r) =>
    r.status === 'missing'
      ? [...r.facts.filter((f) => f.negated).map((f) => f.text), ...recorded(r.via)]
      : [],
  )
}

/** The checked-English answer (CONSOLE §7), as content strings with inline code for entity ids. */
export function answerLines(r: Result): string[] {
  const entity = r.entity ?? ''
  const term = r.term ?? ''
  switch (r.outcome) {
    case 'SUPPORTED':
      return [
        a.supported(entity, term, article(term)),
        a.because((r.trace?.requirements ?? []).map((x) => x.text).join(' and ')),
      ]
    case 'NO_SUPPORTED_PROOF': {
      const negatives = recorded(r.trace)
      return [
        a.unproven(entity, term, article(term)),
        ...(r.missing.length > 0 ? [a.missing(r.missing.join('; '))] : []),
        ...(negatives.length > 0 ? [a.recorded(quote(negatives))] : []),
        a.notFails,
      ]
    }
    case 'CONFLICT':
      return [a.conflict(quote(r.conflicts)), a.resolve]
    case 'REFUSED':
      return r.refusal ? [CONSOLE_UI.refusal(r.refusal)] : []
    case 'RESOURCE_LIMIT':
      return [...(r.limit ? [CONSOLE_UI.limit(r.limit)] : []), a.shorten]
  }
}

const ACTION =
  'inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-caption text-surface-muted transition-[color,background-color] duration-(--duration-micro) ease-out hover:bg-surface-raise hover:text-surface-fg pointer-coarse:h-11'

/**
 * One result in the stream (CONSOLE §7): outcome chip, the question as typed (text only), the build
 * it came from, Replay and Evidence; the answer; a rephrasing for refusals; the measured time.
 */
export function ResultCard({
  entry,
  selected,
  expanded,
  suggestion,
  replayNote,
  onEvidence,
  onReplay,
  onJson,
  onAsk,
  evidence,
}: {
  entry: Entry
  selected: boolean
  expanded: boolean
  suggestion: string | undefined
  replayNote: string | undefined
  onEvidence: () => void
  onReplay: () => void
  onJson: () => void
  onAsk: (question: string) => void
  /** The in-card evidence below 1024 px (the side panel shows it from 1024 px). */
  evidence: ReactNode
}) {
  const r = entry.result
  const head = `q-${entry.id}`
  return (
    <article
      aria-labelledby={head}
      data-result={entry.id}
      tabIndex={-1}
      className={cx(
        'console-enter relative rounded-md border bg-surface outline-none transition-[border-color] duration-(--duration-hover) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-accent',
        selected ? 'border-surface-fg/45' : 'border-surface-rule',
      )}
    >
      {selected && (
        <span aria-hidden="true" className="absolute inset-y-4 -left-px w-0.5 rounded-md bg-surface-accent" />
      )}
      <div className="flex flex-wrap items-start gap-x-3 gap-y-2 px-5 pt-4">
        {r ? <StatusChip outcome={CONSOLE_UI.chip[r.outcome]} className="mt-0.5" /> : null}
        <h3 id={head} className="min-w-0 flex-1 basis-44 text-small break-words text-surface-fg line-clamp-3">
          {entry.question}
        </h3>
        {r && (
          <div className="flex shrink-0 items-center gap-1">
            <span className="mr-1 font-mono text-label text-surface-subtle">{r.buildId}</span>
            <button type="button" onClick={onReplay} className={ACTION}>
              <Icon name="replay" className="size-4" />
              {copy.replay}
            </button>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={onEvidence}
              className={cx(ACTION, selected && 'lg:text-surface-fg')}
            >
              <Icon name="layers" className="size-4" />
              {copy.evidence}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1.5 px-5 pt-3 pb-4 text-body text-surface-fg [&_code]:rounded-md [&_code]:bg-surface-raise [&_code]:px-1 [&_code]:py-px [&_code]:font-mono [&_code]:text-code">
        {r ? (
          answerLines(r).map((line, i) => (
            <p key={line} className={cx(i > 0 && 'text-small text-surface-muted')}>
              <Inline text={line} />
            </p>
          ))
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p>{copy.error}</p>
            <button type="button" onClick={() => onAsk(entry.question)} className={ACTION}>
              <Icon name="replay" className="size-4" />
              {copy.retry}
            </button>
          </div>
        )}
        {suggestion && (
          <p className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-small text-surface-muted">{a.tryInstead}</span>
            <button
              type="button"
              onClick={() => onAsk(suggestion)}
              className="inline-flex min-h-8 items-center rounded-md border border-surface-fg/25 px-3 py-1 text-left text-small text-surface-fg hover:bg-surface-raise pointer-coarse:min-h-11"
            >
              {suggestion}
            </button>
          </p>
        )}
        {replayNote && (
          <p className="flex items-center gap-1.5 pt-1 font-mono text-label text-(--console-ok)">
            <Icon name="replay" className="size-3.5" />
            {replayNote}
          </p>
        )}
      </div>

      {expanded && r && <div className="border-t border-surface-rule px-5 py-5 lg:hidden">{evidence}</div>}

      {r && (
        <p className="flex flex-wrap items-center gap-x-3 border-t border-surface-rule px-5 py-2.5 text-caption text-surface-subtle">
          <span>{keepNumberUnits(copy.simulated(r.ms))}</span>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={onJson}
            className="underline decoration-1 underline-offset-[0.2em] hover:decoration-2"
          >
            {copy.json}
          </button>
        </p>
      )}
    </article>
  )
}
