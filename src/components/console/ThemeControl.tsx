'use client'

import { useLayoutEffect, useSyncExternalStore } from 'react'
import { Icon, type IconName } from '@/components/ui/Icon'
import { CONSOLE_UI } from '@/content/console/ui'
import { cx } from '@/lib/cx'

// Console theme (CONSOLE §10.2). The stored choice lives in one localStorage key (SECURITY §7); the
// attribute on <html> is what the CSS reads. Storage can be disabled: then the choice lasts the tab.
export type ConsoleTheme = 'light' | 'dark' | 'system'
const KEY = 'mb-console-theme'
const listeners = new Set<() => void>()
let current: ConsoleTheme | null = null

function stored(): ConsoleTheme {
  try {
    const t = window.localStorage.getItem(KEY)
    return t === 'light' || t === 'dark' ? t : 'system'
  } catch {
    return 'system'
  }
}

function apply(theme: ConsoleTheme) {
  const html = document.documentElement
  if (theme === 'system') delete html.dataset.consoleTheme
  else html.dataset.consoleTheme = theme
}

export function setConsoleTheme(theme: ConsoleTheme) {
  current = theme
  try {
    if (theme === 'system') window.localStorage.removeItem(KEY)
    else window.localStorage.setItem(KEY, theme)
  } catch {
    // storage disabled: the attribute still applies for this tab
  }
  apply(theme)
  for (const l of listeners) l()
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const snapshot = (): ConsoleTheme => {
  current ??= stored()
  return current
}

export function useConsoleTheme(): ConsoleTheme {
  return useSyncExternalStore(subscribe, snapshot, () => 'system')
}

const noop = () => () => {}

/**
 * The pre-paint theme script, rendered only into server HTML. On a client-side navigation into the
 * console React would create an inert copy (and warn); there ThemeControl's layout effect applies
 * the stored theme before paint instead.
 */
export function ThemeBootstrap({ nonce }: { nonce: string | undefined }) {
  const fromServer = useSyncExternalStore(
    noop,
    () => false,
    () => true,
  )
  if (!fromServer) return null
  return <script src="/console-theme.js" nonce={nonce} suppressHydrationWarning />
}

const OPTIONS: readonly { value: ConsoleTheme; icon: IconName }[] = [
  { value: 'light', icon: 'sun' },
  { value: 'dark', icon: 'moon' },
  { value: 'system', icon: 'monitor' },
]

/** Sun / moon / monitor segmented control in the top bar (CONSOLE §2). */
export function ThemeControl() {
  const theme = useConsoleTheme()
  useLayoutEffect(() => apply(snapshot()), [])
  return (
    <fieldset className="flex rounded-sm border border-surface-rule p-0.5">
      <legend className="sr-only">{CONSOLE_UI.theme.label}</legend>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={theme === o.value}
          onClick={() => setConsoleTheme(o.value)}
          className={cx(
            'grid h-7 w-8 place-items-center rounded-xs transition-[color,background-color] duration-(--duration-micro) ease-out pointer-coarse:h-10 pointer-coarse:w-11',
            theme === o.value
              ? 'bg-surface-invert text-surface-on-invert'
              : 'text-surface-muted hover:text-surface-fg',
          )}
        >
          <Icon name={o.icon} label={CONSOLE_UI.theme[o.value]} className="size-4" />
        </button>
      ))}
    </fieldset>
  )
}
