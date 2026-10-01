'use client'

import { type ReactNode, useSyncExternalStore } from 'react'

// Global Privacy Control (CONTENT §3.13): read in the browser only; nothing is stored or sent.
// The server render (and a browser without the signal) shows nothing.
const gpcOn = () =>
  (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
const subscribe = () => () => {}

export function GpcNotice({ children }: { children: ReactNode }) {
  return useSyncExternalStore(subscribe, gpcOn, () => false) ? children : null
}
