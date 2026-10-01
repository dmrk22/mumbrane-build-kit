// The console's engine seam (CONSOLE §13). Components depend on `ConsoleEngine` only; the
// simulator implements it now. A future HostedEngine will call server actions backed by Neon
// (SECURITY §8.4) — nothing here talks to the network.
import { ask, makeBuild } from './sim.ts'
import type { Build, Result, World, WorldId } from './types.ts'

export interface ConsoleEngine {
  /** The active build of a world (the base build until a rebuild). */
  active(worldId: WorldId): Build
  ask(worldId: WorldId, buildId: string, question: string): Result
  rebuild(worldId: WorldId, variantId: string | null): Build
  /** Re-runs a result's question against its original build snapshot. */
  replay(resultId: string): Result | null
  /** A build snapshot this engine made (results remember theirs). */
  build(id: string): Build | undefined
}

export class SimulatorEngine implements ConsoleEngine {
  readonly #worlds: ReadonlyMap<WorldId, World>
  readonly #builds = new Map<string, Build>()
  readonly #active = new Map<WorldId, string>()
  readonly #results = new Map<string, Result>()
  #next = 0

  constructor(worlds: readonly World[]) {
    this.#worlds = new Map(worlds.map((w) => [w.id, w]))
  }

  #world(id: WorldId): World {
    const w = this.#worlds.get(id)
    if (!w) throw new Error(`unknown world ${id}`)
    return w
  }

  #build(world: World, variantId: string | null): Build {
    const b = makeBuild(world, variantId)
    const known = this.#builds.get(b.id)
    if (known) return known
    this.#builds.set(b.id, b)
    return b
  }

  active(worldId: WorldId): Build {
    const id = this.#active.get(worldId)
    return (id && this.#builds.get(id)) || this.#build(this.#world(worldId), null)
  }

  ask(worldId: WorldId, buildId: string, question: string): Result {
    const world = this.#world(worldId)
    const build = this.#builds.get(buildId) ?? this.active(worldId)
    const result = ask(world, build, question, `r${++this.#next}`)
    this.#results.set(result.id, result)
    return result
  }

  rebuild(worldId: WorldId, variantId: string | null): Build {
    const b = this.#build(this.#world(worldId), variantId)
    this.#active.set(worldId, b.id)
    return b
  }

  replay(resultId: string): Result | null {
    const original = this.#results.get(resultId)
    if (!original) return null
    return this.ask(original.worldId, original.buildId, original.question)
  }

  build(id: string): Build | undefined {
    return this.#builds.get(id)
  }
}
