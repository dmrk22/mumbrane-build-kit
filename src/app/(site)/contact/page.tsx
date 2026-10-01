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

// Contact — surfaces: ink, with the form on a paper card. `?interest=` preselects the topic;
// anything that is not a known interest is ignored, never reflected.
export default async function ContactPage({ searchParams }: Props) {
  const interest = parseInterest((await searchParams).interest)
  return (
    <section
      data-surface="ink"
      aria-labelledby="contact-title"
      className="-mt-15 pt-32 pb-20 md:pt-40 md:pb-28 lg:-mt-18 lg:pb-36"
    >
      <Container>
        <Grid className="items-start gap-y-16">
          <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-28">
            <Eyebrow>{CONTACT.eyebrow}</Eyebrow>
            <h1 id="contact-title" className="mt-6 font-display text-display-l">
              {CONTACT.title}
            </h1>
            <p className="mt-6 max-w-[42ch] text-lede text-surface-muted">{CONTACT.lede}</p>
            <ul className="mt-14 flex flex-col gap-9">
              {CONTACT.emails.map((e) => (
                <li key={e.address}>
                  <p className="font-mono text-label text-surface-subtle">{e.label}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-surface-fg" />
                    <span aria-hidden="true" className="h-px w-10 shrink-0 bg-surface-accent sm:w-16" />
                    <SmartLink
                      href={`mailto:${e.address}`}
                      className="min-w-0 truncate text-title decoration-1 underline-offset-[0.22em] hover:underline"
                    >
                      {e.address}
                    </SmartLink>
                    <CopyButton text={e.address} label={`${CONTACT.copy}: ${e.address}`} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-14 max-w-[42ch] text-small text-surface-muted">{CONTACT.note}</p>
          </div>
          <div
            data-surface="paper"
            className="col-span-12 rounded-xl p-6 shadow-menu md:p-10 lg:col-span-6 lg:col-start-7"
          >
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
