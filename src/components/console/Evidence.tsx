'use client'

import { StatusChip } from '@/components/ui/Chip'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { Icon } from '@/components/ui/Icon'
import { Inline } from '@/components/ui/Inline'
import { CONSOLE_UI } from '@/content/console/ui'
import { article } from '@/lib/console/sim'
import type { Build, Result, Status, Trace, World } from '@/lib/console/types'
import { cx } from '@/lib/cx'

const { evidence } = CONSOLE_UI

const GLYPH: Record<Status, { mark: string; tone: string }> = {
  supported: { mark: '✓', tone: 'text-(--console-ok)' },
  missing: { mark: '○', tone: 'text-(--console-gap)' },
  conflict: { mark: '!', tone: 'text-(--console-bad)' },
}

/** A flash key for the world panel: the definition by term, a fact by its sentence (CONSOLE §8). */
export const citeKey = {
  definition: (term: string) => `def:${term}`,
  fact: (text: string) => `fact:${text}`,
}

function StatusMark({ status }: { status: Status }) {
  const g = GLYPH[status]
  return (
    <span
      aria-hidden="true"
      className={cx('w-4 shrink-0 text-center font-mono text-code font-semibold', g.tone)}
    >
      {g.mark}
    </span>
  )
}

function StatusWord({ status }: { status: Status }) {
  return (
    <span className={cx('font-mono text-label whitespace-nowrap uppercase', GLYPH[status].tone)}>
      {evidence.status[status]}
    </span>
  )
}

const CITE =
  'rounded-xs text-left decoration-1 underline-offset-[0.2em] hover:underline focus-visible:outline-2 focus-visible:outline-surface-accent'

function TraceNode({ trace, onCite }: { trace: Trace; onCite: (key: string) => void }) {
  return (
    <div>
      <div className="flex items-start gap-2">
        <StatusMark status={trace.status} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-2 text-small text-surface-fg [&_code]:font-mono [&_code]:text-code">
            <span>
              <Inline text={`\`${trace.entity}\` is ${article(trace.term)} ${trace.term}`} />
            </span>
            <StatusWord status={trace.status} />
          </p>
          <button
            type="button"
            onClick={() => onCite(citeKey.definition(trace.term))}
            className={cx(CITE, 'mt-1 font-serif text-small text-surface-muted italic')}
          >
            {trace.text}
            <span className="sr-only"> — {evidence.cite}</span>
          </button>
        </div>
      </div>
      {trace.requirements.length > 0 && (
        <ol className="mt-3 ml-2 space-y-3 border-l border-surface-rule pl-4">
          {trace.requirements.map((r) => (
            <li key={r.text}>
              <div className="flex items-start gap-2">
                <StatusMark status={r.status} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-small text-surface-fg [&_code]:font-mono [&_code]:text-code">
                    <span>
                      <Inline text={r.text} />
                    </span>
                    <StatusWord status={r.status} />
                  </p>
                  {r.facts.length > 0 && (
                    <ul className="mt-1.5 space-y-1">
                      {r.facts.map((f) => (
                        <li key={f.text}>
                          <button
                            type="button"
                            onClick={() => onCite(citeKey.fact(f.text))}
                            className={cx(
                              CITE,
                              'font-mono text-code',
                              f.negated ? 'text-(--console-gap)' : 'text-surface-muted',
                            )}
                          >
                            “{f.text}”<span className="sr-only"> — {evidence.cite}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {r.via && r.via.requirements.length > 0 && (
                    <div className="mt-3">
                      <TraceNode trace={r.via} onCite={onCite} />
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/** The illustrative JSON of a result (labelled; not Moth's schema). */
export function resultJson(result: Result, build: Build | undefined, world: World): string {
  const variant = world.variants.find((v) => v.id === build?.variantId)
  return JSON.stringify(
    {
      label: evidence.jsonNote,
      world: world.id,
      build: result.buildId,
      variant: variant?.label ?? null,
      question: result.question,
      outcome: result.outcome,
      entity: result.entity ?? null,
      term: result.term ?? null,
      missing: result.missing,
      conflicts: result.conflicts,
      refusal: result.refusal ?? null,
      limit: result.limit ?? null,
      trace: result.trace ?? null,
      simulatedMs: Math.round(result.ms * 1000) / 1000,
    },
    null,
    2,
  )
}

/** SECURITY §7: a Blob from memory, downloaded through an object URL that is revoked at once. */
function download(json: string, name: string) {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Evidence for one result (CONSOLE §8): the trace (definition → requirements → facts, each with a
 * status word), its build with Replay, and the illustrative JSON. `inline` is the in-card form
 * below 1024 px.
 */
export function Evidence({
  result,
  build,
  world,
  json,
  onJson,
  onReplay,
  onCite,
  replayNote,
  inline = false,
}: {
  result: Result
  build: Build | undefined
  world: World
  json: boolean
  onJson: (open: boolean) => void
  onReplay: () => void
  onCite: (key: string) => void
  replayNote: string | undefined
  inline?: boolean
}) {
  const H = inline ? 'h4' : 'h3'
  const variant = world.variants.find((v) => v.id === build?.variantId)
  const code = json ? resultJson(result, build, world) : ''
  return (
    <div className="space-y-7">
      {!inline && (
        <div className="space-y-3">
          <StatusChip outcome={CONSOLE_UI.chip[result.outcome]} />
          <p className="font-serif text-small break-words text-surface-fg">{result.question}</p>
        </div>
      )}

      <section>
        <H className="mb-3 font-mono text-label text-surface-subtle uppercase">{evidence.trace}</H>
        {result.trace ? (
          <TraceNode trace={result.trace} onCite={onCite} />
        ) : (
          <p className="text-small text-surface-muted">{evidence.notEvaluated}</p>
        )}
      </section>

      <section>
        <H className="mb-3 font-mono text-label text-surface-subtle uppercase">{evidence.build}</H>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-mono text-code text-surface-fg">{result.buildId}</span>
          <span className="text-small text-surface-muted">{evidence.variant(variant?.label ?? null)}</span>
          <button
            type="button"
            onClick={onReplay}
            className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-pill border border-surface-fg/25 px-3 text-small text-surface-fg hover:bg-surface-raise pointer-coarse:h-11"
          >
            <Icon name="replay" className="size-4" />
            {CONSOLE_UI.results.replay}
          </button>
        </div>
        {replayNote && <p className="mt-2 font-mono text-label text-(--console-ok)">{replayNote}</p>}
      </section>

      <section>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-expanded={json}
            onClick={() => onJson(!json)}
            className="inline-flex h-8 items-center gap-1.5 rounded-pill border border-surface-fg/25 px-3 text-small text-surface-fg hover:bg-surface-raise pointer-coarse:h-11"
          >
            <Icon name={json ? 'minus' : 'plus'} className="size-4" />
            {json ? evidence.hideJson : evidence.showJson}
          </button>
          {json && (
            <button
              type="button"
              onClick={() => download(code, evidence.filename(result.id))}
              className="inline-flex h-8 items-center gap-1.5 rounded-pill border border-surface-fg/25 px-3 text-small text-surface-fg hover:bg-surface-raise pointer-coarse:h-11"
            >
              <Icon name="download" className="size-4" />
              {evidence.download}
            </button>
          )}
        </div>
        {json && (
          <CodeBlock
            code={code}
            label={evidence.jsonLabel}
            illustrative={evidence.jsonTag}
            className="mt-3"
          />
        )}
      </section>
    </div>
  )
}
