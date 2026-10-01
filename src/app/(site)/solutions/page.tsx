import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { Icon } from '@/components/ui/Icon'
import { Inline } from '@/components/ui/Inline'
import { SmartLink } from '@/components/ui/SmartLink'
import { SOLUTION_UI, SOLUTIONS, SOLUTIONS_OVERVIEW } from '@/content/solutions'
import { cx } from '@/lib/cx'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/solutions')

function Card({
  href,
  icon,
  name,
  promise,
  wide = false,
}: {
  href: string
  icon: 'chart' | 'book' | 'layers' | 'key' | 'flask'
  name: string
  promise: string
  wide?: boolean
}) {
  return (
    <SmartLink
      href={href}
      className={cx(
        'group flex h-full flex-col justify-between gap-10 border border-surface-rule bg-surface p-6 transition-colors duration-(--duration-hover) hover:bg-surface-raise md:p-8',
        wide && 'md:flex-row md:items-end',
      )}
    >
      <span className="flex flex-col gap-6">
        <Icon name={icon} className="size-6 text-surface-muted" />
        <span className="font-display text-display-s">{name}</span>
        <span className="max-w-[36ch] text-body text-surface-muted">{promise}</span>
      </span>
      <span className="inline-flex items-center gap-2 text-small font-medium">
        <span className="underline decoration-1 underline-offset-[0.22em] group-hover:decoration-2">
          {SOLUTION_UI.explore}
        </span>
        <Icon
          name="arrow-right"
          className="size-4 transition-transform duration-(--duration-hover) ease-out group-hover:translate-x-0.5"
        />
      </span>
    </SmartLink>
  )
}

// PAGES §8 — surfaces: paper · paper-2 · paper · ink.
export default function SolutionsPage() {
  const { eyebrow, title, lede, useCases, fit, cta } = SOLUTIONS_OVERVIEW
  return (
    <>
      <Section surface="paper" labelledBy="solutions-title" className="pt-12 md:pt-16 lg:pt-24">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 id="solutions-title" className="mt-4 max-w-[16ch] font-display text-display-xl">
          <Inline text={title} />
        </h1>
        <p className="mt-8 max-w-[52ch] text-lede text-surface-muted">{lede}</p>
      </Section>

      <Section surface="paper-2" id="solutions-list" labelledBy="solutions-list-title">
        <h2 id="solutions-list-title" className="sr-only">
          {eyebrow}
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {SOLUTIONS.map((s) => (
            <li key={s.slug}>
              <Card href={`/solutions/${s.slug}`} icon={s.icon} name={s.name} promise={s.promise} />
            </li>
          ))}
          <li className="md:col-span-2">
            <Card href={useCases.href} icon="flask" name={useCases.name} promise={useCases.promise} wide />
          </li>
        </ul>
      </Section>

      <Section surface="paper" id="fit" labelledBy="fit-title">
        <Heading level={2} size="display-m" id="fit-title">
          {fit.title}
        </Heading>
        <Grid className="mt-12 gap-y-12">
          {[
            { list: fit.fits, icon: 'check' as const, tone: 'text-ice-fg' },
            { list: fit.not, icon: 'minus' as const, tone: 'text-surface-subtle' },
          ].map(({ list, icon, tone }) => (
            <div key={list.title} className="col-span-12 md:col-span-6">
              <h3 className="font-mono text-label text-surface-subtle">{list.title}</h3>
              <ul className="mt-6 border-t border-surface-rule">
                {list.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-4 border-b border-surface-rule py-4 text-lede"
                  >
                    <Icon name={icon} className={cx('mt-1.5 size-5 shrink-0', tone)} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Grid>
      </Section>

      <Section surface="ink" id="solutions-cta" labelledBy="solutions-cta-title" rhythm="compact">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Heading level={2} size="display-m" id="solutions-cta-title">
              {cta.title}
            </Heading>
            <p className="mt-4 max-w-[48ch] text-body text-surface-muted">{cta.text}</p>
          </div>
          <Button href={cta.action.href} arrow>
            {cta.action.label}
          </Button>
        </div>
      </Section>
    </>
  )
}
