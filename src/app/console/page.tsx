import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { site } from '@/content/site'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/console')

// The console app is parked (D-147); the previous entry page is in git history.
export default function ConsoleComingSoon() {
  const { eyebrow, title, body, links } = site.consoleSoon
  return (
    <Section surface="paper" labelledBy="console-title" className="pt-12 md:pt-16 lg:pt-24">
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading level={1} size="display-l" id="console-title" className="mt-4 max-w-[18ch]">
        {title}
      </Heading>
      <p className="mt-6 max-w-text text-lede text-surface-muted">{body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {links.map((l, i) => (
          <Button key={l.href} href={l.href} variant={i === 0 ? 'primary' : 'secondary'} arrow={i === 0}>
            {l.label}
          </Button>
        ))}
      </div>
    </Section>
  )
}
