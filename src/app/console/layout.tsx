import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { SkipLink } from '@/components/chrome/SkipLink'
import { ConsoleChrome } from '@/components/console/ConsoleChrome'
import { ConsoleSession } from '@/components/console/ConsoleSession'
import { ThemeBootstrap } from '@/components/console/ThemeControl'
import './console.css'

// CONSOLE §2, §10.2. The theme script comes before the shell markup, so the stored theme is set
// before the first paint; it is same-origin and carries the request nonce (SECURITY §3).
export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined
  return (
    <>
      <ThemeBootstrap nonce={nonce} />
      <div data-surface="paper" data-console-surface className="min-h-dvh">
        <SkipLink />
        <ConsoleSession>
          <ConsoleChrome>{children}</ConsoleChrome>
        </ConsoleSession>
      </div>
    </>
  )
}
