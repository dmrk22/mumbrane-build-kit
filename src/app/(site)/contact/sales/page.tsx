import { Container } from '@/components/layout/Container'
import { Grid } from '@/components/layout/Grid'
import { PreviewForm } from '@/components/sections/PreviewForm'
import { Eyebrow } from '@/components/ui/Heading'
import { Icon } from '@/components/ui/Icon'
import { Inline } from '@/components/ui/Inline'
import { FORM_UI, SALES } from '@/content/contact'
import { routeMetadata } from '@/lib/seo'
import { sendSales } from '../actions'

export const metadata = routeMetadata('/contact/sales')

// PAGES §7.2 — surfaces: paper · ink ("What to expect").
export default function SalesPage() {
  return (
    <section
      data-surface="paper"
      aria-labelledby="sales-title"
      className="pt-12 pb-16 md:pt-16 md:pb-24 lg:pb-32"
    >
      <Container>
        <Grid className="gap-y-14">
          <div className="col-span-12 lg:col-span-5">
            <Eyebrow>{SALES.eyebrow}</Eyebrow>
            <h1 id="sales-title" className="mt-4 font-display text-display-l">
              {SALES.title}
            </h1>
            <p className="mt-6 max-w-[44ch] font-serif text-lede text-surface-muted">{SALES.lede}</p>
            <aside data-surface="ink" aria-labelledby="expect-title" className="mt-10 p-6 md:p-8">
              <h2 id="expect-title" className="font-serif-italic text-small text-surface-subtle">
                {SALES.expect.title}
              </h2>
              <ul className="mt-6 flex flex-col gap-5">
                {SALES.expect.items.map((item) => (
                  <li key={item.text} className="flex items-start gap-4 text-body">
                    <Icon name={item.icon} className="mt-0.5 size-5 shrink-0 text-verdigris" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
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
