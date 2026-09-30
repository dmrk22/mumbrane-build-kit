import type { Metadata } from 'next'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { site } from '@/content/site'
import { publicEnv } from '@/lib/env'
import { fontVars } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: publicEnv.siteUrl,
  title: { default: site.title, template: site.titleTemplate },
  description: site.description,
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Reading the request headers opts every page into dynamic rendering, which per-request CSP
  // nonces require (SECURITY §3.3). The nonce is handed only to scripts that need it (none yet).
  await headers()
  return (
    <html lang="en" data-surface="paper" className={fontVars}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-2"
        >
          {site.skipLink}
        </a>
        {children}
      </body>
    </html>
  )
}
