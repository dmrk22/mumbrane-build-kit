import type { Page } from '@playwright/test'

export const prod = !!process.env.E2E_PROD

/** HTML routes to check. Grows with the route registry (src/content/routes.ts, P2). */
export const ROUTES = ['/'] as const
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
