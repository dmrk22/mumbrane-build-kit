import { Container } from '@/components/layout/Container'
import { Grid } from '@/components/layout/Grid'
import { PreviewForm } from '@/components/sections/PreviewForm'
import { Eyebrow } from '@/components/ui/Heading'
import { Inline } from '@/components/ui/Inline'
import { FORM_UI, SALES } from '@/content/contact'
import { routeMetadata } from '@/lib/seo'
import { sendSales } from '../actions'

export const metadata = routeMetadata('/contact/sales')

// Contact sales — surfaces: ink, with the form on a paper card.
export default function SalesPage() {
  return (
    <section
      data-surface="ink"
      aria-labelledby="sales-title"
      className="-mt-15 pt-32 pb-20 md:pt-40 md:pb-28 lg:-mt-18 lg:pb-36"
    >
      <Container>
        <Grid className="items-start gap-y-16">
          <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-28">
            <Eyebrow>{SALES.eyebrow}</Eyebrow>
            <h1 id="sales-title" className="mt-6 font-display text-display-l">
              {SALES.title}
            </h1>
            <p className="mt-6 max-w-text text-lede text-surface-muted">{SALES.lede}</p>
            <section aria-labelledby="expect-title" className="mt-14">
              <h2 id="expect-title" className="font-mono text-label text-surface-subtle">
                {SALES.expect.title}
              </h2>
              <ul className="mt-6 flex flex-col border-l border-surface-accent/60">
                {SALES.expect.items.map((item) => (
                  <li key={item.text} className="relative py-3 pl-6 text-body">
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 -left-[4.5px] size-2 -translate-y-1/2 rounded-md bg-surface-fg"
                    />
                    {item.text}
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <div
            data-surface="paper"
            className="col-span-12 rounded-md p-6 shadow-menu md:p-10 lg:col-span-6 lg:col-start-7"
          >
            <PreviewForm
              kind="sales"
              action={sendSales}
              title={SALES.form.title}
              fields={SALES.form.fields}
              submit={SALES.form.submit}
              defaults={{}}
              editHref="/contact/sales"
              privacy={<Inline text={FORM_UI.privacy} />}
            />
          </div>
        </Grid>
      </Container>
    </section>
  )
}
