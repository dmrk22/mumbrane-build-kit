// `node scripts/paint.ts [--only <id>] [--force]` — renders the paintings registry to PNG in
// .cache/paintings/ (BUILD_PLAN P5 task 2). Same harness, flags and scaling rule as
// reference/harness/render.mjs; deterministic (fixed seeds, no clock); unchanged items (hash of
// shader sources + preset + spec + size) are skipped, so a second run is a no-op.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { PAINTINGS, type PaintingSpec, POSTER_SIZE, RENDER_WIDTH } from '../src/content/paintings.ts'

type Uniforms = Record<string, number | number[] | string>
type Pass = { fsFile: string; target?: string; scale?: number; uniforms: Uniforms }
type Preset = { width: number; height: number; passes: Pass[] }

export const SOFTWARE_GL = [
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist',
]
const OUT = '.cache/paintings'
const BASE_WIDTH = 1440

export function sizeOf(spec: Pick<PaintingSpec, 'scene' | 'aspect'>): { width: number; height: number } {
  if (spec.scene === 'membrane') return { width: POSTER_SIZE[0], height: POSTER_SIZE[1] }
  const [w, h] = spec.aspect
  return { width: RENDER_WIDTH, height: Math.round((RENDER_WIDTH * h) / w) }
}

/** The preset's passes with this painting's seed, interventions and the width scaling applied. */
export function passesFor(spec: PaintingSpec, preset: Preset, width: number): Pass[] {
  const k = width / BASE_WIDTH
  return preset.passes.map((p) => {
    const u: Uniforms = { ...p.uniforms }
    if ('uSeed' in u) u.uSeed = spec.seed
    if (typeof u.uStroke === 'number') u.uStroke *= k
    if (Array.isArray(u.uSliceBand)) {
      const [y0 = 0, y1 = 0, spacing = 0, shift = 0] = u.uSliceBand
      u.uSliceBand = [y0, y1, spacing * k, shift * k]
    }
    if ('uSlices' in u) u.uSlices = spec.slices ? 1 : 0
    if ('uBlocks' in u) u.uBlocks = spec.blocks ? 1 : 0
    // Palette tuning (DESIGN §8.2 allows palettes and seeds, never maths): scene colours only.
    if (p.target === 'scene' && spec.palette) {
      for (const [name, rgb] of Object.entries(spec.palette)) if (name in u) u[name] = [...rgb]
    }
    // The poster: frozen at the reduced-motion still, line widths matched to its pixel density.
    if (spec.scene === 'membrane') Object.assign(u, { uTime: 2.0, uDpr: k, uPointer: [-1, -1] })
    return { ...p, uniforms: u }
  })
}

function main() {
  const args = process.argv.slice(2)
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined
  const force = args.includes('--force')
  const presets = JSON.parse(readFileSync('reference/shaders/presets.json', 'utf8')).presets as Record<
    string,
    Preset
  >
  const harness = readFileSync('reference/harness/harness.html', 'utf8')
  const glsl = (file: string) => readFileSync(`reference/shaders/${file}`, 'utf8')
  mkdirSync(OUT, { recursive: true })
  const harnessPath = `${OUT}/harness.html`
  writeFileSync(harnessPath, harness)

  const jobs = PAINTINGS.filter((p) => !only || p.id === only).flatMap((spec) => {
    const preset = presets[spec.scene === 'membrane' ? 'membrane-hero' : spec.scene]
    if (!preset) throw new Error(`no preset for ${spec.scene}`)
    const { width, height } = sizeOf(spec)
    const passes = passesFor(spec, preset, width).map((p) => ({ ...p, fs: glsl(p.fsFile) }))
    const hash = createHash('sha256')
      .update(JSON.stringify({ spec, width, height, passes, harness, SOFTWARE_GL }))
      .digest('hex')
      .slice(0, 16)
    const png = `${OUT}/${spec.id}.png`
    const stamp = `${OUT}/${spec.id}.hash`
    const fresh = !force && existsSync(png) && existsSync(stamp) && readFileSync(stamp, 'utf8') === hash
    if (fresh) process.stdout.write(`unchanged ${spec.id}\n`)
    return fresh ? [] : [{ spec, width, height, passes, png, stamp, hash }]
  })
  if (jobs.length === 0) return

  return (async () => {
    const { chromium } = await import('@playwright/test')
    const browser = await chromium.launch({ args: process.env.PAINT_GPU === '1' ? [] : SOFTWARE_GL })
    try {
      for (const job of jobs) {
        const page = await browser.newPage({
          viewport: { width: job.width, height: job.height },
          deviceScaleFactor: 1,
        })
        await page.goto(pathToFileURL(harnessPath).href)
        const t0 = performance.now()
        await page.evaluate(
          (cfg) => (window as unknown as { runPasses: (c: unknown) => Promise<string> }).runPasses(cfg),
          { width: job.width, height: job.height, passes: job.passes },
        )
        const canvas = await page.$('#c')
        if (!canvas) throw new Error('harness canvas missing')
        await canvas.screenshot({ path: job.png })
        writeFileSync(job.stamp, job.hash)
        process.stdout.write(
          `rendered ${job.spec.id} ${job.width}×${job.height} in ${Math.round(performance.now() - t0)} ms\n`,
        )
        await page.close()
      }
    } finally {
      await browser.close()
    }
  })()
}

if (import.meta.main) await main()
