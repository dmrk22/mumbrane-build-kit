import { CropMarks } from '@/components/art/CropMarks'
import { MuonTrack } from '@/components/art/MuonTrack'
import { Painting } from '@/components/art/Painting'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { BlocksMosaic } from '@/components/sections/BlocksMosaic'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { Icon } from '@/components/ui/Icon'
import { Inline } from '@/components/ui/Inline'
import { SmartLink } from '@/components/ui/SmartLink'
import { COMPANY } from '@/content/company'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/company')

// PAGES §5 — surfaces: paper (hero + blocks, pinned together as on board 05) · paper · paper-2 · ink.
export default function CompanyPage() {
  const { hero, blocks, about, name, cta } = COMPANY
  return (
    <>
      <BlocksMosaic
        blocks={blocks.items}
        labels={{ unlocked: blocks.unlocked, locked: blocks.locked }}
        heading={
          <>
            <Eyebrow>{hero.eyebrow}</Eyebrow>
            <h1 id="company-title" className="mt-3 font-display text-display-l">
              <Inline text={hero.title} />
            </h1>
          </>
        }
        lede={hero.lede}
      />

      <Section surface="paper" id="why-closed-worlds" labelledBy="about-title">
        <Grid className="items-center gap-y-12">
          <div className="col-span-12 lg:col-span-6">
            <Heading level={2} size="display-m" id="about-title">
              {about.title}
            </Heading>
            <p className="mt-6 max-w-text text-lede">{about.text}</p>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <CropMarks>
              <Painting id={about.painting} sizes="(min-width: 1024px) 36vw, 100vw" />
            </CropMarks>
          </div>
        </Grid>
      </Section>

      <Section surface="paper-2" id="the-name" labelledBy="name-title">
        <Grid className="items-center gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <Heading level={2} size="display-m" id="name-title">
              {name.title}
            </Heading>
            <p className="mt-6 max-w-text text-body text-surface-muted">{name.text}</p>
          </div>
          <figure className="col-span-12 lg:col-span-6 lg:col-start-7">
            <MuonTrack labels={name.labels} className="text-surface-fg" />
            <figcaption className="mt-4 font-mono text-label text-surface-subtle">{name.figure}</figcaption>
          </figure>
        </Grid>
      </Section>

      <Section surface="ink" labelledBy="company-cta-title" rhythm="compact">
        <h2 id="company-cta-title" className="sr-only">
          {cta.title}
        </h2>
        <ul className="border-t border-surface-rule">
          {cta.links.map((l) => (
            <li key={l.href} className="border-b border-surface-rule">
              <SmartLink
                href={l.href}
                className="group flex items-center justify-between gap-6 py-6 font-display text-display-m md:py-8"
              >
                <span className="decoration-1 underline-offset-[0.14em] group-hover:underline">
                  {l.label}
                </span>
                <Icon
                  name="arrow-right"
                  className="size-6 shrink-0 transition-transform duration-(--duration-hover) ease-out group-hover:translate-x-1 md:size-8"
                />
              </SmartLink>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
