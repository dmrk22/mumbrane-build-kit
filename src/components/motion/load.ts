// GSAP and ScrollTrigger arrive after first paint (after `load`, on idle), so they never count
// against first-load JS (BUILD_PLAN budgets). Every motion component awaits this one promise.
import type * as Motion from './gsap'

export type MotionModule = typeof Motion

const MOTION_OK = '(prefers-reduced-motion: no-preference)'
let pending: Promise<MotionModule> | undefined

function afterFirstPaint(): Promise<void> {
  return new Promise((resolve) => {
    const idle = () => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(() => resolve(), { timeout: 1500 })
      else setTimeout(resolve, 200) // Safari has no requestIdleCallback
    }
    if (document.readyState === 'complete') idle()
    else window.addEventListener('load', idle, { once: true })
  })
}

export function loadMotion(): Promise<MotionModule> {
  pending ??= afterFirstPaint().then(() => import('./gsap'))
  return pending
}

export function motionAllowed(): boolean {
  return window.matchMedia(MOTION_OK).matches
}

/** True when the box is already (partly) on screen: content the reader has seen is never re-hidden. */
export function alreadySeen(el: Element): boolean {
  return el.getBoundingClientRect().top < window.innerHeight
}

export { MOTION_OK }
