'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'
import { V_RANGE } from '@/lib/art/minimal'
import { cx } from '@/lib/cx'
import { MEMBRANE_COLORS } from '@/lib/gl/colors'
import { program, setUniforms } from '@/lib/gl/context'
import { createLoop, deviceTier } from '@/lib/gl/loop'
import { STRINGS_FRAG, STRINGS_VERT } from '@/shaders/strings'

const STRINGS = 168 // u-curves: the taut strings
const STEPS = 44 // segments per string
const RINGS = 9 // v-curves: the brass rings and the latitude threads between them
const RING_STEPS = 180
const REST_THETA = 0.36 * Math.PI // half-way between helicoid and catenoid
const MUON_EVERY = 9 // seconds between muon crossings
const MUON_LIFE = 1.3

/** Line-segment endpoints as (u, v) pairs: every string, then every ring. */
function geometry(): Float32Array {
  const out: number[] = []
  for (let i = 0; i < STRINGS; i++) {
    const u = -Math.PI + ((i + 0.5) / STRINGS) * 2 * Math.PI
    for (let j = 0; j < STEPS; j++) {
      const v0 = -V_RANGE + (j / STEPS) * 2 * V_RANGE
      const v1 = -V_RANGE + ((j + 1) / STEPS) * 2 * V_RANGE
      out.push(u, v0, u, v1)
    }
  }
  for (let r = 0; r < RINGS; r++) {
    const v = -V_RANGE + (r / (RINGS - 1)) * 2 * V_RANGE
    for (let j = 0; j < RING_STEPS; j++) {
      const u0 = -Math.PI + (j / RING_STEPS) * 2 * Math.PI
      const u1 = -Math.PI + ((j + 1) / RING_STEPS) * 2 * Math.PI
      out.push(u0, v, u1, v)
    }
  }
  return new Float32Array(out)
}

/**
 * The hero's string-model membrane (src/shaders/strings.ts): a minimal surface bending from
 * helicoid towards catenoid as the hero scrolls away, turning slowly, leaning to the pointer, and
 * crossed now and then by a muon. `readoutId` names an element that shows the live θ. Without
 * WebGL2 (or with Save-Data, or a lost context) `poster` shows instead; under reduced motion one
 * still frame is drawn. Paused off-screen and in hidden tabs. Decorative.
 */
