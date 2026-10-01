'use client'

import { type ReactNode, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SmartLink } from '@/components/ui/SmartLink'
import { CONSOLE_UI } from '@/content/console/ui'
import { cx } from '@/lib/cx'
import { useConsoleSession } from './ConsoleSession'
import { ShortcutList } from './ShortcutsDialog'
import { type ConsoleTheme, setConsoleTheme, useConsoleTheme } from './ThemeControl'

const { settings, theme: themeCopy } = CONSOLE_UI
const THEMES: readonly ConsoleTheme[] = ['light', 'dark', 'system']

function Row({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <section className="grid gap-4 border-b border-surface-rule py-7 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="text-small font-semibold text-surface-fg">{title}</h2>
        {text && <p className="mt-1 text-small text-surface-muted">{text}</p>}
      </div>
      {children && <div className="min-w-0">{children}</div>}
    </section>
  )
}

/** Settings (CONSOLE §9): theme, motion, session reset with an inline confirmation, links. */
export function SettingsView() {
  const theme = useConsoleTheme()
  const { entries, reset } = useConsoleSession()
  const [confirming, setConfirming] = useState(false)
  const [cleared, setCleared] = useState(false)

  return (
    <div className="border-t border-surface-rule">
      <Row title={settings.theme}>
        <fieldset>
          <legend className="sr-only">{settings.theme}</legend>
          <div className="inline-flex rounded-md border border-surface-rule p-1">
            {THEMES.map((t) => (
              <label
                key={t}
                className={cx(
                  'flex h-9 cursor-pointer items-center rounded-md px-4 text-small transition-[color,background-color] duration-(--duration-micro) ease-out has-focus-visible:outline-2 has-focus-visible:outline-surface-accent pointer-coarse:h-11',
                  theme === t
                    ? 'bg-surface-invert text-surface-on-invert'
                    : 'text-surface-muted hover:text-surface-fg',
                )}
              >
                <input
                  type="radio"
                  name="console-theme"
                  value={t}
                  checked={theme === t}
                  onChange={() => setConsoleTheme(t)}
                  className="sr-only"
                />
                {themeCopy[t]}
              </label>
            ))}
          </div>
        </fieldset>
      </Row>

      <Row title={settings.motion} text={settings.motionText} />

      <Row title={settings.session} text={settings.sessionText}>
        {confirming ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="w-full text-small text-surface-fg sm:w-auto">{settings.confirm}</p>
            <Button
              onClick={() => {
                reset()
                setConfirming(false)
                setCleared(true)
              }}
            >
              {settings.confirmYes}
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              {settings.confirmNo}
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            disabled={entries.length === 0}
            onClick={() => {
              setCleared(false)
              setConfirming(true)
            }}
          >
            {settings.reset}
          </Button>
        )}
        <p role="status" className="mt-3 text-caption text-surface-muted">
          {cleared ? settings.cleared : ''}
        </p>
      </Row>

      <Row title={settings.account} text={settings.accountText} />

      <Row title={settings.shortcuts}>
        <ShortcutList />
      </Row>

      <Row title={settings.links}>
        <ul className="space-y-2.5">
          {settings.linkItems.map((l) => (
            <li key={l.href}>
              <SmartLink
                href={l.href}
                className="group inline-flex items-center gap-2 text-small text-surface-fg"
              >
                <span className="underline decoration-1 underline-offset-[0.22em] group-hover:decoration-2">
                  {l.label}
                </span>
                <Icon name="arrow-right" className="size-4 text-surface-subtle" />
              </SmartLink>
            </li>
          ))}
        </ul>
      </Row>
    </div>
  )
}
