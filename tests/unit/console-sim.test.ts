import assert from 'node:assert/strict'
import test from 'node:test'
import { WORLDS, worldById } from '../../src/content/console/worlds.ts'
import { ask, makeBuild, normalise, parse } from '../../src/lib/console/sim.ts'
import type { Outcome, WorldId } from '../../src/lib/console/types.ts'

const run = (world: WorldId, q: string, variant: string | null = null) => {
  const w = worldById(world)
  return ask(w, makeBuild(w, variant), q, 'r1')
}

// CONSOLE §5.2 — golden outcomes for every example question, in every world and variant.
const GOLDEN: [WorldId, string | null, string, Outcome][] = [
  ['purchasing', null, 'Is orderone a purchase-ready item?', 'SUPPORTED'],
  [
    'purchasing',
    null,
    'Does ordertwo meet the requirements for a purchase-ready item?',
    'NO_SUPPORTED_PROOF',
  ],
  ['purchasing', null, 'Is orderthree a purchase-ready item?', 'CONFLICT'],
  ['purchasing', null, 'Is orderfour a purchase-ready item?', 'NO_SUPPORTED_PROOF'],
  ['purchasing', null, 'Is ordertwo not a purchase-ready item?', 'REFUSED'],
  ['purchasing', null, 'Is atlas an approved supplier?', 'SUPPORTED'],
  ['purchasing', 'audit', 'Is orderone a purchase-ready item?', 'NO_SUPPORTED_PROOF'],
  ['purchasing', 'audit', 'Does ordertwo meet the requirements for a purchase-ready item?', 'SUPPORTED'],
  ['purchasing', 'audit', 'Is orderthree a purchase-ready item?', 'NO_SUPPORTED_PROOF'],
  ['purchasing', 'audit', 'Is orderfour a purchase-ready item?', 'NO_SUPPORTED_PROOF'],
  ['libraries', null, 'Is bookone a recommended book?', 'SUPPORTED'],
  ['libraries', null, 'Is booktwo a lendable book?', 'NO_SUPPORTED_PROOF'],
  ['libraries', null, 'Is bookthree a recommended book?', 'NO_SUPPORTED_PROOF'],
  ['libraries', null, 'Is bookfour a lendable book?', 'REFUSED'],
  ['libraries', null, 'Is bookone a rare book?', 'REFUSED'],
  ['libraries', 'no-summary', 'Is bookthree a recommended book?', 'SUPPORTED'],
  ['trails', null, 'Is trailone a family trail?', 'SUPPORTED'],
  ['trails', null, 'Is trailtwo an accessible trail?', 'NO_SUPPORTED_PROOF'],
  ['trails', null, 'Is trailthree an accessible trail?', 'CONFLICT'],
  ['trails', 'unpaved', 'Is trailtwo an accessible trail?', 'SUPPORTED'],
  ['trails', 'unpaved', 'Is trailthree an accessible trail?', 'CONFLICT'],
  ['venues', null, 'Is hallone a ready venue?', 'SUPPORTED'],
  ['venues', null, 'Is halltwo a suitable venue?', 'NO_SUPPORTED_PROOF'],
  ['venues', null, 'Is hallthree a ready venue?', 'NO_SUPPORTED_PROOF'],
  ['venues', null, 'Does hallone meet the requirements for a ready venue?', 'SUPPORTED'],
  ['venues', 'no-booking', 'Is hallthree a ready venue?', 'SUPPORTED'],
]

test('golden outcomes for every example in every world and variant', () => {
  for (const [world, variant, q, want] of GOLDEN) {
    assert.equal(run(world, q, variant).outcome, want, `${world}/${variant ?? 'base'}: ${q}`)
  }
})

test('every example chip in every world is covered by the golden table', () => {
  const covered = new Set(GOLDEN.filter((g) => g[1] === null).map((g) => g[2]))
  for (const w of WORLDS) {
    for (const q of w.examples) if (q.length <= 2048) assert.ok(covered.has(q), `${w.id}: ${q}`)
  }
})

test('the evidence names what is missing or contradictory', () => {
  assert.deepEqual(run('purchasing', 'Is ordertwo a purchase-ready item?').missing, [
    '`birch` passed inspection',
  ])
  assert.deepEqual(run('purchasing', 'Is orderfour a purchase-ready item?').missing, [
    '`orderfour` has funds available',
  ])
  assert.deepEqual(run('purchasing', 'Is orderthree a purchase-ready item?').conflicts, [
    'cedar passed inspection.',
    'cedar did not pass inspection.',
  ])
  assert.deepEqual(run('libraries', 'Is bookthree a recommended book?').missing, [
    '`bookthree` has a reviewed summary',
  ])
  // An explicit negative fact explains the gap; it never becomes a "fails" outcome.
  const halltwo = run('venues', 'Is halltwo a suitable venue?')
  assert.equal(halltwo.outcome, 'NO_SUPPORTED_PROOF')
  const licence = halltwo.trace?.requirements.find((r) => r.text.includes('licence'))
  assert.deepEqual(licence?.facts, [{ text: 'halltwo has no licence for events.', negated: true }])
  // The supported trace reaches the supplier's own evidence.
  const one = run('purchasing', 'Is orderone a purchase-ready item?')
  const supplier = one.trace?.requirements[1]
  assert.equal(supplier?.text, 'its supplier `atlas` is an approved supplier')
  assert.deepEqual(supplier?.via?.requirements[0]?.facts, [
    { text: 'atlas passed inspection.', negated: false },
  ])
})

