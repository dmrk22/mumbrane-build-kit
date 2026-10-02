# Security specification

Security is the owner's first priority. This file is normative: where it gives code, write that
code (adapting only to the installed versions' APIs, and logging any adaptation in DECISIONS).
Where it says "must", a test or the guard enforces it.

Contents: §1 Threat model · §2 Rules · §3 Headers & CSP · §4 Security modules (code) ·
§5 Supply chain · §6 Forms · §7 Console · §8 Environment & Neon seams · §9 Disclosure ·
§10 Release checklist

---

## §1 Threat model

This build is a marketing site plus a console preview. It stores no user data, has no accounts,
calls no APIs and loads nothing from third parties. That is the security posture we are
protecting: **a small, static-feeling attack surface with nothing to steal and nothing to hijack.**

| Asset | Threat | Primary controls |
|---|---|---|
| Visitors' browsers | XSS via content strings, URL params, form echo | Strict nonce CSP, no HTML sinks, inline parser with href allowlist (§4.4), Zod on every input (§4.5) |
| Visitors' privacy | Tracking, third-party leakage, PII in URLs/logs | No third-party origins, no analytics, no cookies, POST-only forms, no logging of input (§2, §6) |
| Brand integrity | Clickjacking, content injection, spoofed links | `frame-ancestors 'none'`, XFO DENY, link allowlist, locked logo |
| Supply chain | Malicious or hijacked packages, install scripts | 8+11 allowlisted deps, exact pins, 24 h release age, trust policy, strict build scripts (§5) |
| Secrets (future) | Leakage into client bundles or the repo | No secrets exist in this build; `server-only` env module; guard rules (§8) |
| Future console | Credential phishing, key exposure | No credential fields at all; keys never issued in preview (§7) |
| Trust | Misleading claims read as fact | Claims policy (CONTENT §4) — treated as a security property |

Out of scope for this build: authentication, payments, databases, rate limiting infrastructure,
WAF/CDN configuration (owner's hosting decision; see §10 hand-off notes).

---

## §2 Rules (the guard and Biome enforce most of these)

### §2.1 Rendering
- Never use `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`,
  `document.write`, `eval`, `new Function`, string timers, `setAttribute('style', …)`.
  **Single exception:** `src/lib/security/json-ld.tsx` (escaped JSON data block, §4.3).
- Content strings may contain inline markup only through `src/lib/inline.ts` (bold, italic,
  code, links). It returns React nodes, never HTML. Links go through `toSafeHref` (§4.4).
- No `style` prop anywhere in `.tsx` (it becomes a `style=""` attribute in SSR HTML, which the
  CSP blocks — also for client components, whose first render happens on the server). Use
  classes, `data-*` attributes + CSS, SVG presentation attributes (`width`, `fill`,
  `transform`, `opacity` are attributes, not styles), or CSSOM from client code
  (`el.style.setProperty`, GSAP) after mount.
- Do not use `next/image` (renders `style` attributes; also adds the `/_next/image` optimiser as
  attack surface) or `next/script`. Paintings use `<Painting>` (`<picture>` with pre-built files).
- SVG: only inline SVG we author (React elements) or files in `public/` that we generated. Never
  render user-supplied SVG or markup.
- Only the JSON-LD data block may be an inline `<script>`; the console theme bootstrap is an
  external same-origin file loaded with the nonce and `suppressHydrationWarning` (browsers hide
  nonce attributes after parsing) — CONSOLE §10.2.

### §2.2 Input
- Every external input is parsed with Zod at the boundary: search params (§4.5), form data
  (§6), environment (§8), URL segments (`[slug]` checked against the content registry →
  `notFound()`). Invalid input is **ignored or rejected, never reflected** into markup, titles,
  canonical URLs or redirects.
- Redirects only to constant internal paths. No "return to" parameters.
- Length-cap every text input before any processing (forms §6, console question ≤ 2,048 chars).
- Regular expressions applied to user input must be linear-time (no nested quantifiers).

### §2.3 Output and data exposure
- Server → client props are serialised into the page. Pass only what the component renders.
- Error pages (`error.tsx`, `global-error.tsx`, `not-found.tsx`) never render `error.message`,
  stacks, digests or the requested path. They offer a way home and (for errors) a retry.
- No `console.log` of user input anywhere. Biome warns on `console`; only `console.error` for
  unexpected failures, without payloads.
- No source maps in production (`productionBrowserSourceMaps: false`).

### §2.4 Third parties, storage and cookies
- Zero runtime third-party requests: no CDNs, remote fonts, analytics, tag managers, embeds,
  maps, video hosts, social widgets, or remote images. Social links are plain links.
- Fonts are self-hosted by `next/font` at build time.
- No cookies are set by this build. (If ever needed: `__Host-` prefix, `Secure`, `HttpOnly`,
  `SameSite=Lax`, no PII.)
- Web storage holds UI preferences only (the console theme key `mb-console-theme`).
  Console session history lives in memory and is discarded on reload.

### §2.5 Links
- Internal links: `next/link` via `<SmartLink>`, typed routes. External links: only hosts in
  `EXTERNAL_HOSTS` (§4.4), `rel="noopener noreferrer"`, marked with ↗ and an `aria-label` suffix
  "(opens external site)". `target="_blank"` is not used by default (users choose).
- `mailto:` only for `@mumbrane.com` addresses.

### §2.6 Repository hygiene
- `.env*` files are never read, printed, copied or committed (`.env.example` is the only
  tracked one and contains no secrets). The guard hooks block attempts.
- No credentials, tokens or connection strings in code, tests, fixtures or docs.
- Commits are pushed to `origin` with plain pushes only (D-150); Vercel deploys `main` from them. Never force-push or publish packages.

---

## §3 Headers & CSP

### §3.1 Where headers come from
- **CSP** (per request, with a fresh nonce): `src/proxy.ts` (Next 16 proxy, formerly middleware).
- **Static security headers** (every response, incl. JS/CSS/images/404): `next.config.ts`
  `headers()` using `src/lib/security/headers.ts`.
- `poweredByHeader: false` removes `X-Powered-By`.

### §3.2 The policy (production)

```
default-src 'self';
script-src 'self' 'nonce-{N}' 'strict-dynamic';
style-src 'self' 'nonce-{N}';
img-src 'self' data: blob:;
font-src 'self';
connect-src 'self';
media-src 'self';
worker-src 'self';
manifest-src 'self';
frame-src 'none';
object-src 'none';
base-uri 'none';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests
```

Development differs only where the dev server needs it: `script-src` adds `'unsafe-eval'`
(React Refresh), `style-src` is `'self' 'unsafe-inline'` (dev overlay; a nonce would disable
`'unsafe-inline'`), `connect-src` adds `ws:` (HMR), and `upgrade-insecure-requests` is omitted.
`upgrade-insecure-requests` is also omitted whenever the request itself is not HTTPS (local
`pnpm start` for e2e): WebKit would upgrade `http://localhost` asset URLs and break the page.
Production never contains `unsafe-*`. `data:` in `img-src` exists for the LQIP placeholders
(generated CSS, §P5) and inline SVG data URIs in CSS; `blob:` for console JSON export previews.

No `report-uri`/`report-to`: there is no backend to receive reports. Violations are detected in
e2e through `securitypolicyviolation` events (§3.6).

### §3.3 Why nonces, and what they cost
Next.js attaches the request's nonce to its own scripts (it reads it from the request's CSP
header set by the proxy). A nonce must be unique per response, so **every page renders
dynamically** — the root layout reads `headers()` to opt in. Consequences, accepted in D-003:
- No static HTML/ISR for pages and no `cacheComponents`/PPR (a prerendered shell cannot carry a
  per-request nonce). Keep pages cheap: content is local TypeScript, there is no data fetching.
- Route handlers (`robots`, `sitemap`, `manifest`, `llms.txt`, `/md/*`) and files in `public/`
  are unaffected and stay static.
- Rejected alternatives: hash-based CSP (Next's inline RSC payload scripts change per render),
  `'unsafe-inline'` (defeats the purpose), SRI-only (`experimental.sri` does not cover inline
  scripts). Revisit only if Next ships first-class static CSP support; log it if so.

### §3.4 Static headers (all responses)

| Header | Value | Why |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000` | Force HTTPS on this host. `includeSubDomains` and `preload` wait for the owner (D-005): browsers cache them for the full max-age, so an HTTP-only subdomain would break for up to two years. |
| `X-Content-Type-Options` | `nosniff` | No MIME sniffing |
| `X-Frame-Options` | `DENY` | Legacy clickjacking defence (CSP `frame-ancestors` is primary) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | No paths/queries leak to other origins |
| `Permissions-Policy` | see §4.2 | Deny every powerful feature; `fullscreen` and `clipboard-write` for self only |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolate the browsing context group |
| `Cross-Origin-Embedder-Policy` | `require-corp` | Everything is same-origin, so this is free; fall back to `credentialless` only if something breaks (log it) |
| `Cross-Origin-Resource-Policy` | `same-origin` (`cross-origin` for `/og/*`) | Stop hot-linking/Spectre-style reads; OG cards must stay fetchable |
| `Origin-Agent-Cluster` | `?1` | Origin-keyed agent cluster |
| `X-DNS-Prefetch-Control` | `off` | No speculative DNS to external link hosts |
| `X-Permitted-Cross-Domain-Policies` | `none` | Legacy plugin policy files |

Caching: `/paintings/*` `public, max-age=86400, stale-while-revalidate=604800`. Pages are
dynamic (Next sends `private, no-store`). `_next/static` keeps Next's immutable caching.

### §3.5 Trusted Types trial (P14)
When `CSP_TT_TRIAL=1` (server env, set only by the e2e run in P14), the proxy also sends
`Content-Security-Policy-Report-Only: require-trusted-types-for 'script'; trusted-types 'none'`.
The e2e suite records report-only violations separately from enforced ones. If a full run shows
**zero** Trusted Types violations, move `require-trusted-types-for 'script'` into the enforced
policy (plus `trusted-types 'none'`) and log D-1xx. If the only violations come from framework
chunk loading, allow exactly the policy names the framework creates (e.g. `trusted-types
nextjs#bundler`) and re-test. Otherwise keep it off, log the offending sinks, and list it under
known limitations. Never add `'allow-duplicates'` or a permissive default policy.

### §3.6 Verification (implemented in QUALITY §3 `security.spec.ts`, tagged `@security`)
1. Every HTML route in the registry (at P0: `/` and a 404) returns a CSP containing a 22-char+`==`
   nonce, `'strict-dynamic'`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`, and in
   production no `unsafe-` (and no `upgrade-insecure-requests` over plain-HTTP localhost).
2. Two requests to the same route get different nonces.
3. Every `<script>` element in the served HTML either has the response's nonce or is
   `type="application/ld+json"`; the raw HTML contains no ` style="` attribute and no `on…=`
   event-handler attributes.
4. Every static header in §3.4 is present on: an HTML page, a `_next/static` JS file, a CSS
   file, an image in `public/`, `robots.txt`, and a 404 page. `X-Powered-By` is absent.
5. Loading and scrolling each route produces zero enforced `securitypolicyviolation` events
   (listener installed with `page.addInitScript`), zero console errors, and zero requests to
   any origin other than the app's (network log). In Chromium, no console message mentions
   `Permissions-Policy` (unrecognised features must be removed). The only tolerated console
   error is the document's own 404 on not-found checks.
6. `/lab` returns 404 in production; `/console/*` carries `noindex`; unknown slugs return 404.
7. Hostile query strings (`?interest=<script>`, `?interest=javascript:alert(1)`, 10 kB values)
   are not reflected anywhere in the HTML.

---

## §4 Security modules (write these)

All files under `src/lib/**` import each other with relative `.ts` paths and have no framework
imports, so `node --test` runs their unit tests directly.

### §4.1 `src/lib/security/csp.ts`

```ts
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
```

### §4.1b `src/proxy.ts`

```ts
import { type NextRequest, NextResponse } from 'next/server'
import { buildCsp, createNonce, TRUSTED_TYPES_REPORT_ONLY } from './lib/security/csp.ts'

export function proxy(request: NextRequest) {
  const nonce = createNonce()
  const csp = buildCsp({
    nonce,
    dev: process.env.NODE_ENV === 'development',
    upgradeInsecure: request.nextUrl.protocol === 'https:',
  })

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce) // always overwrite any client-sent value
  requestHeaders.set('Content-Security-Policy', csp) // Next reads the nonce from here

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  if (process.env.CSP_TT_TRIAL === '1') {
    response.headers.set('Content-Security-Policy-Report-Only', TRUSTED_TYPES_REPORT_ONLY)
  }
  return response
}

export const config = {
  matcher: [
    {
      source:
        '/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-touch-icon.png|icons/|brand/|paintings/|og/|\\.well-known/|robots.txt|sitemap.xml|manifest.webmanifest|llms.txt|console-theme.js|md/).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
```

In `src/app/layout.tsx`: `const raw = (await headers()).get('x-nonce'); const nonce = isNonce(raw) ?
raw : undefined` — pass `nonce` only where a script needs it (the console theme bootstrap).
Reading `headers()` here is what makes every page dynamic (§3.3). Never render the nonce as
text or put it in a data attribute.

### §4.2 `src/lib/security/headers.ts`

```ts
export type Header = { key: string; value: string }

export const PERMISSIONS_POLICY = [
  'accelerometer=()', 'autoplay=()', 'browsing-topics=()', 'camera=()', 'clipboard-read=()',
  'clipboard-write=(self)', 'display-capture=()', 'encrypted-media=()', 'fullscreen=(self)',
  'geolocation=()', 'gyroscope=()', 'hid=()', 'idle-detection=()', 'magnetometer=()',
  'microphone=()', 'midi=()', 'payment=()', 'picture-in-picture=()',
  'publickey-credentials-get=()', 'screen-wake-lock=()', 'serial=()', 'usb=()',
  'xr-spatial-tracking=()',
].join(', ')

export const SECURITY_HEADERS: readonly Header[] = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' }, // + includeSubDomains; preload after D-005
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: PERMISSIONS_POLICY },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Origin-Agent-Cluster', value: '?1' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
]

/** Social cards must stay fetchable by link-preview renderers on other origins. */
export const SHAREABLE_HEADERS: readonly Header[] = [
  { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
]
```

`next.config.ts` (security-relevant parts; the rest per BUILD_PLAN §P0.files):

```ts
import type { NextConfig } from 'next'
import { SECURITY_HEADERS, SHAREABLE_HEADERS } from './src/lib/security/headers.ts'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  productionBrowserSourceMaps: false,
  images: { unoptimized: true },
  async headers() {
    return [
      { source: '/:path*', headers: [...SECURITY_HEADERS] },
      { source: '/og/:path*', headers: [...SHAREABLE_HEADERS] }, // later rule wins for the same key
      {
        source: '/paintings/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ]
  },
  // redirects(): PAGES §0.6
}

export default nextConfig
```

If the installed Next cannot import a relative `.ts` file from `next.config.ts`, inline the two
arrays in `next.config.ts`, make `headers.ts` re-export nothing, point `csp.test.ts` at the
config's exported arrays instead, and log the decision. Header names/values stay identical.

Server Actions (used by the forms, §6): set the body size limit to `64kb` — in Next 16.3 that is
`experimental: { serverActions: { bodySizeLimit: '64kb' } }`; if the installed version moved the
key, follow its docs and log it.

### §4.3 JSON-LD — `src/lib/security/serialize.ts` + `src/lib/security/json-ld.tsx`

```ts
// serialize.ts
const ESCAPES: Readonly<Record<string, string>> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

/** JSON that cannot break out of a <script type="application/ld+json"> element. */
export function toScriptSafeJson(value: unknown): string {
  const json = JSON.stringify(value)
  if (typeof json !== 'string') throw new TypeError('Value is not JSON-serialisable')
  return json.replace(/[<>&\u2028\u2029]/g, (ch) => ESCAPES[ch] ?? '')
}
```

```tsx
// json-ld.tsx — the only sanctioned dangerouslySetInnerHTML in the project.
import { toScriptSafeJson } from './serialize.ts'

type JsonValue = string | number | boolean | null | readonly JsonValue[] | { readonly [key: string]: JsonValue }

export function JsonLd({ data }: { data: { readonly [key: string]: JsonValue } }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toScriptSafeJson(data) }} />
}
```

JSON-LD is a data block: it is never executed, so it needs no nonce. Data comes only from typed
content, never from request input. Biome: disable `noDangerouslySetInnerHtml` for this one file.

### §4.4 Links — `src/lib/security/links.ts`

```ts
// Link policy (SECURITY §2.5). Used by <SmartLink> and src/lib/inline.ts.

export const EXTERNAL_HOSTS: ReadonlySet<string> = new Set([
  'x.com',
  'www.instagram.com',
  'www.linkedin.com',
  'github.com',
])
export const MAIL_DOMAINS: ReadonlySet<string> = new Set(['mumbrane.com'])

export type SafeHref =
  | { kind: 'internal'; href: `/${string}` }
  | { kind: 'fragment'; href: `#${string}` }
  | { kind: 'external'; href: string; host: string }
  | { kind: 'mailto'; href: string }

// Control characters, space, DEL and backslash never appear in a link we author. (Checked by
// code point rather than a RegExp: Biome rejects control characters in regex literals.)
function hasForbiddenChar(value: string): boolean {
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0
    if (code <= 0x20 || code === 0x7f || ch === '\\') return true
  }
  return false
}

export function toSafeHref(input: string): SafeHref | null {
  const href = input.trim()
  if (href.length === 0 || href.length > 2048 || hasForbiddenChar(href)) return null
  if (href.startsWith('#')) {
    return /^#[A-Za-z][\w-]*$/.test(href) ? { kind: 'fragment', href: href as `#${string}` } : null
  }
  if (href.startsWith('/')) {
    return href.startsWith('//') ? null : { kind: 'internal', href: href as `/${string}` }
  }
  try {
    const url = new URL(href)
    if (url.protocol === 'mailto:') {
      const address = decodeURIComponent(url.pathname).toLowerCase()
      const at = address.lastIndexOf('@')
      if (at < 1 || !MAIL_DOMAINS.has(address.slice(at + 1))) return null
      return { kind: 'mailto', href: `mailto:${address}${url.search}` }
    }
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null
    if (!EXTERNAL_HOSTS.has(url.hostname)) return null
    return { kind: 'external', href: url.href, host: url.hostname }
  } catch {
    return null
  }
}
```

`<SmartLink>` renders: internal/fragment → `next/link`; external → `<a href rel="noopener
noreferrer">` + visually-hidden "(opens external site)" + ↗ glyph; mailto → `<a>`; `null` →
plain `<span>` (and in development, `console.error` naming the rejected href so it is fixed).
A unit test (`links.test.ts`) walks every content module and asserts that every internal href
exists in `src/content/routes.ts` (or is an article slug) and every other href is accepted.

### §4.5 Params — `src/lib/security/params.ts`

```ts
import { z } from 'zod'

const first = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value)

export const INTERESTS = [
  'general', 'research', 'sales', 'business', 'customer-support', 'legal', 'security',
  'pricing', 'careers', 'press',
] as const
export type Interest = (typeof INTERESTS)[number]
const InterestParam = z.enum(INTERESTS)

/** `/contact?interest=…` → a known interest, or undefined (never reflected). */
export function parseInterest(raw: unknown): Interest | undefined {
  const result = InterestParam.safeParse(first(raw))
  return result.success ? result.data : undefined
}

export const USE_CASE_FILTERS = ['all', 'business', 'customer-support', 'legal', 'security'] as const
export type UseCaseFilter = (typeof USE_CASE_FILTERS)[number]
const UseCaseParam = z.enum(USE_CASE_FILTERS)

/** `/solutions/use-cases?domain=…` → a known filter, defaulting to 'all'. */
export function parseUseCaseFilter(raw: unknown): UseCaseFilter {
  const result = UseCaseParam.safeParse(first(raw))
  return result.success ? result.data : 'all'
}

export const WORLD_IDS = ['purchasing', 'libraries', 'trails', 'venues'] as const
export type WorldId = (typeof WORLD_IDS)[number]
const WorldParam = z.enum(WORLD_IDS)

/** `/console/playground?world=…` → a known world, or undefined (entry screen chooses). */
export function parseWorld(raw: unknown): WorldId | undefined {
  const result = WorldParam.safeParse(first(raw))
  return result.success ? result.data : undefined
}
```

Pages receive `searchParams: Promise<Record<string, string | string[] | undefined>>` (Next 16);
`await` it, pass the raw value to a parser, use only the parsed result. The legacy value
`interest=government` from the old site is simply ignored.

---

## §5 Supply chain

### §5.1 Principles
- Only the packages in `.claude/allowed-deps.json` (8 runtime, 11 dev). The Bash guard blocks
  anything else, requires `pnpm add -E` with exact registry versions (no `npm:`/`jsr:` aliases,
  protocols, tarballs or dist-tags) and blocks `npm`, `npx`, `pnpx`, `yarn`, `bun`, `pnpm dlx`,
  `pnpm create`, `pnpm up`, `pnpm config set` and `pnpm approve-builds`.
- Registry packages only; no git/tarball/file specs. Lockfile committed.
- Install scripts are denied unless listed in `allowBuilds` (only `sharp` and platform binaries
  of allowlisted packages may be added there, each with a DECISIONS entry).
- Browsers for Playwright come from `pnpm exec playwright install` (the official channel).
- Documentation is read with WebFetch on allowlisted domains; the shell may only reach
  mumbrane.com (content harvest) and localhost.

### §5.2 `pnpm-workspace.yaml` (write verbatim; pnpm ≥ 11)

```yaml
# Supply-chain hardening — plan/SECURITY.md §5.2. Single-package repo (no `packages:` list).
# Several of these are pnpm 11 defaults; they are stated explicitly so a downgrade cannot
# silently weaken them.

# Never resolve a version published less than 24 hours ago…
minimumReleaseAge: 1440
minimumReleaseAgeStrict: true
minimumReleaseAgeIgnoreMissingTime: false
# …except Next.js, whose security releases must land immediately (§5.3).
minimumReleaseAgeExclude:
  - next
  - '@next/*'

# Fail if a package's publishing trust level drops (e.g. provenance disappears) — the classic
# signature of a hijacked maintainer account.
trustPolicy: no-downgrade

# Transitive dependencies must come from the registry (no git repos or tarball URLs).
blockExoticSubdeps: true

# Install scripts are denied unless reviewed and listed here.
strictDepBuilds: true
allowBuilds:
  sharp: true

# Exact versions and a matching engine, always.
savePrefix: ''
engineStrict: true
```

pnpm 12 rejects unrecognised keys in this file (`ERR_PNPM_UNRECOGNIZED_WORKSPACE_SETTINGS`) —
good: typos cannot silently disable protection. If the installed version renamed a key, look it
up on pnpm.io/settings, use the new name with the same meaning, and log it. If `engineStrict`
blocks a transitive package whose `engines` field is merely outdated (pnpm 12 enforces it through
dependency edges), set `engineStrict: false` and log it — `.nvmrc`, `engines` and the preflight
still pin Node 24.

If `pnpm install` stops because another package wants to run a build script, do not blanket-allow
it: check whether it is a platform binary of an allowlisted package (e.g. `@tailwindcss/oxide`,
`@img/sharp-*`); if so add `name: true`, else `name: false`, and log D-1xx either way. If
`trustPolicy` blocks a package, inspect that exact version's provenance on the registry page and
add a version-pinned `trustPolicyExclude` entry only if the drop is explained (log it); otherwise
pick the previous version.

### §5.3 Security floors and patching
- `next` ≥ **16.3.7** and the latest React 19.2.x patch (floors derived from advisories current
  when this plan was written; `/setup` re-checks nextjs.org/blog and react.dev/blog).
- Whenever `pnpm audit --prod` reports an advisory, upgrade with `pnpm add -E pkg@fixed`, run
  `pnpm verify`, and log it. `pnpm audit --prod --audit-level=moderate` must be clean at P0 and
  P14 and after any dependency change.
- The proxy only sets headers. Never rely on it for access control (lesson of CVE-2025-29927).

### §5.4 Adding a dependency
Not without the owner. Write a DECISIONS proposal (what it is, size, maintainers, last release,
advisory history, install scripts, why the platform or an allowed package cannot do it) and add
it to "Open questions for the owner". Meanwhile build the smallest in-house version.

---

## §6 Forms (contact and sales)

The forms are real, accessible, validated forms whose submissions go nowhere yet.

- **Transport**: a Server Action per form (`src/app/(site)/contact/actions.ts`) used through
  `useActionState`, so the form works without JavaScript (progressive enhancement), stays POST
  (no data in URLs or history), and gets Next's built-in Origin check against CSRF.
- **Validation**: one Zod schema per form in `src/lib/forms.ts`, used on the client for inline
  feedback and on the server as the authority.

```ts
// src/lib/forms.ts (excerpt — also the sales schema)
import { z } from 'zod'
import { INTERESTS } from './security/params.ts'

const text = (min: number, max: number) => z.string().trim().min(min).max(max)

export const ContactSchema = z.object({
  name: text(1, 120),
  email: z.email().max(254),
  organization: text(0, 160).optional(),
  interest: z.enum(INTERESTS),
  message: text(20, 4000),
})
export type ContactInput = z.infer<typeof ContactSchema>
```

- **Sales schema**: name, work email, company (1–160), role (0–120), company size (enum:
  `1-50`, `51-500`, `501-5000`, `5000+`), area (enum: business, customer-support, legal,
  security, other), timeframe (enum: exploring, this-quarter, this-year), message (20–4000).
  No phone numbers, no budget fields (data minimisation).
- **Honeypot**: a visually hidden `website` input (`tabIndex={-1}`, `autoComplete="off"`,
  `aria-hidden`, class `sr-only`-style off-screen, never `display:none` so naive bots fill it).
  If it is non-empty the action returns the success state without doing anything.
- **Action result** (discriminated union): `{ status: 'idle' }`, `{ status: 'invalid', errors,
  values }` (values echoed only into input `defaultValue`s — React escapes them), `{ status:
  'preview' }`. Nothing is stored, logged, emailed or forwarded. A comment marks the seam:
  "Backend (SECURITY §8): persist via ContactRepository when NEXT_PUBLIC_BACKEND_ENABLED".
- **Preview success state** (copy in CONTENT §3.7): says plainly that online submissions are not
  connected yet, and offers **"Send it by email instead"** — a `mailto:hello@mumbrane.com` link
  whose subject/body are built from the validated values with `encodeURIComponent`, capped at
  1,800 characters total (truncate the body with "…"). This keeps the form genuinely useful.
- **Accessibility**: labels always visible, `aria-describedby` for hints and errors, errors
  summarised in an `aria-live="polite"` region and focus moved to the first invalid field.
- **Autocomplete**: `name`, `email`, `organization`, `organization-title`; `off` for the honeypot.
- **Limits**: body size limit 64 KB (§4.2); every field length-capped in the schema.

---

## §7 Console preview

- **No credential UI.** No password, key, token, card or login fields anywhere. "Sign in"
  does not exist in this build. The legacy `/login` URL redirects to `/console`.
- **No network.** The playground runs a deterministic simulator over typed fixtures shipped in
  the bundle (CONSOLE §5–§6). No fetch/XHR/WebSocket; `connect-src 'self'` would block it anyway.
- **Untrusted text**: the question box is user input. Cap at 2,048 characters (Moth's documented
  question limit), normalise whitespace, parse with the linear-time tokenizer in CONSOLE §6.2,
  and render it back only as text nodes. Never build RegExps or HTML from it.
- **Keys page**: demonstrates the future flow but never creates, displays or copies a key-like
  string. Its final step states "No key was created — keys arrive with the hosted console".
- **Exports**: "Download JSON" builds a `Blob` from the in-memory result (`application/json`),
  downloads via an object URL, and revokes it immediately. The file is labelled as a simulation.
- **Clipboard**: `navigator.clipboard.writeText` on explicit user action only.
- **Storage**: only the theme preference (`localStorage['mb-console-theme']`), read inside
  `try/catch` (storage can be disabled). Session history is memory-only.
- **Indexing**: `noindex, nofollow` on every console route; excluded from sitemap; disallowed in
  robots.txt.
- **Future auth (not now)**: sessions in `__Host-` cookies, `HttpOnly`, `Secure`,
  `SameSite=Lax`; keys shown once, stored hashed; per-key scopes; audit log; all behind server
  components/actions. Recorded here so the UI does not paint us into a corner.

---

## §8 Environment & Neon seams

### §8.1 `src/lib/env.ts` (public; safe to import anywhere)

```ts
import { z } from 'zod'

const PublicEnv = z.object({
  NEXT_PUBLIC_SITE_URL: z.url({ protocol: /^https?$/ }).default('https://mumbrane.com'),
  NEXT_PUBLIC_BACKEND_ENABLED: z.enum(['true', 'false']).default('false'),
})

// Each variable is referenced literally so Next can inline NEXT_PUBLIC_* values at build time.
const parsed = PublicEnv.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_BACKEND_ENABLED: process.env.NEXT_PUBLIC_BACKEND_ENABLED,
})
if (!parsed.success) throw new Error(`Invalid public environment:\n${z.prettifyError(parsed.error)}`)

export const publicEnv = {
  siteUrl: new URL(parsed.data.NEXT_PUBLIC_SITE_URL),
  backendEnabled: parsed.data.NEXT_PUBLIC_BACKEND_ENABLED === 'true',
} as const
```

### §8.2 `src/lib/env.server.ts` (server only; unused in this build)

```ts
import 'server-only'
import { z } from 'zod'

// Future Neon configuration. Every variable is optional until the backend phase.
const ServerEnv = z.object({
  DATABASE_URL: z.string().startsWith('postgres').optional(), // pooled connection string
  DATABASE_URL_UNPOOLED: z.string().startsWith('postgres').optional(), // migrations only
})

export function serverEnv() {
  const parsed = ServerEnv.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
  })
  if (!parsed.success) throw new Error('Invalid server environment') // never echo values
  return parsed.data
}
```

Unit tests never import this file (`server-only` throws outside the React server condition).

### §8.3 `.env.example`

```
# Public (inlined into the client bundle at build time — never put secrets here)
NEXT_PUBLIC_SITE_URL=https://mumbrane.com
NEXT_PUBLIC_BACKEND_ENABLED=false

# Server-only, for the future Neon backend. Leave empty in this build.
# DATABASE_URL=
# DATABASE_URL_UNPOOLED=
```

### §8.4 Seams for the Neon phase (design now, wire later)
- `src/lib/data/types.ts` declares the repository interfaces the UI will need
  (`ContactRepository.submit(input)`, `SalesRepository.submit(input)`), and
  `src/lib/data/preview.ts` implements them as no-ops returning `{ status: 'preview' }`. The
  Server Actions call the repository; swapping in a Neon implementation later changes one import.
- Rules for that phase (write them into the handoff, do not implement): `@neondatabase/serverless`
  or `pg` added through the owner; queries only via parameterised tagged templates; a
  least-privilege role per purpose; migrations via the unpooled URL from CI, never at request
  time; Row-Level Security if the Neon Data API is used; secrets only in the host's encrypted
  env; Neon branches for previews; rate limiting and bot protection on form endpoints; retention
  policy aligned with the privacy notice.
- `NEXT_PUBLIC_BACKEND_ENABLED` stays `false` in this build. `scripts/guard.ts` fails if
  `.env.example` sets it to anything else or if any file imports a database client.

---

## §9 Disclosure policy and security.txt

### §9.1 `public/.well-known/security.txt` (write in /setup; `Expires` = setup date + 365 days)

```
Contact: mailto:hello@mumbrane.com
Expires: 2027-10-01T00:00:00.000Z
Preferred-Languages: en
Canonical: https://mumbrane.com/.well-known/security.txt
Policy: https://mumbrane.com/legal/responsible-disclosure
```

`hello@mumbrane.com` is the address the current site publishes. A dedicated
`security@mumbrane.com` is an open question for the owner (D-006); switch when confirmed.

### §9.2 Repository `SECURITY.md` and `/legal/responsible-disclosure` (same substance)
- **How to report**: email the contact above with "Security" in the subject; include the URL,
  steps to reproduce, impact, and whether it has been shared with anyone else. Do not include
  personal data you obtained.
- **What we ask**: give us a reasonable time to fix before disclosure; do not access, modify or
  delete data that isn't yours; no denial-of-service, spam, social engineering or physical tests;
  stop and report as soon as you have shown the issue.
- **What we do**: acknowledge receipt and keep you informed until resolution; credit you if you
  wish. (Response-time targets are an owner decision — D-006; until set, state no number.)
- **Scope**: mumbrane.com and its console preview. Out of scope: third-party services linked from
  the site, findings that require a compromised device, missing headers without a demonstrated
  impact, and automated scanner output without a proof of concept.
- **Safe harbour** sentence is drafted but marked "Pending owner and legal review" in the page's
  draft banner (CONTENT §3.13).

---

## §10 Release checklist (P14 — every box must be ticked in BUILD_STATE)

- [ ] `node .claude/hooks/selftest.mjs` passes and both live canaries were refused (P0 log).
- [ ] `pnpm audit --prod --audit-level=moderate` clean; versions ≥ floors (§5.3).
- [ ] `package.json` deps equal the allowlist exactly; all versions exact; lockfile committed.
- [ ] `pnpm guard` clean; Biome clean with no rule disabled except the JSON-LD override.
- [ ] Production e2e `@security` suite green on chromium, mobile and webkit.
- [ ] CSP has no `unsafe-*` in production; nonce differs per request; zero violations on every
      route incl. console interactions, menus, forms, 404 and error pages.
- [ ] No third-party request on any route (network log); no cookies set (`document.cookie` empty,
      no `Set-Cookie` headers).
- [ ] Every `'use client'` file reviewed for data exposure: props minimal, no secrets, no env
      beyond `publicEnv`.
- [ ] Forms: hostile inputs (script tags, 10 kB strings, unicode control chars, honeypot)
      handled; nothing reflected unsafely; nothing logged.
- [ ] Links: `links.test.ts` green; no `target="_blank"` without `noopener noreferrer`.
- [ ] `/lab` 404 in production; console `noindex`; robots and sitemap correct.
- [ ] `security.txt` valid (Contact, Expires in the future, Canonical, Policy).
- [ ] Trusted Types trial run and outcome logged (§3.5).
- [ ] Hand-off notes for the owner's hosting: serve only over HTTPS; keep the proxy on the Node
      runtime; do not add analytics or tag managers without revisiting this file; HSTS `preload`
      and `includeSubDomains` only after D-005; if TLS terminates at a proxy that does not
      forward the protocol, `upgrade-insecure-requests` is omitted (HSTS still applies); set up
      the Neon phase per §8.4.
