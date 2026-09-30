// Render loop with the hero's budget rules (DESIGN §7.2): fps cap, 50 ms delta clamp, and a pause
// whenever the canvas is off-screen or the tab is hidden. Frame scheduling is injected so the
// logic is unit-tested without a browser.

export type LoopDeps = {
  raf: (cb: (now: number) => void) => number
  caf: (id: number) => void
}

export type Loop = {
  /** Both must be true to run; the loop resumes where it paused (scene time never jumps). */
  setOnScreen(onScreen: boolean): void
  setPageVisible(visible: boolean): void
  stop(): void
  readonly running: boolean
}

const MAX_DELTA_MS = 50

export function createLoop(
  fps: number,
  onFrame: (tSeconds: number, dtSeconds: number) => void,
  deps: LoopDeps = { raf: (cb) => requestAnimationFrame(cb), caf: (id) => cancelAnimationFrame(id) },
): Loop {
  const minFrameMs = 1000 / fps
  let onScreen = false
  let pageVisible = true
  let stopped = false
  let id: number | undefined
  let last: number | undefined
  let t = 0 // scene time in ms; only advances while running

  const tick = (now: number) => {
    id = deps.raf(tick)
    if (last === undefined) {
      last = now
      return
    }
    const elapsed = now - last
    // A millisecond of vsync jitter is allowed, or a 60 Hz display would drop every other frame.
    if (elapsed < minFrameMs - 1) return
    last = now
    const dt = Math.min(elapsed, MAX_DELTA_MS)
    t += dt
    onFrame(t / 1000, dt / 1000)
  }

  const update = () => {
    const shouldRun = onScreen && pageVisible && !stopped
    if (shouldRun && id === undefined) {
      last = undefined
      id = deps.raf(tick)
    } else if (!shouldRun && id !== undefined) {
      deps.caf(id)
      id = undefined
    }
  }

  return {
    setOnScreen(v) {
      onScreen = v
      update()
    },
    setPageVisible(v) {
      pageVisible = v
      update()
    },
    stop() {
      stopped = true
      update()
    },
    get running() {
      return id !== undefined
    },
  }
}

/** Low tier (DESIGN §7.2): ≤ 4 cores or ≤ 4 GB → DPR 1.0 and 30 fps. */
export function deviceTier(nav: { hardwareConcurrency?: number; deviceMemory?: number }): 'low' | 'high' {
  const cores = nav.hardwareConcurrency ?? 8
  const memory = nav.deviceMemory ?? 8
  return cores <= 4 || memory <= 4 ? 'low' : 'high'
}

export function cappedDpr(dpr: number, tier: 'low' | 'high'): number {
  return Math.min(dpr || 1, tier === 'low' ? 1 : 1.5)
}
