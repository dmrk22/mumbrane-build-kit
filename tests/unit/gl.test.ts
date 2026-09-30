import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { SHADERS } from '../../scripts/shaders.ts'
import { HEX, MEMBRANE_COLORS, rgb } from '../../src/lib/gl/colors.ts'
import { cappedDpr, createLoop, deviceTier } from '../../src/lib/gl/loop.ts'

test('src/shaders are exact copies of the tested reference shaders', async () => {
  for (const name of SHADERS) {
    const mod = (await import(`../../src/shaders/${name}.ts`)) as Record<string, string>
    const reference = readFileSync(`reference/shaders/${name}.frag`, 'utf8')
    assert.equal(mod[`${name.toUpperCase()}_FRAG`], reference, name)
  }
})

test('GL colours mirror palette.json', () => {
  const palette = JSON.parse(readFileSync('brand/palette/palette.json', 'utf8')) as {
    neutrals: Record<string, { hex: string }>
    pigments: Record<string, { base: { hex: string } }>
  }
  assert.equal(HEX.paper, palette.neutrals.paper?.hex)
  assert.equal(HEX.ultramarineDeep, palette.neutrals['ultramarine-deep']?.hex)
  for (const p of ['ultramarine', 'cherenkov', 'vermilion', 'cadmium'] as const)
    assert.equal(HEX[p], palette.pigments[p]?.base.hex, p)
  assert.deepEqual(rgb('#ff8000'), [1, 128 / 255, 0])
  assert.deepEqual(MEMBRANE_COLORS.uBgA, rgb(HEX.ultramarine))
})

function fakeFrames() {
  let queue: ((now: number) => void)[] = []
  let now = 0
  return {
    deps: {
      raf: (cb: (now: number) => void) => queue.push(cb),
      caf: () => {
        queue = []
      },
    },
    advance(ms: number) {
      now += ms
      const run = queue
      queue = []
      for (const cb of run) cb(now)
    },
    get pending() {
      return queue.length
    },
  }
}

test('loop caps fps, clamps long frames and pauses without a time jump', () => {
  const f = fakeFrames()
  const frames: [number, number][] = []
  const loop = createLoop(30, (t, dt) => frames.push([t, dt]), f.deps)
  assert.equal(loop.running, false, 'nothing runs until the canvas is on screen')
  loop.setOnScreen(true)
  f.advance(0) // first frame only stamps the clock
  f.advance(16.7) // under 33.3 ms at 30 fps: skipped
  assert.equal(frames.length, 0)
  f.advance(16.7)
  assert.equal(frames.length, 1)
  f.advance(1000) // a stall (tab switch, debugger): clamped to 50 ms
  assert.equal(frames.at(-1)?.[1], 0.05)
  const before = frames.at(-1)?.[0] ?? 0
  loop.setPageVisible(false)
  assert.equal(loop.running, false)
  assert.equal(f.pending, 0)
  loop.setPageVisible(true)
  f.advance(10_000) // resume: re-stamps, so the hidden time never enters the scene clock
  f.advance(40)
  assert.ok((frames.at(-1)?.[0] ?? 0) - before <= 0.05 + 1e-9)
  loop.stop()
  loop.setOnScreen(true)
  assert.equal(loop.running, false, 'a stopped loop stays stopped')
})

test('device tier and DPR cap', () => {
  assert.equal(deviceTier({ hardwareConcurrency: 4 }), 'low')
  assert.equal(deviceTier({ hardwareConcurrency: 8, deviceMemory: 4 }), 'low')
  assert.equal(deviceTier({}), 'high')
  assert.equal(cappedDpr(3, 'high'), 1.5)
  assert.equal(cappedDpr(3, 'low'), 1)
  assert.equal(cappedDpr(0, 'high'), 1)
})

test('scripts/shaders refuses GLSL that a template literal would change', async () => {
  const { toModule } = await import('../../scripts/shaders.ts')
  assert.throws(() => toModule('x', 'a ` b'))
  assert.throws(() => toModule('x', `a $${'{b}'}`)) // the two characters "${", built without a template hole
})
