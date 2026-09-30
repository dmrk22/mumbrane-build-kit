import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Page } from '@playwright/test'
import { ROUTES as REGISTRY } from '../../src/content/routes.ts'

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

export function collectConsole(page: Page): string[] {
  const messages: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') messages.push(`${msg.type()}: ${msg.text()}`)
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
