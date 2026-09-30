#!/usr/bin/env node
// Reference renderer for the shaders in reference/shaders (tested during planning).
// scripts/paint.ts in the app is modelled on this file; keep their behaviour identical.
//
// Usage (after /setup installed @playwright/test and its Chromium):
//   node reference/harness/render.mjs <presetId> <out.png> [--width 2400] [--height 1500]
//                                     [--seed 3.7] [--time 2.0]
// Presets live in reference/shaders/presets.json. Set PAINT_GPU=1 to use the machine's GPU
// instead of SwiftShader (faster, but pixels can differ slightly between machines).
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const shadersDir = resolve(flag('--shaders') ?? join(here, '..', 'shaders'))
const [id, out] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'))
if (!id || !out) {
  console.error('usage: render.mjs <presetId> <out.png> [--width W] [--height H] [--seed S] [--time T]')
  process.exit(2)
}

const { presets } = JSON.parse(readFileSync(join(shadersDir, 'presets.json'), 'utf8'))
const preset = presets[id]
if (!preset) {
  console.error(`unknown preset "${id}" (have: ${Object.keys(presets).join(', ')})`)
  process.exit(2)
}

const width = Number(flag('--width') ?? preset.width)
const height = Number(flag('--height') ?? Math.round((preset.height * width) / preset.width))
const k = width / 1440 // stroke and slice sizes are specified for a 1440 px wide output

function scaleUniforms(uniforms) {
  const u = { ...uniforms }
  if (typeof u.uStroke === 'number') u.uStroke *= k
  if (Array.isArray(u.uSliceBand)) u.uSliceBand = [u.uSliceBand[0], u.uSliceBand[1], u.uSliceBand[2] * k, u.uSliceBand[3] * k]
  if (flag('--seed') && 'uSeed' in u) u.uSeed = Number(flag('--seed'))
  if (flag('--time') && 'uTime' in u) u.uTime = Number(flag('--time'))
  return u
}

const cfg = {
  width,
  height,
  passes: preset.passes.map((p) => ({
    ...p,
    fs: readFileSync(join(shadersDir, p.fsFile), 'utf8'),
    uniforms: scaleUniforms(p.uniforms),
  })),
}

let chromium
try {
  ;({ chromium } = await import('@playwright/test'))
} catch {
  ;({ chromium } = await import('playwright'))
}

const softwareGL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
const launchOptions = { args: process.env.PAINT_GPU === '1' ? [] : softwareGL }
if (process.env.PW_CHROMIUM_PATH) launchOptions.executablePath = process.env.PW_CHROMIUM_PATH

const browser = await chromium.launch(launchOptions)
try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  page.on('console', (m) => console.log('console:', m.text()))
  await page.goto(pathToFileURL(join(here, 'harness.html')).href)
  const t0 = Date.now()
  await page.evaluate((c) => window.runPasses(c), cfg)
  console.log(`rendered ${id} ${width}x${height} in ${Date.now() - t0} ms`)
  await (await page.$('#c')).screenshot({ path: out })
  console.log(out)
} finally {
  await browser.close()
}
