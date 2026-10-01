'use client'

import { useEffect, useRef } from 'react'
import {
  type Camera,
  contours,
  mesh,
  type Pt3,
  points,
  project,
  searchPath,
  wellPoints,
} from '@/lib/art/field'
import { cx } from '@/lib/cx'
import { createLoop, deviceTier } from '@/lib/gl/loop'

type Labels = { field: string; candidate: string; answer: string }

const CYCLE = 10 // seconds per search: draw, settle, rest
const DRAW = 3.6
const FADE_AT = 8.4
const FADE = 1

// The still (and the camera the canvas starts from), in a 640 × 520 frame like the original art.
const POSTER: Camera = { yaw: -Math.PI / 4, pitch: 0.5, scale: 215, cx: 322, cy: 236 }

const FIELD_LABEL: Pt3 = [-1, 0.25, 0.25]
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/**
 * The field (after the original mumbrane.com hero): a wireframe energy landscape whose search path
 * passes the shallow candidate and settles in the deep answer, again and again. Canvas 2D, crisp at
 * any DPR, paused off-screen and in hidden tabs; the field leans to the pointer and flattens as the
 * hero scrolls away. The server renders the finished still as SVG, which shows until the first
 * frame, without JavaScript, and under reduced motion. Decorative.
 */
export function FieldCanvas({ labels, className }: { labels: Labels; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!wrap || !canvas || !ctx) return
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return

    const nav = navigator as Navigator & { deviceMemory?: number }
    const tier = deviceTier(nav)
    const dpr = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1.25 : 2)
    const style = getComputedStyle(wrap)
    const fg = style.getPropertyValue('--surface-fg').trim() || 'white'
    const accent = style.getPropertyValue('--surface-accent').trim() || fg
    const mono = style.getPropertyValue('--font-mono').trim() || 'monospace'
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    let scroll = 0
    let w = 1
    let h = 1

    const camera = (): Camera => {
      const s = Math.min(w / 640, h / 520)
      return {
        yaw: POSTER.yaw + pointer.x * 0.09,
        pitch: POSTER.pitch + pointer.y * 0.05 + scroll * 0.28,
        scale: POSTER.scale * s,
        cx: w / 2 + (POSTER.cx - 320) * s,
        cy: h / 2 + (POSTER.cy - 260) * s,
      }
    }

    const line = (pts: readonly Pt3[], cam: Camera) => {
      ctx.beginPath()
      pts.forEach((p, i) => {
        const [x, y] = project(p, cam)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
    }

    const label = (text: string, at: Pt3, dx: number, dy: number, cam: Camera, alpha: number) => {
      const [x, y] = project(at, cam)
      ctx.globalAlpha = alpha * 0.5
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + dx * 0.72, y + dy * 0.72)
      ctx.stroke()
      ctx.globalAlpha = alpha * 0.78
      ctx.fillText(text, x + dx, y + dy)
    }

    const draw = (t: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.04
      pointer.y += (pointer.ty - pointer.y) * 0.04
      const amp = 1 + 0.035 * Math.sin(t * 0.5)
      const cam = camera()
      const fade = 1 - scroll * 0.7
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.lineWidth = 1
      ctx.strokeStyle = fg
      ctx.fillStyle = fg

      ctx.setLineDash([1.5, 4])
      ctx.globalAlpha = 0.28 * fade
      for (const ring of contours()) line(ring, cam)
      for (const id of ['candidate', 'answer'] as const) {
        const { surface, floor } = wellPoints(id, amp)
        line([surface, floor], cam)
      }
      ctx.setLineDash([])

      const grid = mesh(22, 44, amp)
      grid.forEach((l, i) => {
        const edge = i < 2 || i >= grid.length - 2
        ctx.globalAlpha = (edge ? 0.5 : 0.17) * fade
        line(l, cam)
      })

      // The search: draw, settle, rest, fade; the cycle repeats from the start.
      const local = (t + CYCLE - 0.6) % CYCLE
      const p = local < DRAW ? ease(local / DRAW) : 1
      const pathAlpha = local > FADE_AT ? Math.max(0, 1 - (local - FADE_AT) / FADE) : 1
      const path = searchPath(160, amp)
      const n = Math.max(1, Math.floor(p * (path.length - 1)))
      const head = path[n] ?? path[0]
      const start = path[0]
      ctx.font = `11px ${mono}`
      ctx.textBaseline = 'middle'
      ctx.strokeStyle = fg
      label(labels.field, FIELD_LABEL, -6, -18, cam, fade)

      ctx.strokeStyle = accent
      ctx.fillStyle = accent
      ctx.globalAlpha = pathAlpha * fade
      ctx.lineWidth = 1.6
      ctx.shadowColor = accent
      ctx.shadowBlur = 10
      line(path.slice(0, n + 1), cam)
      ctx.shadowBlur = 0
      ctx.lineWidth = 1.2
      if (start) {
        const [sx, sy] = project(start, cam)
        ctx.beginPath()
        ctx.arc(sx, sy, 4.5, 0, Math.PI * 2)
        ctx.stroke()
      }
      if (head) {
        const [hx, hy] = project(head, cam)
        ctx.beginPath()
        ctx.arc(hx, hy, p < 1 ? 3 : 5, 0, Math.PI * 2)
        ctx.fill()
        if (p >= 1) {
          const since = local - DRAW
          const ring = Math.min(1, since / 1.4)
          ctx.globalAlpha = (1 - ring) * 0.8 * pathAlpha * fade
          ctx.beginPath()
          ctx.arc(hx, hy, 6 + ring * 22, 0, Math.PI * 2)
          ctx.stroke()
          ctx.globalAlpha = 0.5 * pathAlpha * fade
          ctx.beginPath()
          ctx.arc(hx, hy, 10, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      ctx.strokeStyle = fg
      ctx.fillStyle = fg
      ctx.lineWidth = 1
      const cand = wellPoints('candidate', amp).surface
      const shown = p > 0.42 ? Math.min(1, (p - 0.42) / 0.1) : 0
      ctx.globalAlpha = shown * fade
      const [cxp, cyp] = project(cand, cam)
      ctx.beginPath()
      ctx.arc(cxp, cyp, 3.5, 0, Math.PI * 2)
      ctx.stroke()
      label(labels.candidate, cand, -46, -26, cam, shown * fade)
      const ans = wellPoints('answer', amp).surface
      label(labels.answer, ans, 40, 46, cam, (p >= 1 ? pathAlpha : 0.35) * fade)
      ctx.globalAlpha = 1
      if (wrap.dataset.ready !== 'true') wrap.dataset.ready = 'true'
    }

    const resize = () => {
      w = Math.max(1, canvas.clientWidth)
      h = Math.max(1, canvas.clientHeight)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    const loop = createLoop(tier === 'low' ? 30 : 60, draw)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    const io = new IntersectionObserver(([e]) => loop.setOnScreen(!!e?.isIntersecting))
    io.observe(canvas)
    const onVisibility = () => loop.setPageVisible(!document.hidden)
    const onScroll = () => {
      const r = wrap.getBoundingClientRect()
      scroll = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)))
    }
    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('scroll', onScroll, { passive: true })
    if (window.matchMedia('(pointer: fine)').matches)
      window.addEventListener('pointermove', onMove, { passive: true })
    onScroll()
    return () => {
      loop.stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
    }
  }, [labels])

  const cand = project(wellPoints('candidate').surface, POSTER)
  const ans = project(wellPoints('answer').surface, POSTER)
  const path = searchPath(160)
  const start = project(path[0] ?? [0, 0, 0], POSTER)
  const fieldAt = project(FIELD_LABEL, POSTER)
  const grid = mesh()
  return (
    <div ref={wrapRef} aria-hidden="true" className={cx('field relative', className)}>
      <svg
        viewBox="0 0 640 520"
        className="field-poster absolute inset-0 size-full"
        fill="none"
        aria-hidden="true"
      >
        <g className="field-faint" strokeDasharray="1.5 4">
          {contours().map((ring) => (
            <polyline key={ring[0]?.join()} points={points(ring, POSTER)} />
          ))}
        </g>
        <g className="field-mesh">
          {grid.map((l, i) => {
            const pts = points(l, POSTER)
            return (
              <polyline
                key={pts}
                points={pts}
                className={i < 2 || i >= grid.length - 2 ? 'field-edge' : undefined}
              />
            )
          })}
        </g>
        <polyline points={points(path, POSTER)} className="field-path" />
        <circle cx={start[0]} cy={start[1]} r={4.5} className="field-path" />
        <circle cx={cand[0]} cy={cand[1]} r={3.5} className="field-faint" />
        <circle cx={ans[0]} cy={ans[1]} r={5} className="field-dot" />
        <text x={fieldAt[0] - 6} y={fieldAt[1] - 18} className="field-label">
          {labels.field}
        </text>
        <text x={cand[0] - 46} y={cand[1] - 26} className="field-label">
          {labels.candidate}
        </text>
        <text x={ans[0] + 40} y={ans[1] + 46} className="field-label">
          {labels.answer}
        </text>
      </svg>
      <canvas ref={canvasRef} className="field-canvas absolute inset-0 size-full" />
    </div>
  )
}
