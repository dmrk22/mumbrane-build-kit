'use client'

import { usePathname } from 'next/navigation'
import { type PointerEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Lockup } from '@/components/brand/Lockup'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SmartLink } from '@/components/ui/SmartLink'
import type { HEADER } from '@/content/nav'
import { cx } from '@/lib/cx'
import { SURFACES, type Surface } from '@/lib/surface'
import { MobileNav } from './MobileNav'

export type HeaderNav = typeof HEADER

const DARK: ReadonlySet<Surface> = new Set(['ink', 'deep'])
const INTENT_MS = 120 // hover intent (DESIGN §7.7): never shorter, so menus don't flicker

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Top-level surfaces: sections and the footer, not nested panels or the header itself. */
function surfaceElements(header: HTMLElement): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('body [data-surface]')].filter(
    (el) => !header.contains(el) && !el.parentElement?.closest('body [data-surface]'),
  )
}

// Current, open and hovered links are underlined, never boxed. text-decoration skips the chevron
// icon, so only the label carries the line.
const NAV_LINK =
  'inline-flex h-9 items-center gap-1 px-2.5 text-small font-medium underline decoration-transparent decoration-1 underline-offset-[0.4em] transition-colors duration-(--duration-hover) hover:decoration-surface-fg/40 aria-[current=page]:decoration-current aria-expanded:decoration-current data-[current=true]:decoration-current'

