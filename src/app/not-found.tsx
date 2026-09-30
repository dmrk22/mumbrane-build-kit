import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { site } from '@/content/site'

// Never echoes the requested path (SECURITY §2.3).
export default function NotFound() {
  const { eyebrow, title, body, links } = site.notFound
  return (
    <main id="main" tabIndex={-1} className="grid min-h-dvh items-center">
      <Section surface="paper" labelledBy="not-found-title">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading level={1} size="display-l" id="not-found-title" className="mt-4 max-w-[18ch]">
          {title}
        </Heading>
        <p className="mt-6 max-w-[48ch] text-lede text-surface-muted">{body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {links.map((l, i) => (
            <Button key={l.href} href={l.href} variant={i === 0 ? 'primary' : 'secondary'} arrow={i === 0}>
              {l.label}
            </Button>
          ))}
        </div>
      </Section>
    </main>
  )
}