test('refusals say why', () => {
  assert.deepEqual(run('libraries', 'Is bookfour a lendable book?').refusal, {
    code: 'undeclared',
    subject: 'bookfour',
  })
  assert.deepEqual(run('libraries', 'Is bookone a rare book?').refusal, {
    code: 'undefined',
    subject: 'rare book',
  })
  assert.deepEqual(run('purchasing', "Isn't orderone a purchase-ready item?").refusal, { code: 'negated' })
  assert.deepEqual(run('purchasing', 'Tell me about orderone').refusal, { code: 'form' })
})

test('the language is forgiving about case, spacing, hyphens and curly quotes', () => {
  assert.equal(normalise('  Is   ORDERONE a purchase-ready item?  '), 'is orderone a purchase-ready item')
  assert.equal(run('purchasing', 'is orderone a purchase ready item').outcome, 'SUPPORTED')
  assert.deepEqual(parse('is atlas an approved   supplier'), { entity: 'atlas', term: 'approved supplier' })
  assert.equal(parse('is atlas'), null)
  assert.equal(run('purchasing', 'Is orderone a purchase  ready   item').outcome, 'SUPPORTED')
})

test('hostile inputs refuse or stop without throwing, fast', () => {
  const hostile = [
    'x'.repeat(2049),
    '<script>alert(1)</script>',
    'Is orderone a purchase‮ready item?',
    'Is order​one a purchase-ready item?',
    '?!?.,;:',
    ' '.repeat(10_000),
    'is '.repeat(600),
    `Is orderone a ${'a-'.repeat(900)}item?`,
  ]
  const w = worldById('purchasing')
  const build = makeBuild(w, null)
  for (const q of hostile) {
    const t0 = performance.now()
    const r = ask(w, build, q, 'h')
    assert.ok(
      r.outcome === 'REFUSED' || r.outcome === 'RESOURCE_LIMIT',
      `${JSON.stringify(q.slice(0, 20))} → ${r.outcome}`,
    )
    assert.ok(performance.now() - t0 < 5, 'each ask completes in < 5 ms')
  }
  assert.equal(ask(w, build, 'x'.repeat(2049), 'h').limit?.code, 'length')
  const long = worldById('trails').examples.at(-1) ?? ''
  assert.ok(long.length > 2048 && long.length <= 2100)
  assert.equal(run('trails', long).outcome, 'RESOURCE_LIMIT')
})

test('build ids are stable and change only with the definitions', () => {
  for (const w of WORLDS) {
    const a = makeBuild(w, null)
    assert.equal(a.id, makeBuild(w, null).id)
    assert.match(a.id, /^[0-9a-f]{4}$/)
    for (const v of w.variants) assert.notEqual(makeBuild(w, v.id).id, a.id, `${w.id}/${v.id}`)
  }
})

test('a cycle establishes nothing instead of looping; depth and step budgets stop the work', () => {
  const w = worldById('libraries')
  const cyclic = {
    ...w,
    definitions: [
      {
        id: 'a',
        term: 'alpha book',
        kind: 'book',
        text: '',
        requires: [{ type: 'is' as const, target: 'b', text: '' }],
      },
      {
        id: 'b',
        term: 'beta book',
        kind: 'book',
        text: '',
        requires: [{ type: 'is' as const, target: 'a', text: '' }],
      },
    ],
    variants: [],
  }
  assert.equal(
    ask(cyclic, makeBuild(cyclic, null), 'Is bookone an alpha book?', 'c').outcome,
    'NO_SUPPORTED_PROOF',
  )
  const chain = Array.from({ length: 20 }, (_, i) => ({
    id: `d${i}`,
    term: `level${'x'.repeat(i)} book`,
    kind: 'book',
    text: '',
    requires: i < 19 ? [{ type: 'is' as const, target: `d${i + 1}`, text: '' }] : [],
  }))
  const deep = { ...w, definitions: chain, variants: [] }
  const r = ask(deep, makeBuild(deep, null), 'Is bookone a level book?', 'd')
  assert.equal(r.outcome, 'RESOURCE_LIMIT')
  assert.equal(r.limit?.code, 'depth')
})
