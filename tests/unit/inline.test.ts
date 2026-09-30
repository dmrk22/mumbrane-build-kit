import assert from 'node:assert/strict'
import { test } from 'node:test'
import { inlineText, parseInline } from '../../src/lib/inline.ts'

const text = (value: string) => ({ type: 'text', value })

test('each markup form becomes its node', () => {
  assert.deepEqual(parseInline('plain'), [text('plain')])
  assert.deepEqual(parseInline('a **b** c'), [
    text('a '),
    { type: 'strong', children: [text('b')] },
    text(' c'),
  ])
  assert.deepEqual(parseInline('*closed worlds.*'), [{ type: 'em', children: [text('closed worlds.')] }])
  assert.deepEqual(parseInline('ask `orderone` now'), [
    text('ask '),
    { type: 'code', value: 'orderone' },
    text(' now'),
  ])
  assert.deepEqual(parseInline('[Moth](/moth)'), [{ type: 'link', href: '/moth', children: [text('Moth')] }])
  assert.deepEqual(parseInline('[mail](mailto:hello@mumbrane.com)'), [
    { type: 'link', href: 'mailto:hello@mumbrane.com', children: [text('mail')] },
  ])
})

test('markup nests', () => {
  assert.deepEqual(parseInline('**see [the *field*](/research)**'), [
    {
      type: 'strong',
      children: [
        text('see '),
        {
          type: 'link',
          href: '/research',
          children: [text('the '), { type: 'em', children: [text('field')] }],
        },
      ],
    },
  ])
  assert.deepEqual(parseInline('*a **b** c*'), [
    { type: 'em', children: [text('a '), { type: 'strong', children: [text('b')] }, text(' c')] },
  ])
  // Code is literal: markers inside it are text.
  assert.deepEqual(parseInline('`**x**`'), [{ type: 'code', value: '**x**' }])
})

test('unbalanced or empty markers stay text', () => {
  for (const s of [
    '**open',
    'open*',
    '*',
    '**',
    '``x',
    '[text',
    '[text]',
    '[text](/moth',
    '[](/moth)',
    '****',
  ])
    assert.equal(inlineText(parseInline(s)), s, s)
  assert.deepEqual(parseInline('2 * 3 = 6'), [text('2 * 3 = 6')])
})

test('HTML is never interpreted: <script> stays text', () => {
  assert.deepEqual(parseInline('<script>alert(1)</script>'), [text('<script>alert(1)</script>')])
  assert.deepEqual(parseInline('**<img src=x onerror=alert(1)>**'), [
    { type: 'strong', children: [text('<img src=x onerror=alert(1)>')] },
  ])
})

test('rejected links become plain text (the link is dropped, the words stay)', () => {
  for (const href of ['https://evil.example', '//evil.example', 'data:text/html,x', 'http://x.com']) {
    const nodes = parseInline(`see [this](${href}) now`)
    assert.ok(!nodes.some((n) => n.type === 'link'), href)
    assert.equal(inlineText(nodes), 'see this now')
  }
  // The href ends at the first ')', so a trailing ')' may remain as text — but never the link.
  const nodes = parseInline('see [this](javascript:alert(1)) now')
  assert.ok(!nodes.some((n) => n.type === 'link'))
  assert.ok(!inlineText(nodes).includes('javascript'))
})

test('links cannot nest', () => {
  const nodes = parseInline('[a [b](/x) c](/y)')
  const links = JSON.stringify(nodes).match(/"type":"link"/g) ?? []
  assert.ok(links.length <= 1)
})

test('adversarial 20,000-character inputs parse in linear time (< 50 ms)', () => {
  const n = 20_000
  const inputs = [
    '['.repeat(n),
    '*'.repeat(n),
    '*a'.repeat(n / 2),
    '**a'.repeat(n / 3),
    '[a]('.repeat(n / 4),
    '`'.repeat(n),
    '[*`'.repeat(n / 3),
    `${'**'.repeat(n / 4)}${'*'.repeat(n / 2)}`,
  ]
  for (const input of inputs) {
    const t0 = performance.now()
    const nodes = parseInline(input)
    const ms = performance.now() - t0
    assert.ok(ms < 50, `${input.slice(0, 6)}… took ${ms.toFixed(1)} ms`)
    assert.ok(inlineText(nodes).length <= input.length)
  }
})
