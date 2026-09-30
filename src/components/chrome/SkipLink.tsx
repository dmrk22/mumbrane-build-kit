import { site } from '@/content/site'

/** First focusable element on every page; lands on <main id="main">. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-50 bg-paper px-4 py-2 text-small text-text focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {site.skipLink}
    </a>
  )
}
