'use client'

import { useEffect, useRef } from 'react'
import { cx } from '@/lib/cx'
import { MEMBRANE_COLORS } from '@/lib/gl/colors'
import { createGL, drawFullscreen, program, setUniforms } from '@/lib/gl/context'
import { cappedDpr, createLoop, deviceTier } from '@/lib/gl/loop'
import { MEMBRANE_FRAG } from '@/shaders/membrane'

const STILL_TIME = 2.0 // the frame of brand/board/hero-still.png (reduced motion shows only this)
const POINTER_LERP = 0.08

/**
 * The hero's WebGL membrane (DESIGN §7.2) over its CSS field. The field shows until the first
 * frame is ready, then the canvas fades in; with no WebGL2, Save-Data or a lost context the CSS
 * field simply stays (the poster image joins in P5). Paused off-screen and in hidden tabs; one
 * static frame under reduced motion. Decorative.
 */
export function MembraneCanvas({ seed = 1.37, className }: { seed?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
    if (nav.connection?.saveData) return
    const gl = createGL(canvas)
    if (!gl) return
    let prog: WebGLProgram
    try {
      prog = program(gl, MEMBRANE_FRAG)
    } catch (err) {
      console.error('MembraneCanvas: shader failed', err)
      return
    }

    const tier = deviceTier(nav)
    const dpr = cappedDpr(window.devicePixelRatio, tier)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const pointer = { x: -1, y: -1, tx: -1, ty: -1 }
    let lastT = STILL_TIME

    const render = (t: number) => {
      if (pointer.tx >= 0) {
        pointer.x = pointer.x < 0 ? pointer.tx : pointer.x + (pointer.tx - pointer.x) * POINTER_LERP
        pointer.y = pointer.y < 0 ? pointer.ty : pointer.y + (pointer.ty - pointer.y) * POINTER_LERP
      }
      setUniforms(gl, prog, {
        uRes: [canvas.width, canvas.height],
        uTime: t,
        uSeed: seed,
        uPointer: [pointer.x, pointer.y],
        uDpr: dpr,
        ...MEMBRANE_COLORS,
      })
      drawFullscreen(gl)
      lastT = t
      if (canvas.dataset.ready !== 'true') canvas.dataset.ready = 'true'
    }

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width === w && canvas.height === h) return
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      if (reduced || !loop.running) render(lastT) // keep the still frame sharp after a resize
    }

    const loop = createLoop(tier === 'low' ? 30 : 60, (t) => render(STILL_TIME + t))
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const cleanups: (() => void)[] = [() => ro.disconnect(), () => loop.stop()]
    if (reduced) {
      render(STILL_TIME)
    } else {
      const io = new IntersectionObserver(([e]) => loop.setOnScreen(!!e?.isIntersecting))
      io.observe(canvas)
      const onVisibility = () => loop.setPageVisible(!document.hidden)
      document.addEventListener('visibilitychange', onVisibility)
      cleanups.push(
        () => io.disconnect(),
        () => document.removeEventListener('visibilitychange', onVisibility),
      )
      if (finePointer) {
        const onMove = (e: PointerEvent) => {
          const r = canvas.getBoundingClientRect()
          pointer.tx = (e.clientX - r.left) / r.width
          pointer.ty = 1 - (e.clientY - r.top) / r.height
        }
        window.addEventListener('pointermove', onMove, { passive: true })
        cleanups.push(() => window.removeEventListener('pointermove', onMove))
      }
    }

    const onLost = (e: Event) => {
      e.preventDefault()
      loop.stop()
      delete canvas.dataset.ready // back to the CSS field
    }
    canvas.addEventListener('webglcontextlost', onLost)
    cleanups.push(() => canvas.removeEventListener('webglcontextlost', onLost))
    return () => {
      for (const c of cleanups) c()
    }
  }, [seed])

  return (
    <div aria-hidden="true" className={cx('membrane-field absolute inset-0 overflow-hidden', className)}>
      <canvas ref={canvasRef} className="membrane-canvas absolute inset-0 size-full" />
    </div>
  )
}
