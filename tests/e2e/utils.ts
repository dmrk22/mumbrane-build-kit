import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Page, Request } from '@playwright/test'
import { REGISTRY } from '../../src/content/routes.ts'

export const prod = !!process.env.E2E_PROD

/** App route patterns with a page file, e.g. ['', 'legal/[slug]'] (route groups removed). */
export function pagePatterns(dir = 'src/app', prefix: string[] = []): string[][] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.isFile()) return e.name === 'page.tsx' ? [prefix] : []
    if (!e.isDirectory() || e.name.startsWith('_')) return []
    const segment = /^\(.+\)$/.test(e.name) ? [] : [e.name]
    return pagePatterns(join(dir, e.name), [...prefix, ...segment])
  })
}

export function matchesPattern(path: string, pattern: readonly string[]): boolean {
  const parts = path.split('/').filter(Boolean)
  return (
    parts.length === pattern.length &&
    pattern.every((seg, i) => seg === parts[i] || (seg.startsWith('[') && !seg.startsWith('[...')))
  )
}

const patterns = pagePatterns()

/**
 * HTML routes to check: every registry route whose page exists so far (the registry lists the
 * whole site from P2; pages arrive phase by phase). `/lab` is dev-only and not in the registry.
 */
export const ROUTES = REGISTRY.map((r) => r.path).filter((path) =>
  patterns.some((p) => matchesPattern(path, p)),
)
export const MISSING = '/this-page-does-not-exist'

/** The URL to open for a registry route: the playground needs a world (without one it redirects). */
export const visit = (route: string): string =>
  route === '/console/playground' ? `${route}?world=purchasing` : route

export type Violation = { disposition: string; directive: string; blockedURI: string }

/** Records every securitypolicyviolation event from the first script onwards. */
export async function collectViolations(page: Page): Promise<() => Promise<Violation[]>> {
  await page.addInitScript(() => {
    const store: Violation[] = []
    Object.defineProperty(window, '__cspViolations', { value: store })
    document.addEventListener('securitypolicyviolation', (e) => {
      store.push({ disposition: e.disposition, directive: e.effectiveDirective, blockedURI: e.blockedURI })
    })
  })
  return () => page.evaluate(() => (window as unknown as { __cspViolations: Violation[] }).__cspViolations)
}

/**
 * Registry routes whose page is not built yet (pages land phase by phase). Empty once the site is
 * complete, which makes the tolerance below a no-op.
 */
export const UNBUILT: ReadonlySet<string> = new Set(
  REGISTRY.map((r) => r.path).filter((p) => !(ROUTES as readonly string[]).includes(p)),
)

/** A production RSC prefetch (`?_rsc=`) of a registry route that has no page yet. */
export function isUnbuiltPrefetch(url: string): boolean {
  const u = new URL(url, 'http://x')
  return u.searchParams.has('_rsc') && UNBUILT.has(u.pathname)
}

export function collectConsole(page: Page): string[] {
  const messages: string[] = []
  page.on('console', (msg) => {
    if (msg.type() !== 'error' && msg.type() !== 'warning') return
    // Links already point at the whole site; until a page exists, Next's prefetch of it 404s.
    if (msg.text().startsWith('Failed to load resource') && isUnbuiltPrefetch(msg.location().url)) return
    messages.push(`${msg.type()}: ${msg.text()}`)
  })
  page.on('pageerror', (err) => messages.push(`pageerror: ${err.message}`))
  return messages
}

export function externalRequests(page: Page, origin: string): string[] {
  const urls: string[] = []
  page.on('request', (req) => {
    const url = new URL(req.url())
    if (url.protocol !== 'data:' && url.protocol !== 'blob:' && url.origin !== origin) urls.push(req.url())
  })
  return urls
}

/** Resolves once fonts are ready and no CSS transition or animation is running. */
export async function settled(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  )
}

/**
 * Tracks the page's requests. `quiet()` resolves once every request except Next's RSC prefetches
 * (`?_rsc=`) has finished and nothing new has started for 500 ms. Used instead of
 * `networkidle`, which never settles while Chromium holds an unread prefetch body open.
 */
export function network(page: Page) {
  const pending = new Set<Request>()
  let lastStart = Date.now()
  const isPrefetch = (r: Request) => new URL(r.url()).searchParams.has('_rsc')
  page.on('request', (r) => {
    if (isPrefetch(r)) return
    pending.add(r)
    lastStart = Date.now()
  })
  page.on('requestfinished', (r) => pending.delete(r))
  page.on('requestfailed', (r) => pending.delete(r))
  return {
    async quiet(timeoutMs = 15_000): Promise<void> {
      const deadline = Date.now() + timeoutMs
      while (Date.now() < deadline) {
        if (pending.size === 0 && Date.now() - lastStart >= 500) return
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
      throw new Error(`network not quiet: ${[...pending].map((r) => r.url()).join(', ')}`)
    },
  }
}
