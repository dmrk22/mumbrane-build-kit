'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { CONSOLE_UI } from '@/content/console/ui'

const { keys } = CONSOLE_UI

/**
 * "Create key" as a demonstration (CONSOLE §9, SECURITY §7): the dialog walks through name and
 * scope, then states that no key was created. Nothing is generated, shown, copied or kept.
 */
export function KeysDemo() {
  const dialog = useRef<HTMLDialogElement>(null)
  const [done, setDone] = useState(false)
  return (
    <>
      <Button variant="secondary" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
        <span className="inline-flex items-center gap-2">
          <Icon name="plus" className="size-4" />
          {keys.create}
        </span>
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby="key-title"
        data-console-panel
        onClose={() => setDone(false)}
        className="console-modal m-auto w-[min(460px,calc(100vw-2rem))] rounded-md border border-surface-rule bg-surface p-0 text-surface-fg shadow-menu"
      >
        <div className="flex items-center justify-between border-b border-surface-rule py-2 pr-2 pl-5">
          <h2 id="key-title" className="text-small font-semibold">
            {keys.dialog.title}
          </h2>
          <form method="dialog">
            <button
              type="submit"
              className="grid size-9 place-items-center rounded-md hover:bg-surface-raise"
            >
              <Icon name="close" label={keys.dialog.close} className="size-4" />
            </button>
          </form>
        </div>
        {done ? (
          <div className="px-5 py-6">
            <p role="status" className="flex items-start gap-2.5 text-body">
              <Icon name="info" className="mt-0.5" />
              {keys.dialog.done}
            </p>
            <form method="dialog" className="mt-6 flex justify-end">
              <Button type="submit">{keys.dialog.close}</Button>
            </form>
          </div>
        ) : (
          <form
            className="space-y-5 px-5 py-6"
            onSubmit={(e) => {
              e.preventDefault()
              setDone(true)
            }}
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="key-name" className="text-small font-medium">
                {keys.dialog.name}
              </label>
              <input
                id="key-name"
                name="name"
                maxLength={64}
                autoComplete="off"
                className="h-11 rounded-md border border-surface-subtle bg-surface-raise px-3.5 text-body text-surface-fg"
              />
            </div>
            <fieldset>
              <legend className="text-small font-medium">{keys.dialog.scope}</legend>
              <div className="mt-2 space-y-2">
                {keys.dialog.scopes.map((s, i) => (
                  <label key={s.value} className="flex min-h-11 cursor-pointer items-center gap-3 text-small">
                    <input
                      type="radio"
                      name="scope"
                      value={s.value}
                      defaultChecked={i === 0}
                      className="size-4 accent-current"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => dialog.current?.close()}>
                {keys.dialog.cancel}
              </Button>
              <Button type="submit">{keys.dialog.submit}</Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  )
}