export function MembraneCanvas({
  poster,
  readoutId,
  className,
}: {
  poster?: ReactNode
  readoutId?: string
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
    const gl = nav.connection?.saveData
      ? null
      : canvas.getContext('webgl2', {
          alpha: true,
          premultipliedAlpha: true,
          antialias: true,
          depth: false,
          stencil: false,
          powerPreference: 'high-performance',
        })
    if (!gl) {
      setFallback(true)
      return
    }
    let prog: WebGLProgram
    try {
      prog = program(gl, STRINGS_FRAG, STRINGS_VERT)
    } catch (err) {
      console.error('MembraneCanvas: shader failed', err)
      setFallback(true)
      return
    }
    const loc = gl.getAttribLocation(prog, 'aParam')
    const mesh = geometry()
    const meshBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, meshBuf)
    gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW)
    const muonBuf = gl.createBuffer()
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE) // premultiplied, additive: crowded strings glow

    const tier = deviceTier(nav)
    // Hairlines need real device pixels: DPR up to 2 (1 on low-tier devices).
    const dpr = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1 : 2)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const readout = readoutId ? document.getElementById(readoutId) : null
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    let scroll = 0
    let shownTheta = ''
    let lastT = 0

    const layout = () => {
      const wide = canvas.clientWidth / Math.max(1, canvas.clientHeight) > 1.15
      return wide
        ? { center: [0.5, -0.04] as const, scale: 0.235, gain: 1 }
        : { center: [0.12, 0.2] as const, scale: 0.17, gain: 0.85 }
    }

    const draw = (t: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.05
      pointer.y += (pointer.ty - pointer.y) * 0.05
      const breathe = reduced ? 0 : 0.05 * Math.PI * Math.sin(t * 0.21)
      const theta = Math.min(Math.PI / 2, REST_THETA + breathe + scroll * (Math.PI / 2 - REST_THETA) * 1.15)
      const yaw = 0.55 + (reduced ? 0 : t * 0.07) + scroll * 1.1 + pointer.x * 0.35
      const pitch = 0.36 + pointer.y * 0.18 - scroll * 0.12
      const { center, scale, gain } = layout()
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      setUniforms(gl, prog, {
        uTheta: theta,
        uYaw: yaw,
        uPitch: pitch,
        uTime: t,
        uRes: [canvas.width, canvas.height],
        uCenter: center,
        uScale: scale,
        uMode: 0,
        uGain: gain * (1 - scroll * 0.35),
        ...MEMBRANE_COLORS,
      })
      gl.bindBuffer(gl.ARRAY_BUFFER, meshBuf)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
      gl.drawArrays(gl.LINES, 0, mesh.length / 2)

      // A muon crosses every MUON_EVERY seconds: a straight, fading track through the film.
      const phase = (t % MUON_EVERY) / MUON_LIFE
      if (!reduced && phase < 1) {
        const n = Math.floor(t / MUON_EVERY)
        const tilt = 0.55 + 0.25 * Math.sin(n * 2.3)
        const [cx0, cy0] = center
        const head = -1.2 + phase * 2.6
        const pts = new Float32Array([
          cx0 + head - 0.9,
          cy0 + (head - 0.9) * -tilt,
          cx0 + head,
          cy0 + head * -tilt,
        ])
        gl.bindBuffer(gl.ARRAY_BUFFER, muonBuf)
        gl.bufferData(gl.ARRAY_BUFFER, pts, gl.DYNAMIC_DRAW)
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
        setUniforms(gl, prog, { uMode: 1, uMuon: Math.sin(Math.min(1, phase) * Math.PI) })
        gl.drawArrays(gl.LINES, 0, 2)
      }

      const label = (theta / Math.PI).toFixed(2)
      if (readout && label !== shownTheta) {
        shownTheta = label
        readout.textContent = `${label}π`
      }
      lastT = t
      if (canvas.dataset.ready !== 'true') canvas.dataset.ready = 'true'
    }

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width === w && canvas.height === h) return
      canvas.width = w
      canvas.height = h
      if (reduced || !loop.running) draw(lastT)
    }

    const loop = createLoop(tier === 'low' ? 30 : 60, (t) => draw(t))
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const cleanups: (() => void)[] = [() => ro.disconnect(), () => loop.stop()]
    if (reduced) {
      draw(0)
    } else {
      const io = new IntersectionObserver(([e]) => loop.setOnScreen(!!e?.isIntersecting))
      io.observe(canvas)
      const onVisibility = () => loop.setPageVisible(!document.hidden)
      document.addEventListener('visibilitychange', onVisibility)
      // Scroll progress through the canvas's own box: 0 at rest, 1 once it has scrolled away.
      const onScroll = () => {
        const r = canvas.getBoundingClientRect()
        scroll = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)))
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
      cleanups.push(
        () => io.disconnect(),
        () => document.removeEventListener('visibilitychange', onVisibility),
        () => window.removeEventListener('scroll', onScroll),
      )
      if (finePointer) {
        const onMove = (e: PointerEvent) => {
          pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
          pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
        }
        window.addEventListener('pointermove', onMove, { passive: true })
        cleanups.push(() => window.removeEventListener('pointermove', onMove))
      }
    }

    const onLost = (e: Event) => {
      e.preventDefault()
      loop.stop()
      delete canvas.dataset.ready
      setFallback(true)
    }
    canvas.addEventListener('webglcontextlost', onLost)
    cleanups.push(() => canvas.removeEventListener('webglcontextlost', onLost))
    return () => {
      for (const c of cleanups) c()
    }
  }, [readoutId])

  return (
    <div aria-hidden="true" className={cx('membrane-field absolute inset-0 overflow-hidden', className)}>
      {fallback ? poster : <canvas ref={canvasRef} className="membrane-canvas absolute inset-0 size-full" />}
    </div>
  )
}
