'use client'

import { site } from '@/content/site'
import './globals.css'

// Replaces the root layout when it fails (PAGES §0.8): own <html>/<body>, system fonts, token
// colours through classes, no external assets, no error details.
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { title, body, retry: retryLabel, home } = site.error
  return (
    <html lang="en" data-surface="paper">
      <body className="grid min-h-dvh place-items-center px-5 font-[system-ui,sans-serif]">
        <main id="main" className="max-w-xl">
          <h1 className="font-[Georgia,serif] text-display-m">{title}</h1>
          <p className="mt-6 text-lede text-text-2">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="h-11 rounded-md bg-ink px-5 text-small text-on-dark"
            >
              {retryLabel}
            </button>
            {/* A full reload on purpose: the app shell itself failed, so client navigation can't be trusted. */}
            <a
              href="/"
              className="inline-flex h-11 items-center rounded-md border border-ink/40 px-5 text-small"
            >
              {home}
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}
