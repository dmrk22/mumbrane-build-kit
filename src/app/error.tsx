'use client'

import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { site } from '@/content/site'

// Error boundary (PAGES §0.8). It never renders the error, its message, stack or digest.
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { eyebrow, title, body, retry: retryLabel, home } = site.error
  return (
    <main id="main" tabIndex={-1} className="grid min-h-dvh items-center">
      <Section surface="paper" labelledBy="error-title">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading level={1} size="display-l" id="error-title" className="mt-4 max-w-[18ch]">
          {title}
        </Heading>
        <p className="mt-6 max-w-[48ch] text-lede text-surface-muted">{body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={() => retry()}>{retryLabel}</Button>
          <Button href="/" variant="secondary">
            {home}
          </Button>
        </div>
      </Section>
    </main>
  )
}
