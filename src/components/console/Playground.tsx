'use client'

import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { CONSOLE_UI } from '@/content/console/ui'
import { worldById } from '@/content/console/worlds'
import { suggest } from '@/lib/console/sim'
import type { Result, WorldId } from '@/lib/console/types'
import { AskBar } from './AskBar'
import { useConsoleSession } from './ConsoleSession'
import { Evidence } from './Evidence'
import { ResultCard } from './ResultCard'
import { typing } from './ShortcutsDialog'
import { WorldPanel } from './WorldPanel'

const { ask: askCopy, results: copy, world: worldCopy, evidence: evidenceCopy } = CONSOLE_UI
const WIDE = '(min-width: 1280px)' // the world column is showing
const SIDE = '(min-width: 1024px)' // the evidence column is showing

const same = (a: Result, b: Result) =>
  a.outcome === b.outcome &&
  a.missing.join('|') === b.missing.join('|') &&
  a.conflicts.join('|') === b.conflicts.join('|')

/**
 * The playground (CONSOLE §4): world · ask · evidence from 1280 px; the world in a drawer from
 * 1024 px; one column with in-card evidence below. Pick a world, ask, read the evidence.
 */
export function Playground({ initialWorld }: { initialWorld: WorldId }) {
  const session = useConsoleSession()
  const [worldId, setWorldId] = useState(initialWorld)
  const [text, setText] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set())
  const [pending, setPending] = useState<{ world: WorldId; variant: string | null } | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [jsonFor, setJsonFor] = useState<string | null>(null)
  const [replays, setReplays] = useState<Readonly<Record<string, string>>>({})
  const [announce, setAnnounce] = useState('')
  const input = useRef<HTMLTextAreaElement>(null)
  const drawer = useRef<HTMLDialogElement>(null)
  const panel = useRef<HTMLElement>(null)
  const list = useRef<HTMLOListElement>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(flashTimer.current), [])

  const world = worldById(worldId)
  const build = session.active(worldId)
  const entries = session.entries.filter((e) => e.worldId === worldId)
  const current = entries.find((e) => e.id === selected) ?? entries[0]
  const variant = pending?.world === worldId ? pending.variant : build.variantId

  function ask(question: string) {
    if (!question.trim()) return
    const entry = session.ask(worldId, question)
    setSelected(entry.id)
    setOpen(new Set([entry.id]))
    setText('')
    const r = entry.result
    setAnnounce(r ? copy.announce(r.entity ?? askCopy.label, CONSOLE_UI.outcome[r.outcome]) : copy.error)
  }

  function chooseWorld(id: WorldId) {
    if (id === worldId) return
    setWorldId(id)
    setSelected(null)
    setFlash(null)
    setJsonFor(null)
    // URL state without a server round trip (Next syncs useSearchParams with native history).
    window.history.replaceState(null, '', `?world=${id}`)
  }

  function rebuild() {
    const b = session.rebuild(worldId, variant)
    setPending(null)
    setAnnounce(worldCopy.rebuilt(b.id))
  }

  function replay(id: string | undefined) {
    const original = entries.find((e) => e.id === id)?.result
    if (!id || !original) return
    const again = session.replay(id)
    const note = copy.replayed(original.buildId, again !== null && same(again, original))
    setReplays((r) => ({ ...r, [id]: note }))
    setAnnounce(note)
  }

  /** Select a result and take focus to its evidence: the side panel, or the card's own section. */
  function showEvidence(id: string | undefined, json = false) {
    if (!id) return
    setSelected(id)
    if (json) setJsonFor(id)
    if (window.matchMedia(SIDE).matches) {
      panel.current?.focus()
      return
    }
    setOpen((s) => new Set(s).add(id))
    requestAnimationFrame(() => document.getElementById(`ev-${id}`)?.focus())
  }

  function toggleEvidence(id: string) {
    setSelected(id)
    if (window.matchMedia(SIDE).matches) return
    setOpen((s) => {
      const next = new Set(s)
      if (!next.delete(id)) next.add(id)
      return next
    })
  }

  function cite(key: string) {
    setFlash(key)
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlash(null), 2000)
    if (!window.matchMedia(WIDE).matches && !drawer.current?.open) drawer.current?.showModal()
  }

  function move(delta: 1 | -1) {
    if (entries.length === 0) return
    const at = Math.max(
      0,
      entries.findIndex((e) => e.id === current?.id),
    )
    const next = entries[Math.min(entries.length - 1, Math.max(0, at + delta))]
    if (!next) return
    setSelected(next.id)
    const card = list.current?.querySelector<HTMLElement>(`[data-result="${next.id}"]`)
    card?.focus()
  }

  // Single-key shortcuts (CONSOLE §11); never while typing or while a dialog is open.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target) || document.querySelector('dialog[open]'))
        return
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      const inList = e.target instanceof Node && !!list.current?.contains(e.target)
      if (k === '/') input.current?.focus()
      else if (k === 'j' || (inList && k === 'ArrowDown')) move(1)
      else if (k === 'k' || (inList && k === 'ArrowUp')) move(-1)
      else if (k === 'e') showEvidence(current?.id)
      else if (k === 'r') replay(current?.id)
      else return
      e.preventDefault()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  const evidenceFor = (id: string, inline: boolean) => {
    const entry = entries.find((e) => e.id === id)
    if (!entry?.result) return null
    const r = entry.result
    return (
      <Evidence
        result={r}
        build={session.engine.build(r.buildId)}
        world={world}
        json={jsonFor === id}
        onJson={(o) => setJsonFor(o ? id : null)}
        onReplay={() => replay(id)}
        onCite={cite}
        replayNote={replays[id]}
        inline={inline}
      />
    )
  }

  const worldPanel = (
    <WorldPanel
      world={world}
      build={build}
      pending={variant}
      flash={flash}
      onWorld={chooseWorld}
      onPending={(v) => setPending({ world: worldId, variant: v })}
      onRebuild={rebuild}
    />
  )

  return (
    <div className="grid flex-1 lg:h-[calc(100dvh-3.5rem)] lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[320px_minmax(0,1fr)_380px]">
      <aside
        aria-labelledby="world-title"
        data-console-panel
        className="console-scroll hidden border-r border-surface-rule bg-surface xl:block"
      >
        <h2 id="world-title" className="sr-only">
          {worldCopy.label}: {world.name}
        </h2>
        {worldPanel}
      </aside>

      <div className="console-scroll min-w-0">
        <div className="mx-auto w-full max-w-190 px-4 pt-5 pb-16 md:px-8 md:pt-8">
          <div
            data-console-panel
            className="mb-5 flex items-center gap-3 rounded-md border border-surface-rule bg-surface py-2.5 pr-2.5 pl-4 xl:hidden"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-small font-medium text-surface-fg">{world.name}</p>
              <p className="font-mono text-label text-surface-subtle">
                <span key={build.id} className="console-fade">
                  {worldCopy.build(build.id, true)}
                </span>
              </p>
            </div>
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => drawer.current?.showModal()}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-fg/25 px-3.5 text-small text-surface-fg hover:bg-surface-raise pointer-coarse:h-11"
            >
              <Icon name="layers" className="size-4" />
              {worldCopy.show}
            </button>
          </div>

          <AskBar
            world={world}
            text={text}
            onText={setText}
            onAsk={ask}
            previous={entries[0]?.question}
            inputRef={input}
            onSkip={entries.length > 0 ? () => showEvidence(current?.id) : undefined}
          />

          <section aria-labelledby="results-title" className="mt-10">
            <div className="flex items-baseline justify-between border-b border-surface-rule pb-2">
              <h2 id="results-title" className="font-mono text-label text-surface-subtle">
                {copy.label}
              </h2>
              {entries.length > 0 && (
                <span className="font-mono text-label text-surface-subtle tabular-nums">
                  {entries.length}
                </span>
              )}
            </div>
            {session.capped && <p className="mt-3 text-caption text-surface-muted">{copy.capped}</p>}
            {entries.length === 0 ? (
              <p className="mt-4 rounded-md border border-dashed border-surface-rule px-5 py-8 text-center text-small text-surface-muted">
                {copy.empty}
              </p>
            ) : (
              <ol ref={list} className="mt-4 space-y-4">
                {entries.map((e) => (
                  <li key={e.id}>
                    <ResultCard
                      entry={e}
                      selected={e.id === current?.id}
                      expanded={open.has(e.id)}
                      suggestion={
                        e.result?.outcome === 'REFUSED'
                          ? suggest(world, session.engine.build(e.result.buildId) ?? build, e.result)
                          : undefined
                      }
                      replayNote={replays[e.id]}
                      onEvidence={() => toggleEvidence(e.id)}
                      onReplay={() => replay(e.id)}
                      onJson={() => showEvidence(e.id, true)}
                      onAsk={ask}
                      evidence={
                        <div id={`ev-${e.id}`} tabIndex={-1} className="outline-none">
                          {open.has(e.id) && evidenceFor(e.id, true)}
                        </div>
                      }
                    />
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>

      <aside
        ref={panel}
        id="evidence"
        tabIndex={-1}
        aria-labelledby="evidence-title"
        data-console-panel
        className="console-scroll hidden border-l border-surface-rule bg-surface outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-surface-accent lg:block"
      >
        <div className="sticky top-0 z-10 flex h-12 items-center border-b border-surface-rule bg-surface px-5">
          <h2 id="evidence-title" className="font-sans text-small font-medium text-surface-fg">
            {evidenceCopy.title}
          </h2>
        </div>
        <div className="px-5 pt-5 pb-10">
          {current?.result ? (
            evidenceFor(current.id, false)
          ) : (
            <p className="text-small text-surface-muted">{evidenceCopy.empty}</p>
          )}
        </div>
      </aside>

      <dialog
        ref={drawer}
        aria-labelledby="drawer-title"
        data-console-panel
        className="console-drawer console-scroll bg-surface text-surface-fg shadow-menu"
      >
        <div className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-surface-rule bg-surface pr-2 pl-5">
          <h2 id="drawer-title" className="text-small font-medium">
            {worldCopy.label}: {world.name}
          </h2>
          <form method="dialog">
            <button
              type="submit"
              className="grid size-10 place-items-center rounded-md hover:bg-surface-raise"
            >
              <Icon name="close" label={worldCopy.close} className="size-4" />
            </button>
          </form>
        </div>
        {worldPanel}
      </dialog>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  )
}
