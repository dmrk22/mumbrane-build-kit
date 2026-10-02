import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const css = readFileSync('src/app/globals.css', 'utf8')
const token = (name: string) => css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim()

// Content widths measured on anthropic.com's `.u-container` (D-142), keyed by viewport width.
const MEASURED: Record<number, number> = { 375: 311, 768: 673.2, 1024: 909.13, 1440: 1284.53, 1920: 1272 }

test('page frame reproduces the measured content widths', () => {
  const frame = Number.parseFloat(token('container-site') ?? '') * 16
  const m = token('spacing-edge')?.match(/^clamp\(([\d.]+)rem, ([\d.]+)rem \+ ([\d.]+)vw, ([\d.]+)rem\)$/)
  assert.ok(m, 'spacing-edge is a rem/vw clamp')
  const [min, base, slope, max] = m.slice(1).map(Number) as [number, number, number, number]
  for (const [vw, width] of Object.entries(MEASURED)) {
    const edge = Math.min(max * 16, Math.max(min * 16, base * 16 + (slope / 100) * Number(vw)))
    const content = Math.min(Number(vw), frame) - 2 * edge
    assert.ok(Math.abs(content - width) < 0.05, `${vw}px: ${content} vs ${width}`)
  }
})

test('no spacing token shares a container token name (Tailwind resolves max-w-* from spacing first)', () => {
  const names = (ns: string) => [...css.matchAll(new RegExp(`--${ns}-([a-z0-9-]+):`, 'g'))].map((x) => x[1])
  const containers = new Set(names('container'))
  assert.deepEqual(
    names('spacing').filter((n) => containers.has(n)),
    [],
  )
})
