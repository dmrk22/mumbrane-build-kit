import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildCsp, createNonce, isNonce } from '../../src/lib/security/csp.ts'
import { PERMISSIONS_POLICY, SECURITY_HEADERS, SHAREABLE_HEADERS } from '../../src/lib/security/headers.ts'
import { toScriptSafeJson } from '../../src/lib/security/serialize.ts'

const nonce = createNonce()
const directives = (csp: string) =>
  new Map(csp.split('; ').map((d) => [d.split(' ')[0], d.split(' ').slice(1)]))

test('production CSP is strict', () => {
  const csp = buildCsp({ nonce, dev: false, upgradeInsecure: true })
  const d = directives(csp)
  assert.deepEqual(d.get('script-src'), ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"])
  assert.deepEqual(d.get('style-src'), ["'self'", `'nonce-${nonce}'`])
  assert.deepEqual(d.get('object-src'), ["'none'"])
  assert.deepEqual(d.get('base-uri'), ["'none'"])
  assert.deepEqual(d.get('frame-ancestors'), ["'none'"])
  assert.deepEqual(d.get('form-action'), ["'self'"])
  assert.deepEqual(d.get('connect-src'), ["'self'"])
  assert.ok(d.has('upgrade-insecure-requests'))
  assert.doesNotMatch(csp, /unsafe-/)
})

test('upgrade-insecure-requests only when requested and never in dev', () => {
  assert.doesNotMatch(buildCsp({ nonce, dev: false, upgradeInsecure: false }), /upgrade-insecure-requests/)
  assert.doesNotMatch(buildCsp({ nonce, dev: true, upgradeInsecure: true }), /upgrade-insecure-requests/)
})

test('dev CSP adds exactly unsafe-eval, unsafe-inline (styles only) and ws:', () => {
  const prod = directives(buildCsp({ nonce, dev: false, upgradeInsecure: false }))
  const dev = directives(buildCsp({ nonce, dev: true, upgradeInsecure: false }))
  assert.deepEqual(dev.get('script-src'), [...(prod.get('script-src') ?? []), "'unsafe-eval'"])
  assert.deepEqual(dev.get('style-src'), ["'self'", "'unsafe-inline'"])
  assert.deepEqual(dev.get('connect-src'), ["'self'", 'ws:'])
  for (const [name, values] of prod) {
    if (name === 'script-src' || name === 'style-src' || name === 'connect-src') continue
    assert.deepEqual(dev.get(name), values, name)
  }
})

test('malformed nonces are refused', () => {
  for (const bad of ['', 'abc', `${nonce}x`, `${nonce}; script-src *`, "abc'def==", 'A'.repeat(24)]) {
    assert.throws(() => buildCsp({ nonce: bad, dev: false, upgradeInsecure: false }), bad)
  }
  assert.equal(isNonce(null), false)
})

test('1,000 nonces are unique and well-formed', () => {
  const seen = new Set<string>()
  for (let i = 0; i < 1000; i++) {
    const n = createNonce()
    assert.ok(isNonce(n), n)
    seen.add(n)
  }
  assert.equal(seen.size, 1000)
})

test('static security headers equal SECURITY §3.4', () => {
  assert.deepEqual(
    SECURITY_HEADERS.map((h) => [h.key, h.key === 'Permissions-Policy' ? 'PP' : h.value]),
    [
      ['Strict-Transport-Security', 'max-age=63072000'],
      ['X-Content-Type-Options', 'nosniff'],
      ['X-Frame-Options', 'DENY'],
      ['Referrer-Policy', 'strict-origin-when-cross-origin'],
      ['Permissions-Policy', 'PP'],
      ['Cross-Origin-Opener-Policy', 'same-origin'],
      ['Cross-Origin-Embedder-Policy', 'require-corp'],
      ['Cross-Origin-Resource-Policy', 'same-origin'],
      ['Origin-Agent-Cluster', '?1'],
      ['X-DNS-Prefetch-Control', 'off'],
      ['X-Permitted-Cross-Domain-Policies', 'none'],
    ],
  )
  assert.deepEqual(SHAREABLE_HEADERS, [{ key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' }])
})

test('Permissions-Policy has no duplicate features and only self for fullscreen/clipboard-write', () => {
  const entries = PERMISSIONS_POLICY.split(', ')
  const features = entries.map((e) => e.split('=')[0])
  assert.equal(new Set(features).size, features.length)
  for (const entry of entries) {
    const allowed = entry === 'fullscreen=(self)' || entry === 'clipboard-write=(self)'
    assert.ok(allowed || entry.endsWith('=()'), entry)
  }
})

test('toScriptSafeJson cannot break out of a script element and round-trips', () => {
  const value = { a: '</script><script>alert(1)</script>', b: '<!-- x -->', c: 'a & b', d: '\u2028\u2029' }
  const json = toScriptSafeJson(value)
  assert.doesNotMatch(json, /[<>&\u2028\u2029]/)
  assert.deepEqual(JSON.parse(json), value)
  assert.throws(() => toScriptSafeJson(undefined), TypeError)
})
