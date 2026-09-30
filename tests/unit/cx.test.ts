import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cx } from '../../src/lib/cx.ts'

test('cx joins truthy parts with single spaces', () => {
  assert.equal(cx('a', 'b'), 'a b')
  assert.equal(cx('a', false, null, undefined, '', 'b'), 'a b')
  assert.equal(cx(), '')
  assert.equal(cx(false && 'x', 'y'), 'y')
})
