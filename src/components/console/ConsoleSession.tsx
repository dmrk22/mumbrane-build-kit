'use client'

import { createContext, type ReactNode, use, useCallback, useMemo, useRef, useState } from 'react'
import { WORLDS } from '@/content/console/worlds'
import { type ConsoleEngine, SimulatorEngine } from '@/lib/console/engine'
import type { Build, Result, WorldId } from '@/lib/console/types'

/** A results-stream entry: a result, or a caught simulator error with its retry (CONSOLE §10.1). */
export type Entry = { id: string; worldId: WorldId; question: string; result: Result | null }

const MAX_ENTRIES = 200

type Session = {
  engine: ConsoleEngine
  entries: readonly Entry[]
  capped: boolean
  active: (worldId: WorldId) => Build
  ask: (worldId: WorldId, question: string) => Entry
  rebuild: (worldId: WorldId, variantId: string | null) => Build
  replay: (resultId: string) => Result | null
  reset: () => void
}

const SessionContext = createContext<Session | null>(null)

/**
 * The console's in-memory session (CONSOLE §9): lives in the console layout, so it survives moves
 * between Playground, Usage and Settings, and nothing else. Never stored, never sent.
 */
export function ConsoleSession({ children }: { children: ReactNode }) {
  const engine = useRef<SimulatorEngine | null>(null)
  engine.current ??= new SimulatorEngine(WORLDS)
  const [entries, setEntries] = useState<readonly Entry[]>([])
  const [capped, setCapped] = useState(false)
  // Re-render on rebuild: the engine is mutable, the version number is the signal.
  const [, setVersion] = useState(0)
  const seq = useRef(0)

  const get = useCallback(() => engine.current as SimulatorEngine, [])

  const ask = useCallback(
    (worldId: WorldId, question: string): Entry => {
      const e = get()
      let result: Result | null = null
      try {
        result = e.ask(worldId, e.active(worldId).id, question)
      } catch {
        // Nothing technical for the user, and never the question text in the log.
        console.error('console simulator error')
      }
      const entry = { id: result?.id ?? `e${++seq.current}`, worldId, question, result }
      setEntries((prev) => {
        const next = [entry, ...prev]
        if (next.length > MAX_ENTRIES) setCapped(true)
        return next.slice(0, MAX_ENTRIES)
      })
      return entry
    },
    [get],
  )

  const value = useMemo<Session>(
    () => ({
      engine: get(),
      entries,
      capped,
      active: (w) => get().active(w),
      ask,
      rebuild: (w, v) => {
        const b = get().rebuild(w, v)
        setVersion((n) => n + 1)
        return b
      },
      replay: (id) => {
        try {
          return get().replay(id)
        } catch {
          console.error('console simulator error')
          return null
        }
      },
      reset: () => {
        setEntries([])
        setCapped(false)
      },
    }),
    [entries, capped, ask, get],
  )

  return <SessionContext value={value}>{children}</SessionContext>
}

export function useConsoleSession(): Session {
  const s = use(SessionContext)
  if (!s) throw new Error('useConsoleSession outside ConsoleSession')
  return s
}
