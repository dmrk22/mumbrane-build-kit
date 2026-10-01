import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { Icon } from '@/components/ui/Icon'
import { SmartLink } from '@/components/ui/SmartLink'
import { PRICING } from '@/content/pricing'
import { cx } from '@/lib/cx'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/pricing')

// The plan's pigment as its top rule (PAGES §12).
const RULE = {
  ice: 'border-t-ice',
  moss: 'border-t-moss',
  ink: 'border-t-ink',
} as const

// PAGES §12 — surfaces: paper · paper-2 · paper. No prices, discounts or tiers (CONTENT §4).
export default function PricingPage() {
  const { eyebrow, title, lede, plans, faq, note } = PRICING
  return (
    <>
      <Section
        surface="paper"
        labelledBy="pricing-title"
        className="pt-12 md:pt-16 lg:pt-24"
        rhythm="compact"
      >
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 id="pricing-title" className="mt-4 font-display text-display-xl">
          {title}
        </h1>
        <p className="mt-8 max-w-[52ch] text-lede text-surface-muted">{lede}</p>
      </Section>

      <Section surface="paper-2" id="plans" labelledBy="plans-title">
        <h2 id="plans-title" className="sr-only">
          {title}
        </h2>
        <ul className="grid gap-4 lg:grid-cols-3">
          {plans.map((p) => (
            <li
              key={p.name}
              className={cx(
                'flex flex-col gap-6 border border-t-4 border-surface-rule bg-surface p-6 md:p-8',
                RULE[p.pigment],
              )}
            >
              <h3 className="font-mono text-label text-surface-subtle">{p.name}</h3>
              <p className="font-display text-display-s">{p.price}</p>
              <p className="text-body">{p.text}</p>
              <ul className="flex flex-col gap-3 border-t border-surface-rule pt-5 text-small text-surface-muted">
                {p.facts.map((f) => (
                  <li key={f} className="flex gap-3">
                    <Icon name="minus" className="mt-0.5 size-4 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                <Button href={p.action.href} variant={p.price === 'Free' ? 'primary' : 'secondary'} arrow>
                  {p.action.label}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section surface="paper" id="faq" labelledBy="faq-title">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
          <Heading level={2} size="display-m" id="faq-title" className="lg:col-span-4">
            {faq.title}
          </Heading>
          <div className="lg:col-span-7 lg:col-start-6">
            <div className="border-t border-surface-rule">
              {faq.items.map((item) => (
                <details key={item.q} className="group border-b border-surface-rule">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-title [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <Icon
                      name="plus"
                      className="size-5 shrink-0 transition-transform duration-(--duration-ui) group-open:rotate-45"
                    />
                  </summary>
                  <p className="max-w-[60ch] pb-6 text-body text-surface-muted">{item.a}</p>
                </details>
              ))}
            </div>
            <p className="mt-8 text-small text-surface-muted">
              {note.text}{' '}
              <SmartLink href={note.link.href} className="link-prose">
                {note.link.label}
              </SmartLink>
              .
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}
