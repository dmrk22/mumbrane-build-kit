// `pnpm shots / /moth …` → full-page screenshots at 375/768/1440 (+ 1440 reduced motion) into
// .shots/<route>/ via the Playwright `shots` project (tests/e2e/shots.spec.ts).
import { spawnSync } from 'node:child_process'

export const WIDTHS = [375, 768, 1440] as const
const ROUTE = /^\/[A-Za-z0-9/_-]*$/

/** Folder name for a route: `/` → `home`, `/research/x` → `research_x`. */
export function routeDir(route: string): string {
  return route === '/' ? 'home' : route.replace(/^\/+|\/+$/g, '').replaceAll('/', '_')
}

export function shotPaths(route: string): string[] {
  const dir = `.shots/${routeDir(route)}`
  return [...WIDTHS.map((w) => `${dir}/${w}.png`), `${dir}/1440-reduced.png`]
}

function main() {
  const routes = process.argv.slice(2)
  if (routes.length === 0 || routes.some((r) => !ROUTE.test(r))) {
    console.error('usage: pnpm shots / /moth … (internal paths only)')
    process.exitCode = 2
    return
  }
  const result = spawnSync('pnpm', ['exec', 'playwright', 'test', '--project=shots'], {
    stdio: 'inherit',
    env: { ...process.env, SHOTS_ROUTES: routes.join(',') },
  })
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1
    return
  }
  for (const route of routes) for (const path of shotPaths(route)) process.stdout.write(`${path}\n`)
}

if (import.meta.main) main()
