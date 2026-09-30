// Budgets from BUILD_PLAN §Budgets: file counts, dependency allowlist and pins, source shape,
// and (after a build) compressed JS/CSS totals. Per-route first-load JS is measured in e2e.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

export const LIMITS = {
  sourceFiles: 230,
  componentFiles: 80,
  maxLines: 400,
  maxDepth: 4,
  cssKb: 60,
}
const GENERATED = new Set([
  'src/components/brand/mark-geometry.ts',
  'src/content/paintings.manifest.json',
  'src/app/lqip.css',
  // Built from src/content/source/*.md (itself uncounted); grows with every article.
  'src/content/articleBodies.ts',
])
const EXACT = /^\d+\.\d+\.\d+$/

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const path = join(dir, name).replaceAll('\\', '/')
    if (statSync(path).isDirectory()) walk(path, out)
    else out.push(path)
  }
  return out
}

export const isCounted = (f: string) =>
  !f.startsWith('src/content/source/') && !GENERATED.has(f) && !f.endsWith('.DS_Store')

type Deps = Record<string, string>

/** Every dependency must be allowlisted and exactly pinned; the counts must stay in budget. */
export function checkDeps(runtime: Deps, dev: Deps, allowed: { runtime: string[]; dev: string[] }): string[] {
  const errors: string[] = []
  const check = (deps: Deps, list: string[], kind: string) => {
    for (const [name, version] of Object.entries(deps)) {
      if (!list.includes(name)) errors.push(`${kind} dependency ${name} is not in the allowlist`)
      if (!EXACT.test(version)) errors.push(`${name}@${version} is not an exact version`)
    }
  }
  check(runtime, allowed.runtime, 'runtime')
  check(dev, allowed.dev, 'dev')
  if (Object.keys(runtime).length > allowed.runtime.length) errors.push('too many runtime dependencies')
  if (Object.keys(dev).length > allowed.dev.length) errors.push('too many dev dependencies')
  return errors
}

export function checkShape(files: readonly string[], lineCount: (f: string) => number): string[] {
  const errors: string[] = []
  for (const f of files) {
    if (!f.startsWith('src/')) continue
    const depth = f.split('/').length - 2 // directories below src/
    if (depth > LIMITS.maxDepth) errors.push(`${f}: directory depth ${depth} > ${LIMITS.maxDepth}`)
    if (/\/index\.tsx?$/.test(f)) errors.push(`${f}: barrel/index files are not allowed`)
  }
  for (const f of files) {
    if (!/\.(tsx?|css)$/.test(f)) continue
    const lines = lineCount(f)
    if (lines > LIMITS.maxLines) errors.push(`${f}: ${lines} lines > ${LIMITS.maxLines}`)
  }
  return errors
}

const kb = (bytes: number) => Math.round(bytes / 102.4) / 10

function main() {
  const errors: string[] = []
  const files = ['src', 'scripts', 'tests'].flatMap((d) => walk(d)).filter(isCounted)
  const components = files.filter((f) => f.startsWith('src/components/'))
  process.stdout.write(
    `source files ${files.length}/${LIMITS.sourceFiles} · components ${components.length}/${LIMITS.componentFiles}\n`,
  )
  if (files.length > LIMITS.sourceFiles) errors.push('source file budget exceeded')
  if (components.length > LIMITS.componentFiles) errors.push('component file budget exceeded')

  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
    dependencies?: Deps
    devDependencies?: Deps
  }
  const allowed = JSON.parse(readFileSync('.claude/allowed-deps.json', 'utf8')) as {
    runtime: string[]
    dev: string[]
  }
  const runtime = pkg.dependencies ?? {}
  const dev = pkg.devDependencies ?? {}
  process.stdout.write(
    `dependencies ${Object.keys(runtime).length}/${allowed.runtime.length} runtime · ${Object.keys(dev).length}/${allowed.dev.length} dev\n`,
  )
  errors.push(...checkDeps(runtime, dev, allowed))
  errors.push(...checkShape(files, (f) => readFileSync(f, 'utf8').split('\n').length))

  const staticDir = '.next/static'
  if (existsSync(staticDir)) {
    const built = walk(staticDir)
    const gz = (ext: string) =>
      built.filter((f) => f.endsWith(ext)).reduce((sum, f) => sum + gzipSync(readFileSync(f)).length, 0)
    const js = gz('.js')
    const css = gz('.css')
    process.stdout.write(
      `built JS (all chunks, gzip) ${kb(js)} KB · CSS (gzip) ${kb(css)}/${LIMITS.cssKb} KB\n`,
    )
    if (css > LIMITS.cssKb * 1024) errors.push('CSS budget exceeded')
  } else {
    process.stdout.write('no .next/static yet: run pnpm build to measure JS/CSS\n')
  }

  for (const e of errors) console.error(`budget: ${e}`)
  if (errors.length > 0) process.exitCode = 1
  else process.stdout.write('budgets: within limits\n')
}

if (import.meta.main) main()
