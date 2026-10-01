'use client'

import { useEffect, useRef } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Kbd } from '@/components/ui/Kbd'
import { CONSOLE_UI } from '@/content/console/ui'

const { shortcuts } = CONSOLE_UI

/** True when a single-key shortcut must not fire: the user is typing (CONSOLE §11). */
export function typing(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/** The shortcut list, shared by the dialog and Settings. */
export function ShortcutList() {
  return (
    <dl className="divide-y divide-surface-rule">
      {shortcuts.items.map(([keys, what]) => (
        <div key={keys} className="flex items-center justify-between gap-6 py-2.5">
          <dt className="flex gap-1">
            {keys.split(' / ').map((k) => (
              <Kbd key={k}>{k}</Kbd>
            ))}
          </dt>
          <dd className="text-right text-small text-surface-muted">{what}</dd>
        </div>
      ))}
    </dl>
  )
}

/** `?` anywhere in the console (outside text fields) opens the list; Esc closes it (native dialog). */
export function ShortcutsDialog() {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '?' || e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return
      const d = dialog.current
      if (!d || d.open) return
      e.preventDefault()
      d.showModal()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
        className="hidden size-8 place-items-center rounded-md text-surface-muted hover:text-surface-fg md:grid pointer-coarse:size-11"
      >
        <span aria-hidden="true" className="font-mono text-label">
          ?
        </span>
        <span className="sr-only">{shortcuts.open}</span>
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="shortcuts-title"
        data-console-panel
        className="console-modal m-auto w-[min(440px,calc(100vw-2rem))] rounded-md border border-surface-rule bg-surface p-0 text-surface-fg shadow-menu"
      >
        <div className="flex items-center justify-between border-b border-surface-rule py-2 pr-2 pl-5">
          <h2 id="shortcuts-title" className="font-sans text-small font-semibold">
            {shortcuts.title}
          </h2>
          <form method="dialog">
            <button
              type="submit"
              className="grid size-9 place-items-center rounded-md hover:bg-surface-raise"
            >
              <Icon name="close" label={shortcuts.close} className="size-4" />
            </button>
          </form>
        </div>
        <div className="px-5 py-2">
          <ShortcutList />
        </div>
      </dialog>
    </>
  )
}
