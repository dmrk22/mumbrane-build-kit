import type { Metadata } from 'next'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { site } from '@/content/site'
import { publicEnv } from '@/lib/env'
import { fontVars } from './fonts'
import './globals.css'
// Generated painting placeholders (scripts/images.ts): one class per painting, no inline styles.
import './lqip.css'

export const metadata: Metadata = {
  metadataBase: publicEnv.siteUrl,
  title: { default: site.title, template: site.titleTemplate },
  description: site.description,
}

// No providers and no chrome here (PAGES §0.2): the (site) and console layouts bring their own.
export default async function RootLayout({ children }: { children: ReactNode }) {
  // Reading the request headers opts every page into dynamic rendering, which per-request CSP
  // nonces require (SECURITY §3.3). The nonce is handed only to scripts that need it (none yet).
  await headers()
  return (
    <html lang="en" data-surface="paper" className={fontVars}>
      <body>{children}</body>
    </html>
  )
}
