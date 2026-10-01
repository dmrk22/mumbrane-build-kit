import { Container } from '@/components/layout/Container'
import { Grid } from '@/components/layout/Grid'
import { PreviewForm } from '@/components/sections/PreviewForm'
import { CopyButton } from '@/components/ui/CopyButton'
import { Eyebrow } from '@/components/ui/Heading'
import { Inline } from '@/components/ui/Inline'
import { SmartLink } from '@/components/ui/SmartLink'
import { CONTACT, FORM_UI } from '@/content/contact'
import { parseInterest } from '@/lib/security/params'
import { routeMetadata } from '@/lib/seo'
import { sendContact } from './actions'

export const metadata = routeMetadata('/contact')

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

// PAGES §7.1 — surfaces: paper · paper-2 (the form panel). `?interest=` preselects the topic;
// anything that is not a known interest is ignored, never reflected.
export default async function ContactPage({ searchParams }: Props) {
  const interest = parseInterest((await searchParams).interest)
  return (
    <section
      data-surface="paper"
      aria-labelledby="contact-title"
      className="pt-12 pb-16 md:pt-16 md:pb-24 lg:pb-32"
    >
      <Container>
        <Grid className="gap-y-14">
          <div className="col-span-12 lg:col-span-5">
            <Eyebrow>{CONTACT.eyebrow}</Eyebrow>
            <h1 id="contact-title" className="mt-4 font-display text-display-l">
              {CONTACT.title}
            </h1>
            <p className="mt-6 max-w-[44ch] font-serif text-lede text-surface-muted">{CONTACT.lede}</p>
            <ul className="mt-10 flex flex-col gap-3">
              {CONTACT.emails.map((e) => (
                <li
                  key={e.address}
                  className="flex items-center justify-between gap-4 border border-surface-rule px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-serif-italic text-small text-surface-subtle">{e.label}</p>
                    <SmartLink
                      href={`mailto:${e.address}`}
                      className="mt-1 block text-body break-all link-prose"
                    >
                      {e.address}
                    </SmartLink>
                  </div>
                  <CopyButton text={e.address} label={`${CONTACT.copy}: ${e.address}`} />
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-[44ch] text-small text-surface-muted">{CONTACT.note}</p>
          </div>
          <div data-surface="paper-2" className="col-span-12 p-6 md:p-10 lg:col-span-6 lg:col-start-7">
            <PreviewForm
              kind="contact"
              action={sendContact}
              title={CONTACT.form.title}
              fields={CONTACT.form.fields}
              submit={CONTACT.form.submit}
              defaults={interest ? { interest } : {}}
              editHref="/contact"
              privacy={<Inline text={FORM_UI.privacy} />}
            />
          </div>
        </Grid>
      </Container>
    </section>
  )
}
