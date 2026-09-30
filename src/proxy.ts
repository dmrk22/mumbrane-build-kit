import { type NextRequest, NextResponse } from 'next/server'
import { buildCsp, createNonce, TRUSTED_TYPES_REPORT_ONLY } from './lib/security/csp.ts'

export function proxy(request: NextRequest) {
  const nonce = createNonce()
  const csp = buildCsp({
    nonce,
    dev: process.env.NODE_ENV === 'development',
    upgradeInsecure: request.nextUrl.protocol === 'https:',
  })

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce) // always overwrite any client-sent value
  requestHeaders.set('Content-Security-Policy', csp) // Next reads the nonce from here

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  if (process.env.CSP_TT_TRIAL === '1') {
    response.headers.set('Content-Security-Policy-Report-Only', TRUSTED_TYPES_REPORT_ONLY)
  }
  return response
}

export const config = {
  matcher: [
    {
      source:
        '/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-touch-icon.png|icons/|brand/|paintings/|og/|\\.well-known/|robots.txt|sitemap.xml|manifest.webmanifest|llms.txt|console-theme.js|md/).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
