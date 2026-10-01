'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Mark } from '@/components/brand/Mark'
import { Tag } from '@/components/ui/Chip'
import { Icon, type IconName } from '@/components/ui/Icon'
import { SmartLink } from '@/components/ui/SmartLink'
import { CONSOLE_UI } from '@/content/console/ui'
import { cx } from '@/lib/cx'
import { ShortcutsDialog } from './ShortcutsDialog'
import { ThemeControl } from './ThemeControl'

type Item = { href: string; label: string; icon: IconName; match: (p: string) => boolean }

const { nav, titles } = CONSOLE_UI
// The entry screen is where a world is chosen, so Playground leads there and stays current on both.
const PLAYGROUND: Item = {
  href: '/console',
  label: nav.playground,
  icon: 'flask',
  match: (p) => p === '/console' || p.startsWith('/console/playground'),
}
const KEYS: Item = {
  href: '/console/keys',
  label: nav.keys,
  icon: 'key',
  match: (p) => p === '/console/keys',
}
const USAGE: Item = {
  href: '/console/usage',
  label: nav.usage,
  icon: 'chart',
  match: (p) => p === '/console/usage',
}
const SETTINGS: Item = {
  href: '/console/settings',
  label: nav.settings,
  icon: 'gear',
  match: (p) => p === '/console/settings',
}
const DOCS: Item = { href: '/developers/docs', label: nav.docs, icon: 'book', match: () => false }

function title(p: string): string {
  if (p.startsWith('/console/playground')) return titles.playground
  if (p === '/console/keys') return titles.keys
  if (p === '/console/usage') return titles.usage
  if (p === '/console/settings') return titles.settings
  return nav.label
}

function RailLink({ item, pathname }: { item: Item; pathname: string }) {
  const current = item.match(pathname)
  return (
    <SmartLink
      href={item.href}
      aria-current={current ? 'page' : undefined}
      className={cx(
        'relative flex h-14 w-full flex-col items-center justify-center gap-1 text-surface-muted transition-[color] duration-(--duration-micro) ease-out hover:text-surface-fg',
        current && 'text-surface-fg',
      )}
    >
      {current && <span aria-hidden="true" className="absolute inset-y-3 left-0 w-0.5 bg-surface-accent" />}
      <Icon name={item.icon} />
      <span className="font-sans text-label tracking-normal">{item.label}</span>
    </SmartLink>
  )
}

function TabLink({ item, pathname }: { item: Item; pathname: string }) {
  const current = item.match(pathname)
  return (
    <SmartLink
      href={item.href}
      aria-current={current ? 'page' : undefined}
      className={cx(
        'relative flex h-14 flex-1 flex-col items-center justify-center gap-1 text-surface-muted',
        current && 'text-surface-fg',
      )}
    >
      {current && <span aria-hidden="true" className="absolute inset-x-6 top-0 h-0.5 bg-surface-accent" />}
      <Icon name={item.icon} />
      <span className="font-sans text-label tracking-normal">{item.label}</span>
    </SmartLink>
  )
}

/**
 * The console shell (CONSOLE §2): a 72 px rail from 768 px (Playground, Keys, Usage; Docs and
 * Settings at the foot), a 48 px top bar with the page title, the Simulation tag and the theme
 * control, and a bottom tab bar on phones.
 */
export function ConsoleChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const TitleTag = pathname === '/console' ? 'p' : 'h1'
  return (
    <>
      <nav
        aria-label={nav.label}
        data-console-panel
        className="fixed inset-y-0 left-0 z-30 hidden w-18 flex-col items-center border-r border-surface-rule bg-surface md:flex"
      >
        <SmartLink
          href="/"
          className="grid h-14 w-full place-items-center text-surface-fg"
          aria-label={nav.home}
        >
          <Mark width={28} />
        </SmartLink>
        <div className="mt-2 flex w-full flex-col">
          <RailLink item={PLAYGROUND} pathname={pathname} />
          <RailLink item={KEYS} pathname={pathname} />
          <RailLink item={USAGE} pathname={pathname} />
        </div>
        <div className="mt-auto mb-2 flex w-full flex-col">
          <RailLink item={DOCS} pathname={pathname} />
          <RailLink item={SETTINGS} pathname={pathname} />
        </div>
      </nav>

      <div className="flex min-h-dvh flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0 md:pl-18">
        <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 border-b border-surface-rule bg-surface px-4 md:px-6">
          <SmartLink
            href="/"
            className="-ml-1 grid size-9 place-items-center md:hidden"
            aria-label={nav.home}
          >
            <Mark width={24} />
          </SmartLink>
          {/* The page's H1, except on the entry screen, which carries its own display heading. */}
          <TitleTag className="truncate font-sans text-title text-surface-fg">{title(pathname)}</TitleTag>
          <Tag className="ml-auto shrink-0">{CONSOLE_UI.simulation}</Tag>
          {/* Phones set the theme in Settings; the top bar keeps room for the title. */}
          <div className="hidden sm:block">
            <ThemeControl />
          </div>
          <ShortcutsDialog />
        </header>
        <main id="main" tabIndex={-1} className="flex min-h-0 flex-1 flex-col outline-none">
          {children}
        </main>
      </div>

      <nav
        aria-label={nav.label}
        data-console-panel
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-surface-rule bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <TabLink item={PLAYGROUND} pathname={pathname} />
        <TabLink item={KEYS} pathname={pathname} />
        <TabLink item={USAGE} pathname={pathname} />
        <TabLink item={SETTINGS} pathname={pathname} />
      </nav>
    </>
  )
}
