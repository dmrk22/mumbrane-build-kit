// Console preview types (CONSOLE §5.1, §13). UI types for a simulation — not a promise about
// Moth's schema.

export type WorldId = 'purchasing' | 'libraries' | 'trails' | 'venues'

export type Requirement =
  /** "has funds available" — a property of the entity itself. */
  | { type: 'property'; property: string; text: string }
  /** An object related by `relation` must hold `target` ("its supplier is an approved supplier"). */
  | { type: 'relation'; relation: string; target: string; text: string }
  /** Layered: the entity must itself hold `target` ("is a lendable book"). */
  | { type: 'is'; target: string; text: string }

export type Definition = {
  id: string
  term: string
  kind: string
  requires: readonly Requirement[]
  text: string
}

export type Fact =
  | { type: 'property'; entity: string; property: string; negated?: true; text: string }
  | { type: 'relation'; entity: string; relation: string; object: string; text: string }

export type Variant = {
  id: string
  label: string
  effect: string
  replace: { definitionId: string; requires: readonly Requirement[]; text: string }
}

export type World = {
  id: WorldId
  name: string
  blurb: string
  entities: readonly { id: string; kind: string }[]
  definitions: readonly Definition[]
  facts: readonly Fact[]
  examples: readonly string[]
  variants: readonly Variant[]
}

/** An immutable snapshot of a world under one variant (CONSOLE §6.4). */
export type Build = {
  id: string
  worldId: WorldId
  variantId: string | null
  definitions: readonly Definition[]
  facts: readonly Fact[]
}

export type Status = 'supported' | 'missing' | 'conflict'

/** The evaluation, mirrored for the evidence panel: definition → requirements → facts. */
export type Trace = {
  entity: string
  term: string
  text: string
  status: Status
  requirements: readonly TraceRequirement[]
}
export type TraceRequirement = {
  text: string
  status: Status
  /** Facts quoted as their sentences (a negative fact is cited even when it only explains a gap). */
  facts: readonly { text: string; negated: boolean }[]
  /** Relation and layered requirements nest the related entity's own evaluation. */
  via?: Trace
}

export type Outcome = 'SUPPORTED' | 'NO_SUPPORTED_PROOF' | 'CONFLICT' | 'REFUSED' | 'RESOURCE_LIMIT'

export type Refusal =
  | { code: 'negated' }
  | { code: 'form' }
  | { code: 'control' }
  | { code: 'undeclared'; subject: string }
  | { code: 'undefined'; subject: string }

export type Limit = { code: 'length' } | { code: 'depth' } | { code: 'steps' }

export type Result = {
  id: string
  question: string
  worldId: WorldId
  buildId: string
  outcome: Outcome
  entity?: string
  term?: string
  trace?: Trace
  /** Leaves that were not established ("birch passed inspection"). */
  missing: readonly string[]
  /** Contradictory fact sentences, for CONFLICT. */
  conflicts: readonly string[]
  refusal?: Refusal
  limit?: Limit
  /** Measured with performance.now() around the evaluation. */
  ms: number
}
