'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { useReducedMotion } from '@/components/motion/useReducedMotion'

/** Dev-only: live reduced-motion state, a CSP-violation counter, and Replay (remounts the demos). */
export function LabStatus({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  const [violations, setViolations] = useState(0)
  const [run, setRun] = useState(0)
  useEffect(() => {
    const on = () => setViolations((n) => n + 1)
    document.addEventListener('securitypolicyviolation', on)
    return () => document.removeEventListener('securitypolicyviolation', on)
  }, [])
  return (
    <>
      <div
        data-surface="ink"
        className="sticky top-0 z-50 flex flex-wrap items-center gap-6 px-5 py-3 font-serif-italic text-small"
      >
        <span>
          Reduced motion: <strong data-testid="lab-reduced">{reduced ? 'on' : 'off'}</strong>
        </span>
        <span>
          CSP violations: <strong data-testid="lab-csp">{violations}</strong>
        </span>
        <button type="button" onClick={() => setRun((n) => n + 1)} className="underline underline-offset-4">
          Replay
        </button>
        <span className="text-surface-subtle">Toggle reduced motion in DevTools → Rendering</span>
      </div>
      <div key={run}>{children}</div>
    </>
  )
}
