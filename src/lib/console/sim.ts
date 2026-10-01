// The console's deterministic in-browser simulator (CONSOLE §6). Pure TS: no DOM, no network, no
// storage. It mimics Moth's outcome vocabulary over small fixtures; it is not Moth.
import type {
  Build,
  Definition,
  Fact,
  Limit,
  Refusal,
  Requirement,
  Result,
  Status,
  Trace,
  TraceRequirement,
  World,
} from './types.ts'

export const MAX_QUESTION = 2048
const MAX_DEPTH = 16
const MAX_STEPS = 256

// ---------------------------------------------------------------- builds

/** FNV-1a 32-bit over a string; deterministic build ids (CONSOLE §6.4). */
export function fnv1a(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

/** The world under a variant (or none) as an immutable snapshot; facts never change between builds. */
export function makeBuild(world: World, variantId: string | null): Build {
  const variant = world.variants.find((v) => v.id === variantId)
  const definitions = world.definitions.map((d) =>
    variant && d.id === variant.replace.definitionId
      ? { ...d, requires: variant.replace.requires, text: variant.replace.text }
      : d,
  )
  const id = fnv1a(JSON.stringify({ definitions, facts: world.facts })).slice(0, 4)
  return Object.freeze({
    id,
    worldId: world.id,
    variantId: variant ? variant.id : null,
    definitions,
    facts: world.facts,
  })
}

// ---------------------------------------------------------------- language

/** Trim, collapse whitespace, drop one trailing "?", lowercase, straighten quotes. */
export function normalise(raw: string): string {
  let s = raw.trim().replace(/\s+/g, ' ')
  if (s.endsWith('?')) s = s.slice(0, -1).trimEnd()
  return s.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
}

// Fixed, anchored patterns with no nested quantifiers: linear time on any input (CONSOLE §6.2).
const IS_FORM = /^is ([a-z]+) (?:a|an) ([a-z][a-z -]*)$/
const MEET_FORM = /^does ([a-z]+) meet the requirements for (?:a|an) ([a-z][a-z -]*)$/
// Control and invisible formatting characters (zero-width, bidi overrides).
const CONTROL = /[\p{Cc}\p{Cf}]/u

export const termKey = (t: string) =>
  t
    .toLowerCase()
    .replace(/[-\s]+/g, ' ')
    .trim()

export function parse(normalised: string): { entity: string; term: string } | null {
  const m = IS_FORM.exec(normalised) ?? MEET_FORM.exec(normalised)
  return m?.[1] && m[2] ? { entity: m[1], term: termKey(m[2]) } : null
}

const isNegated = (s: string) => s.split(' ').some((t) => t === 'not' || t.endsWith("n't"))

// ---------------------------------------------------------------- evaluation

const article = (term: string) => (/^[aeiou]/.test(term) ? 'an' : 'a')
const code = (id: string) => `\`${id}\``

class Stop extends Error {
  readonly limit: Limit
  constructor(limit: Limit) {
    super(limit.code)
    this.limit = limit
  }
}

type Ctx = { build: Build; steps: number; visiting: Set<string> }

function definitionById(build: Build, id: string): Definition {
  const d = build.definitions.find((x) => x.id === id)
  if (!d) throw new Error(`fixture error: no definition ${id}`)
  return d
}

function combine(statuses: readonly Status[]): Status {
  if (statuses.includes('conflict')) return 'conflict'
  return statuses.every((s) => s === 'supported') ? 'supported' : 'missing'
}

function holds(entity: string, def: Definition, depth: number, ctx: Ctx): Trace {
  ctx.steps++
  if (ctx.steps > MAX_STEPS) throw new Stop({ code: 'steps' })
  if (depth > MAX_DEPTH) throw new Stop({ code: 'depth' })
  const key = `${entity}|${def.id}`
  // A cycle never loops: it simply establishes nothing.
  if (ctx.visiting.has(key))
    return { entity, term: def.term, text: def.text, status: 'missing', requirements: [] }
  ctx.visiting.add(key)
  const requirements = def.requires.map((r) => requirement(entity, r, depth, ctx))
  ctx.visiting.delete(key)
  return {
    entity,
    term: def.term,
    text: def.text,
    status: combine(requirements.map((r) => r.status)),
    requirements,
  }
}

function requirement(entity: string, r: Requirement, depth: number, ctx: Ctx): TraceRequirement {
  const facts = ctx.build.facts
  if (r.type === 'property') {
    const of = facts.filter(
      (f): f is Extract<Fact, { type: 'property' }> =>
        f.type === 'property' && f.entity === entity && f.property === r.property,
    )
    const pos = of.filter((f) => !f.negated)
    const neg = of.filter((f) => f.negated)
    const cited = [...pos, ...neg].map((f) => ({ text: f.text, negated: !!f.negated }))
    const status: Status = pos.length && neg.length ? 'conflict' : pos.length ? 'supported' : 'missing'
    return { text: `${code(entity)} ${r.text}`, status, facts: cited }
  }
  const target = definitionById(ctx.build, r.target)
  if (r.type === 'is') {
    const via = holds(entity, target, depth + 1, ctx)
    return {
      text: `${code(entity)} is ${article(target.term)} ${target.term}`,
      status: via.status,
      facts: [],
      via,
    }
  }
  const links = facts.filter(
    (f): f is Extract<Fact, { type: 'relation' }> =>
      f.type === 'relation' && f.entity === entity && f.relation === r.relation,
  )
  if (links.length === 0) {
    return {
      text: `no ${r.relation} that is ${article(target.term)} ${target.term}`,
      status: 'missing',
      facts: [],
    }
  }
  const tried = links.map((l) => ({ link: l, via: holds(l.object, target, depth + 1, ctx) }))
  const pick =
    tried.find((t) => t.via.status === 'supported') ??
    tried.find((t) => t.via.status === 'conflict') ??
    (tried[0] as (typeof tried)[number])
  return {
    text: `its ${r.relation} ${code(pick.link.object)} is ${article(target.term)} ${target.term}`,
    status: pick.via.status,
    facts: [{ text: pick.link.text, negated: false }],
    via: pick.via,
  }
}

/** Leaves of the trace that were not established, as short sentences. */
function leaves(t: Trace, want: Status): { missing: string[]; conflicts: string[] } {
  const missing: string[] = []
  const conflicts: string[] = []
  const walk = (tr: Trace) => {
    for (const r of tr.requirements) {
      if (r.status !== want) continue
      if (r.via) walk(r.via)
      else if (want === 'conflict') conflicts.push(...r.facts.map((f) => f.text))
      else missing.push(r.text)
    }
  }
  walk(t)
  return { missing, conflicts }
}

// ---------------------------------------------------------------- the pipeline

/** `ask(world, build, raw) → Result` (CONSOLE §6.1). Never throws on any input. */
export function ask(world: World, build: Build, raw: string, id: string): Result {
  const t0 = performance.now()
  const base = { id, question: raw, worldId: world.id, buildId: build.id, missing: [], conflicts: [] }
  const done = (r: Omit<Result, 'ms'>): Result => ({ ...r, ms: performance.now() - t0 })
  const refuse = (refusal: Refusal) => done({ ...base, outcome: 'REFUSED', refusal })

  if (raw.length > MAX_QUESTION)
    return done({ ...base, outcome: 'RESOURCE_LIMIT', limit: { code: 'length' } })
  if (CONTROL.test(raw)) return refuse({ code: 'control' })
  const q = normalise(raw)
  if (isNegated(q)) return refuse({ code: 'negated' })
  const parsed = parse(q)
  if (!parsed) return refuse({ code: 'form' })
  if (!world.entities.some((e) => e.id === parsed.entity))
    return refuse({ code: 'undeclared', subject: parsed.entity })
  const def = build.definitions.find((d) => termKey(d.term) === parsed.term)
  if (!def) return refuse({ code: 'undefined', subject: parsed.term })

  const scope = { entity: parsed.entity, term: def.term }
  try {
    const trace = holds(parsed.entity, def, 0, { build, steps: 0, visiting: new Set() })
    if (trace.status === 'supported') return done({ ...base, ...scope, outcome: 'SUPPORTED', trace })
    if (trace.status === 'conflict') {
      return done({
        ...base,
        ...scope,
        outcome: 'CONFLICT',
        trace,
        conflicts: leaves(trace, 'conflict').conflicts,
      })
    }
    return done({
      ...base,
      ...scope,
      outcome: 'NO_SUPPORTED_PROOF',
      trace,
      missing: leaves(trace, 'missing').missing,
    })
  } catch (e) {
    if (e instanceof Stop) return done({ ...base, ...scope, outcome: 'RESOURCE_LIMIT', limit: e.limit })
    throw e
  }
}
