import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseInterest, parseUseCaseFilter, parseWorld } from '../../src/lib/security/params.ts'

const hostile = [
  undefined,
  '',
  'government', // the old site's value: ignored
  '<script>alert(1)</script>',
  'javascript:alert(1)',
  'Research',
  ' research',
  'x'.repeat(10_000),
  { toString: () => 'research' },
  ['<script>', 'research'],
  42,
]

test('parseInterest accepts known interests (first array element) and rejects the rest', () => {
  assert.equal(parseInterest('research'), 'research')
  assert.equal(parseInterest(['careers', 'press']), 'careers')
  for (const raw of hostile) assert.equal(parseInterest(raw), undefined, String(raw))
})

test('parseUseCaseFilter defaults to all', () => {
  assert.equal(parseUseCaseFilter('legal'), 'legal')
  assert.equal(parseUseCaseFilter(['security']), 'security')
  for (const raw of hostile) assert.equal(parseUseCaseFilter(raw), 'all', String(raw))
})

test('parseWorld accepts the four worlds only', () => {
  assert.equal(parseWorld('venues'), 'venues')
  for (const raw of [...hostile, 'purchasing ', 'PURCHASING'])
    assert.equal(parseWorld(raw), undefined, String(raw))
})
