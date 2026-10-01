'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'
import {
  bead,
  FACTS,
  FALL,
  framing,
  height,
  LANDING,
  PRIORITY,
  projector,
  QUESTIONS,
  RELIEF,
  ripple,
  WELLS,
  weights,
} from '@/lib/art/field'
import { createScene, createSheet, drop, LIFT, quiet, START, tick, trailOpacity } from '@/lib/art/scene'
import { cx } from '@/lib/cx'
import { createLoop, deviceTier } from '@/lib/gl/loop'

type Labels = Record<
  | 'facts'
  | 'priority'
  | 'candidate'
  | 'question'
  | 'answer'
  | 'forming'
  | 'settling'
  | 'rest'
  | 'drop'
  | 'restedPriority'
  | 'restedFact',
  string
>

const BUCKETS = 10 // opacity steps for the sheet's segments: a handful of strokes per frame
const TRAIL = 8
const CORNERS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
] as const

const smooth = (a: number, b: number, v: number) => {
  const x = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return x * x * (3 - 2 * x)
}
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * The membrane (D-137): facts land on a sheet and dent it, the priority fact deepest; questions
 * roll across it and come to rest in a well (timeline in `scene.ts`). Three opening questions play
 * once, then the canvas stops drawing until a visitor drops another — a click or tap on the
 * sheet, or the keyboard button, which announces where it came to rest. Canvas 2D, paused
 * off-screen and in hidden tabs; it tilts away as the hero scrolls out. `children` is the server
 * still (FieldStill): shown until the first frame, without JavaScript, under reduced motion and
 * in forced colours.
 */