/** `surfaceTop`: each route's first surface (registry), so the first paint is already themed. */
export function Header({
  nav,
  surfaceTop,
}: {
  nav: HeaderNav
  surfaceTop: Readonly<Record<string, Surface>>
}) {
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)
  const triggers = useRef(new Map<string, HTMLButtonElement>())
  const intent = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [surface, setSurface] = useState<Surface>(surfaceTop[pathname] ?? 'paper')
  const [scrolled, setScrolled] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState<string | null>(null)

  // Scroll state from sentinels at 8 / 24 / 80 px (no scroll listener). Hysteresis for the
  // collapse (DESIGN §7.1): collapse once 80 px has scrolled past, expand only back above 24 px.
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const passed = !e.isIntersecting && e.boundingClientRect.top < 0
        const which = e.target.getAttribute('data-sentinel')
        if (which === 'backdrop') setScrolled(passed)
        else if (which === 'collapse' && passed) setCollapsed(true)
        else if (which === 'expand' && e.isIntersecting) setCollapsed(false)
      }
    })
    for (const el of document.querySelectorAll('[data-sentinel]')) io.observe(el)
    return () => io.disconnect()
  }, [])

  // Theme from the surface under the header: observe a 1 px line along its bottom edge, and
  // re-observe when <main>'s content is swapped by a navigation.
  useEffect(() => {
    const header = headerRef.current
    const main = document.getElementById('main')
    if (!header) return
    let io: IntersectionObserver | undefined
    const observe = () => {
      io?.disconnect()
      const h = header.offsetHeight
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const value = e.target.getAttribute('data-surface')
            if (e.isIntersecting && SURFACES.includes(value as Surface)) setSurface(value as Surface)
          }
        },
        { rootMargin: `-${h}px 0px -${Math.max(0, window.innerHeight - h - 1)}px 0px` },
      )
      for (const el of surfaceElements(header)) io.observe(el)
    }
    observe()
    const mo = new MutationObserver(observe)
    if (main) mo.observe(main, { childList: true })
    window.addEventListener('resize', observe)
    return () => {
      io?.disconnect()
      mo.disconnect()
      window.removeEventListener('resize', observe)
    }
  }, [])

  // A navigation closes any open menu (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(null)
  }

  const close = useCallback((focusTrigger: boolean) => {
    setOpen((current) => {
      if (focusTrigger && current) triggers.current.get(current)?.focus()
      return null
    })
  }, [])

  // Outside click, focus leaving the header, and Escape close the open menu (Escape returns focus
  // to its trigger).
  useEffect(() => {
    if (!open) return
    const outside = (e: Event) => {
      if (!headerRef.current?.contains(e.target as Node)) close(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true)
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('focusin', outside)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  const hover = (id: string | null) => (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    clearTimeout(intent.current)
    intent.current = setTimeout(() => setOpen(id), INTENT_MS)
  }
  useEffect(() => () => clearTimeout(intent.current), [])

  const dark = DARK.has(surface)
  const panelSurface: Surface = dark ? 'ink' : 'paper'

  return (
    <>
      <div
        aria-hidden="true"
        data-sentinel="backdrop"
        className="pointer-events-none absolute top-2 h-px w-px"
      />
      <div
        aria-hidden="true"
        data-sentinel="expand"
        className="pointer-events-none absolute top-6 h-px w-px"
      />
      <div
        aria-hidden="true"
        data-sentinel="collapse"
        className="pointer-events-none absolute top-20 h-px w-px"
      />
      <header
        ref={headerRef}
        data-surface={surface}
        data-scrolled={scrolled || open !== null}
        data-collapsed={collapsed}
        className={cx(
          'sticky top-0 z-40 border-b border-transparent bg-transparent text-surface-fg print:hidden',
          'transition-[background-color,border-color,color] duration-[240ms] ease-out',
          'data-[scrolled=true]:border-surface-rule data-[scrolled=true]:bg-surface/86 data-[scrolled=true]:backdrop-blur-[14px] data-[scrolled=true]:backdrop-saturate-140',
        )}
      >
        <div className="mx-auto flex h-14 w-full max-w-360 items-center px-5 sm:px-6 lg:px-10">
          <SmartLink href="/" aria-label={nav.homeLabel} className="-m-2 p-2">
            <Lockup height={22} collapsible className="h-5 w-auto lg:h-5.5" />
          </SmartLink>

          <nav aria-label={nav.label} className="ml-auto hidden lg:block" onPointerLeave={hover(null)}>
            <ul className="flex items-center">
              {nav.menus.map((menu) => {
                const expanded = open === menu.id
                const current = menu.links.some((l) => isCurrent(pathname, l.href)) || pathname === menu.index
                return (
                  <li key={menu.id} className="relative">
                    <button
                      type="button"
                      ref={(el) => {
                        if (el) triggers.current.set(menu.id, el)
                      }}
                      id={`menu-trigger-${menu.id}`}
                      aria-expanded={expanded}
                      aria-controls={`menu-${menu.id}`}
                      data-current={current}
                      className={NAV_LINK}
                      onClick={(e) => {
                        // A click settles any pending hover intent. Keyboard (detail 0) toggles; a
                        // pointer click only opens, so it can't undo a menu that hover just opened.
                        clearTimeout(intent.current)
                        setOpen(expanded && e.detail === 0 ? null : menu.id)
                      }}
                      onPointerEnter={hover(menu.id)}
                    >
                      {menu.label}
                      <Icon
                        name="chevron-down"
                        className={cx(
                          'size-4 transition-transform duration-(--duration-hover) ease-out',
                          expanded && 'rotate-180',
                        )}
                      />
                    </button>
                    <MenuPanel
                      menu={menu}
                      open={expanded}
                      surface={panelSurface}
                      pathname={pathname}
                      onPointerEnter={hover(menu.id)}
                      onNavigate={() => setOpen(null)}
                    />
                  </li>
                )
              })}
              {nav.links.map((l) => (
                <li key={l.href} onPointerEnter={hover(null)}>
                  <SmartLink
                    href={l.href}
                    className={NAV_LINK}
                    aria-current={isCurrent(pathname, l.href) ? 'page' : undefined}
                  >
                    {l.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-3 lg:border-l lg:border-surface-rule lg:pl-3">
            {/* A wrapper, not a class on the link: `hidden` would lose to its own `inline-flex`. */}
            <div className="hidden lg:block">
              <SmartLink href={nav.actions.secondary.href} className={NAV_LINK}>
                {nav.actions.secondary.label}
              </SmartLink>
            </div>
            <Button href={nav.actions.primary.href} size="sm">
              {nav.actions.primary.label}
            </Button>
            <MobileNav nav={nav} />
          </div>
        </div>
      </header>
    </>
  )
}

type MenuData = HeaderNav['menus'][number]

/**
 * A dropdown disclosure card anchored under its trigger: a labelled region of links, not an ARIA
 * menu. The top padding is part of the panel so the pointer can cross the gap without leaving it.
 */
function MenuPanel({
  menu,
  open,
  surface,
  pathname,
  onPointerEnter,
  onNavigate,
}: {
  menu: MenuData
  open: boolean
  surface: Surface
  pathname: string
  onPointerEnter: (e: PointerEvent) => void
  onNavigate: () => void
}) {
  return (
    <section
      id={`menu-${menu.id}`}
      aria-labelledby={`menu-trigger-${menu.id}`}
      data-surface={surface}
      data-open={open}
      onPointerEnter={onPointerEnter}
      className={cx(
        'absolute top-full left-0 pt-2',
        'invisible -translate-y-1 opacity-0 transition-[opacity,translate,visibility] duration-[160ms] ease-in',
        'data-[open=true]:visible data-[open=true]:translate-y-0 data-[open=true]:opacity-100 data-[open=true]:duration-[240ms] data-[open=true]:ease-out',
      )}
    >
      <div className="w-92 rounded-lg border border-surface-rule bg-surface p-2 text-surface-fg shadow-menu">
        <ul className="flex flex-col">
          {menu.links.map((l) => (
            <li
              key={l.href}
              className="menu-item translate-y-1 opacity-0 transition-[opacity,translate] duration-(--duration-ui) ease-out in-data-[open=true]:translate-y-0 in-data-[open=true]:opacity-100"
            >
              <SmartLink
                href={l.href}
                className="group flex items-center gap-3 rounded-md px-3 py-2 transition-colors duration-(--duration-hover) hover:bg-surface-raise aria-[current=page]:bg-surface-raise"
                aria-current={isCurrent(pathname, l.href) ? 'page' : undefined}
                prefetch={false}
                onClick={onNavigate}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-small font-medium">{l.label}</span>
                  {'description' in l && l.description && (
                    <span className="text-caption text-surface-muted">{l.description}</span>
                  )}
                </span>
                <Icon
                  name="arrow-right"
                  className="size-4 shrink-0 -translate-x-1 opacity-0 transition-[opacity,translate] duration-(--duration-hover) ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                />
              </SmartLink>
            </li>
          ))}
        </ul>
        <SmartLink
          href={menu.feature.href}
          prefetch={false}
          onClick={onNavigate}
          className="group mt-2 flex items-end gap-3 rounded-md border-t border-surface-rule bg-surface-raise px-3 pt-3 pb-3 transition-colors duration-(--duration-hover) hover:bg-surface-fg/8"
        >
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-mono text-label text-surface-subtle">{menu.feature.eyebrow}</span>
            <span className="text-small font-medium">{menu.feature.title}</span>
          </span>
          <Icon
            name="arrow-right"
            className="size-4 shrink-0 transition-transform duration-(--duration-hover) ease-out group-hover:translate-x-0.5"
          />
        </SmartLink>
      </div>
    </section>
  )
}
