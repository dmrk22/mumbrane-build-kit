'use client'

import { usePathname } from 'next/navigation'
import { useRef } from 'react'
import { Lockup } from '@/components/brand/Lockup'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SmartLink } from '@/components/ui/SmartLink'
import type { HeaderNav } from './Header'

/**
 * The < 1024 px navigation sheet (DESIGN §9.2). A native modal <dialog> provides the focus trap,
 * Escape, the inert page behind and focus return; globals.css locks page scroll while it is open.
 */
export function MobileNav({ nav }: { nav: HeaderNav }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const pathname = usePathname()
  // Every link in the sheet closes it as it navigates.
  const close = () => dialog.current?.close()

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-controls="mobile-nav"
        onClick={() => dialog.current?.showModal()}
        className="-mr-2 grid size-11 place-items-center lg:hidden"
      >
        <Icon name="menu" label={nav.menuButton.open} />
      </button>

      <dialog
        ref={dialog}
        id="mobile-nav"
        aria-label={nav.label}
        data-surface="paper"
        className="mobile-sheet fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none p-0 text-surface-fg lg:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-surface-rule px-edge">
            <SmartLink
              href="/"
              aria-label={nav.homeLabel}
              prefetch={false}
              onClick={close}
              className="-m-2 p-2"
            >
              <Lockup height={18} />
            </SmartLink>
            <button type="button" onClick={close} className="-mr-2 grid size-11 place-items-center">
              <Icon name="close" label={nav.menuButton.close} />
            </button>
          </div>

          <nav aria-label={nav.label} className="flex-1 overflow-y-auto px-edge py-4">
            <ul className="divide-y divide-surface-rule">
              {nav.menus.map((menu) => (
                <li key={menu.id}>
                  <details name="mobile-nav" className="nav-accordion group">
                    <summary className="flex h-14 cursor-pointer list-none items-center justify-between font-sans text-title [&::-webkit-details-marker]:hidden">
                      {menu.label}
                      <Icon
                        name="chevron-down"
                        className="transition-transform duration-(--duration-ui) ease-in-out group-open:rotate-180"
                      />
                    </summary>
                    <ul className="flex flex-col pb-4">
                      {menu.links.map((l) => (
                        <li key={l.href}>
                          <SmartLink
                            href={l.href}
                            prefetch={false}
                            onClick={close}
                            aria-current={pathname === l.href ? 'page' : undefined}
                            className="flex min-h-11 flex-col justify-center py-2 aria-[current=page]:underline"
                          >
                            <span className="font-sans text-body">{l.label}</span>
                            {'description' in l && l.description && (
                              <span className="text-small text-surface-muted">{l.description}</span>
                            )}
                          </SmartLink>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
              {nav.links.map((l) => (
                <li key={l.href}>
                  <SmartLink
                    href={l.href}
                    prefetch={false}
                    onClick={close}
                    aria-current={pathname === l.href ? 'page' : undefined}
                    className="flex h-14 items-center font-sans text-title aria-[current=page]:underline"
                  >
                    {l.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-surface-rule px-edge pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button href={nav.actions.secondary.href} variant="secondary" onClick={close}>
              {nav.actions.secondary.label}
            </Button>
            <Button href={nav.actions.primary.href} onClick={close}>
              {nav.actions.primary.label}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  )
}