export function FieldCanvas({
  labels,
  className,
  children,
}: {
  labels: Labels
  className?: string
  children: ReactNode
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const askRef = useRef<() => void>(undefined)
  const [live, setLive] = useState(false)
  const [said, setSaid] = useState('')

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!wrap || !canvas || !ctx) return
    if (
      !window.matchMedia('(prefers-reduced-motion: no-preference)').matches ||
      window.matchMedia('(forced-colors: active)').matches
    )
      return
    setLive(true)

    const nav = navigator as Navigator & { deviceMemory?: number }
    const tier = deviceTier(nav)
    const dpr = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1.25 : 2)
    const style = getComputedStyle(wrap)
    const fg = style.getPropertyValue('--surface-fg').trim() || 'black'
    const accent = style.getPropertyValue('--surface-accent').trim() || fg
    const mono = style.getPropertyValue('--font-mono').trim() || 'monospace'
    const layer = window.matchMedia('(min-width: 1024px)') // HomeHero's layer breakpoint
    const sheet = createSheet(tier === 'low' ? 64 : 96)
    const scene = createScene()
    const out = new Float64Array(3)
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    let w = 1
    let h = 1
    let scroll = 0
    let pending = 0

    const label = (text: string, x: number, y: number, dx: number, dy: number, alpha: number) => {
      if (alpha <= 0.01) return
      const width = ctx.measureText(text).width
      // Flip to the other side rather than run off the stage.
      const sx = dx < 0 ? (x + dx - width < 6 ? -dx : dx) : x + dx + width > w - 6 ? -dx : dx
      const sy = y + dy < 10 || y + dy > h - 10 ? -dy : dy
      ctx.lineWidth = 1
      ctx.strokeStyle = fg
      ctx.fillStyle = fg
      ctx.globalAlpha = alpha * 0.5
      ctx.beginPath()
      ctx.moveTo(x + Math.sign(sx) * 6, y + Math.sign(sy) * 6)
      ctx.lineTo(x + sx * 0.72, y + sy * 0.72)
      ctx.stroke()
      ctx.globalAlpha = alpha * 0.82
      ctx.textAlign = sx < 0 ? 'right' : 'left'
      ctx.fillText(text, x + sx, y + sy)
      ctx.textAlign = 'left'
    }
    const circle = (x: number, y: number, r: number, fill: boolean) => {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      if (fill) ctx.fill()
      else ctx.stroke()
    }

    const draw = () => {
      const { t, splashes, candidate } = scene
      const cam = framing(w, h)
      cam.yaw += 0.04 * Math.sin(t * 0.1) + pointer.x * 0.06
      cam.pitch += pointer.y * 0.04 + scroll * 0.28
      const to = projector(cam)
      const fade = 1 - scroll * 0.7
      const wt = weights(t)
      sheet.update(t, splashes, to)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'butt'

      // The sheet: segments bucketed by opacity (deeper in a well and nearer read darker).
      const { n, cells, h: H, sx: SX, sy: SY, sa: SA } = sheet
      const paths = Array.from({ length: BUCKETS }, () => new Path2D())
      const strength = fade * Math.min(1, t / 0.8)
      const seg = (a: number, b: number) => {
        const depth = -((H[a] ?? 0) + (H[b] ?? 0)) / 2
        const s = (0.1 + 0.5 * Math.min(1, depth / 0.42)) * Math.min(SA[a] ?? 0, SA[b] ?? 0) * strength
        if (s < 0.012) return
        const path = paths[Math.min(BUCKETS - 1, Math.floor((s / 0.6) * BUCKETS))]
        path?.moveTo(SX[a] ?? 0, SY[a] ?? 0)
        path?.lineTo(SX[b] ?? 0, SY[b] ?? 0)
      }
      for (let j = 0; j < n; j += 2) for (let i = 0; i < cells; i++) seg(j * n + i, j * n + i + 1)
      for (let i = 0; i < n; i += 2) for (let j = 0; j < cells; j++) seg(j * n + i, (j + 1) * n + i)
      ctx.lineWidth = 0.75
      ctx.strokeStyle = fg
      paths.forEach((path, b) => {
        ctx.globalAlpha = ((b + 0.5) / BUCKETS) * 0.6
        ctx.stroke(path)
      })

      // The facts fall onto the sheet and sit at the bottom of their dents.
      ctx.font = `11px ${mono}`
      ctx.textBaseline = 'middle'
      const q = scene.q
      const answered = q?.rest ? q.end : -1
      const spots: [number, number][] = []
      FACTS.forEach((f, i) => {
        const since = t - (LANDING[i] ?? 0)
        const well = WELLS[i]
        if (since < 0 || !well) return
        const [x, y] = well
        const z = (height(x, y, wt) + ripple(x, y, t, splashes)) * RELIEF
        to(x, y, since < FALL ? 1.1 - (1.1 - z) * (since / FALL) ** 2 : z, out)
        const spot: [number, number] = [out[0] ?? 0, out[1] ?? 0]
        spots[i] = spot
        ctx.globalAlpha = 0.92 * fade
        ctx.fillStyle = i === answered ? accent : fg
        circle(spot[0], spot[1], bead(f), true)
        if (f.priority) {
          ctx.globalAlpha = 0.32 * fade
          ctx.strokeStyle = fg
          ctx.lineWidth = 1
          circle(spot[0], spot[1], bead(f) + 5.5, false)
        }
      })
      const shown = (i: number) => smooth(0, 0.6, t - (LANDING[i] ?? 0) - FALL - 0.2) * fade
      // Labels spread over the figure: the question and candidate far right, the priority below,
      // the light facts' label on the near-left well.
      const facts = spots[3]
      if (facts && answered !== 3) label(labels.facts, facts[0], facts[1], 60, 34, shown(3))
      const heavy = spots[PRIORITY]
      if (heavy && answered !== PRIORITY) label(labels.priority, heavy[0], heavy[1], 70, 52, shown(PRIORITY))
      const passed = spots[candidate.i]
      if (passed && t - candidate.t < 1.8 && answered !== candidate.i)
        label(labels.candidate, passed[0], passed[1], 56, -30, (1 - (t - candidate.t) / 1.8) * fade)

      if (q) {
        const fa = trailOpacity(scene) * fade
        const trail = Array.from({ length: TRAIL }, () => new Path2D())
        const points = q.trail.length / 3
        let px = 0
        let py = 0
        for (let k = 0; k < points; k++) {
          to(q.trail[3 * k] ?? 0, q.trail[3 * k + 1] ?? 0, q.trail[3 * k + 2] ?? 0, out)
          if (k > 0) {
            const path = trail[Math.min(TRAIL - 1, Math.floor((k / points) ** 0.8 * TRAIL))]
            path?.moveTo(px, py)
            path?.lineTo(out[0] ?? 0, out[1] ?? 0)
          }
          px = out[0] ?? 0
          py = out[1] ?? 0
        }
        to(q.b.x, q.b.y, height(q.b.x, q.b.y, wt) * RELIEF + LIFT, out)
        const hx = out[0] ?? 0
        const hy = out[1] ?? 0
        trail[TRAIL - 1]?.moveTo(px, py)
        trail[TRAIL - 1]?.lineTo(hx, hy)
        ctx.strokeStyle = accent
        ctx.lineWidth = 1.8
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        trail.forEach((path, b) => {
          ctx.globalAlpha = fa * (0.08 + (0.92 * (b + 1)) / TRAIL)
          ctx.stroke(path)
        })
        ctx.lineCap = 'butt'
        ctx.fillStyle = accent
        ctx.globalAlpha = fa
        ctx.shadowColor = accent
        ctx.shadowBlur = 10
        circle(hx, hy, 5, true)
        ctx.shadowBlur = 0
        ctx.lineWidth = 1
        if (!q.rest) {
          ctx.globalAlpha = 0.4 * fa
          circle(hx, hy, 10, false)
        } else {
          const since = t - q.restAt
          if (since < 1.4) {
            ctx.globalAlpha = (1 - since / 1.4) * 0.7 * fade
            circle(hx, hy, 7 + since * 30, false)
          }
          // The check: brackets close in on the answer.
          const r = 14 * Math.max(1, 1.8 - since * 2.5)
          ctx.globalAlpha = fa * 0.9
          ctx.beginPath()
          for (const [sx, sy] of CORNERS) {
            ctx.moveTo(hx + sx * r, hy + sy * r - sy * 5)
            ctx.lineTo(hx + sx * r, hy + sy * r)
            ctx.lineTo(hx + sx * r - sx * 5, hy + sy * r)
          }
          ctx.stroke()
          label(labels.answer, hx, hy, 70, 52, fa)
        }
        to(q.trail[0] ?? 0, q.trail[1] ?? 0, q.trail[2] ?? 0, out)
        ctx.strokeStyle = accent
        ctx.globalAlpha = fa * 0.7
        circle(out[0] ?? 0, out[1] ?? 0, 5, false)
        label(labels.question, out[0] ?? 0, out[1] ?? 0, 48, -26, Math.max(0, 1 - q.age / 3) * fa)
      }

      const status = q
        ? `${labels.question} ${pad(q.n)} — ${q.rest ? labels.rest : labels.settling}`
        : t < START
          ? labels.forming
          : ''
      ctx.globalAlpha = 0.55 * fade
      ctx.fillStyle = fg
      // As the desktop layer, right-aligned above the caption, clear of the fade toward the text;
      // in flow, bottom-left, in line with the caption below the figure.
      if (layer.matches) {
        ctx.textAlign = 'right'
        ctx.fillText(status, w - 40, h - 94)
        ctx.textAlign = 'left'
      } else ctx.fillText(status, 20, h - 12)
      ctx.globalAlpha = 1
      if (wrap.dataset.ready !== 'true') wrap.dataset.ready = 'true'
    }

    const loop = createLoop(tier === 'low' ? 30 : 60, (time, dt) => {
      pointer.x += (pointer.tx - pointer.x) * 0.05
      pointer.y += (pointer.ty - pointer.y) * 0.05
      const rested = tick(scene, time, dt)
      if (rested) {
        const text = rested.end === PRIORITY ? labels.restedPriority : labels.restedFact
        setSaid(text.replace('{n}', pad(rested.n)))
      }
      draw()
      // The opening is over and everything has settled: stop drawing until the next drop.
      if (quiet(scene)) {
        scene.phase = 'idle'
        loop.setAwake(false)
      }
      wrap.dataset.state = scene.phase
    })
    const release = (start: readonly [number, number, number, number]) => {
      drop(scene, start, true)
      wrap.dataset.state = scene.phase
      loop.setAwake(true)
    }

    // Idle, the loop is asleep: a scroll or resize still needs one fresh frame.
    const redraw = () => {
      if (scene.phase !== 'idle' || pending) return
      pending = requestAnimationFrame(() => {
        pending = 0
        draw()
      })
    }
    const resize = () => {
      w = Math.max(1, canvas.clientWidth)
      h = Math.max(1, canvas.clientHeight)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      redraw()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    const io = new IntersectionObserver(([e]) => loop.setOnScreen(!!e?.isIntersecting))
    io.observe(canvas)
    const onVisibility = () => loop.setPageVisible(!document.hidden)
    const onScroll = () => {
      const r = wrap.getBoundingClientRect()
      scroll = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)))
      redraw()
    }
    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    // A click or tap drops a question onto the nearest visible point of the sheet.
    const onClick = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      const id = sheet.pick(e.clientX - r.left, e.clientY - r.top)
      if (id < 0) return
      const x = Math.min(0.92, Math.max(-0.92, sheet.gx[id] ?? 0))
      const y = Math.min(0.92, Math.max(-0.92, sheet.gy[id] ?? 0))
      scene.splashes.push({ x, y, t: scene.t })
      release([x, y, 0, 0])
    }
    // The keyboard drops the opening questions again, in turn: each has a known, clear path.
    askRef.current = () => {
      const start = QUESTIONS[scene.count % QUESTIONS.length]
      if (start) release(start)
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('scroll', onScroll, { passive: true })
    if (window.matchMedia('(pointer: fine)').matches)
      window.addEventListener('pointermove', onMove, { passive: true })
    canvas.addEventListener('click', onClick)
    onScroll()
    wrap.dataset.state = scene.phase
    return () => {
      loop.stop()
      ro.disconnect()
      io.disconnect()
      cancelAnimationFrame(pending)
      askRef.current = undefined
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('click', onClick)
    }
  }, [labels])

  return (
    <div ref={wrapRef} className={cx('field relative', className)}>
      {children}
      <canvas ref={canvasRef} className="field-canvas absolute inset-0 size-full" />
      {/* Unseen until focused (pointers drop questions on the sheet itself). Not sr-only: its
          not-sr-only resets padding and border, and the chip needs both. */}
      <button
        type="button"
        hidden={!live}
        onClick={() => askRef.current?.()}
        className="pointer-events-none absolute top-3 right-5 rounded-md border border-surface-rule bg-surface px-3 py-2 font-mono text-label text-surface-fg opacity-0 focus-visible:pointer-events-auto focus-visible:opacity-100 sm:right-6 lg:right-10"
      >
        {labels.drop}
      </button>
      <p aria-live="polite" className="sr-only">
        {said}
      </p>
    </div>
  )
}
