// Pure CSP builder, shared by src/proxy.ts and tests/unit/csp.test.ts.

export type CspOptions = { nonce: string; dev: boolean; upgradeInsecure: boolean }

const NONCE_SHAPE = /^[A-Za-z0-9+/]{22}==$/

/** 128-bit random nonce, base64. A new one for every response. */
export function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export function isNonce(value: string | null | undefined): value is string {
  return typeof value === 'string' && NONCE_SHAPE.test(value)
}

export function buildCsp({ nonce, dev, upgradeInsecure }: CspOptions): string {
  if (!isNonce(nonce)) throw new Error('Refusing to build a CSP with a malformed nonce')
  const directives: ReadonlyArray<readonly [string, readonly string[]]> = [
    ['default-src', ["'self'"]],
    ['script-src', ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(dev ? ["'unsafe-eval'"] : [])]],
    ['style-src', dev ? ["'self'", "'unsafe-inline'"] : ["'self'", `'nonce-${nonce}'`]],
    ['img-src', ["'self'", 'data:', 'blob:']],
    ['font-src', ["'self'"]],
    ['connect-src', dev ? ["'self'", 'ws:'] : ["'self'"]],
    ['media-src', ["'self'"]],
    ['worker-src', ["'self'"]],
    ['manifest-src', ["'self'"]],
    ['frame-src', ["'none'"]],
    ['object-src', ["'none'"]],
    ['base-uri', ["'none'"]],
    ['form-action', ["'self'"]],
    ['frame-ancestors', ["'none'"]],
  ]
  const policy = directives.map(([name, values]) => `${name} ${values.join(' ')}`)
  // Only over HTTPS: WebKit upgrades http://localhost subresources too, which breaks local e2e.
  if (!dev && upgradeInsecure) policy.push('upgrade-insecure-requests')
  return policy.join('; ')
}

/** Report-only Trusted Types trial (§3.5). Sent only when CSP_TT_TRIAL=1. */
export const TRUSTED_TYPES_REPORT_ONLY = "require-trusted-types-for 'script'; trusted-types 'none'"
