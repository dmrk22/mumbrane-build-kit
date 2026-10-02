import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/chrome/Header'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { Chip, StatusChip } from '@/components/ui/Chip'
import { Divider } from '@/components/ui/Divider'
import { Checkbox, Field, Select, TextArea } from '@/components/ui/Field'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { ICON_NAMES, Icon } from '@/components/ui/Icon'
import { Kbd } from '@/components/ui/Kbd'
import { Numeral } from '@/components/ui/Numeral'
import { Prose } from '@/components/ui/Prose'
import { SmartLink } from '@/components/ui/SmartLink'
import { SURFACE_TOP } from '@/content/chrome'
import { HEADER } from '@/content/nav'
import { OUTCOMES, type Outcome } from '@/content/outcomes'
import { SURFACES, type Surface } from '@/lib/surface'

// Development-only component lab (PAGES §0.9). Its demo strings are fixtures, not site copy.
export const metadata: Metadata = { title: 'Lab', robots: { index: false, follow: false } }

const OUTCOME_IDS = Object.keys(OUTCOMES) as Outcome[]

function Kit({ surface }: { surface: Surface }) {
  const id = `lab-${surface}`
  return (
    <Section surface={surface} labelledBy={id} rhythm="compact">
      <Eyebrow dot>Surface · {surface}</Eyebrow>
      <Heading level={2} size="display-m" id={id} className="mt-4">
        Intelligence for <em>closed worlds.</em>
      </Heading>
      <p className="mt-6 max-w-text text-lede text-surface-muted">
        Moth answers from the world you define — and says when that world cannot support an answer.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button href="/lab" arrow>
          Explore Moth
        </Button>
        <Button href="/lab" variant="secondary">
          Read the research
        </Button>
        <Button variant="ink">Ink</Button>
        <Button loading>Sending</Button>
        <Button disabled>Disabled</Button>
        <Button href="/lab" variant="text" arrow>
          All research
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button href="/lab" size="lg" arrow>
          Try the console
        </Button>
        <Button href="/lab" size="lg" variant="secondary">
          Contact sales
        </Button>
        <Button href="/lab" size="lg" variant="text" arrow>
          Release &amp; evidence
        </Button>
      </div>

      <Divider ticks className="mt-10" />

      <Grid className="mt-10 gap-y-10">
        <div className="col-span-12 flex flex-col gap-4 md:col-span-6">
          <Eyebrow>Chips</Eyebrow>
          <div className="flex flex-wrap gap-2">
            {OUTCOME_IDS.map((o) => (
              <StatusChip key={o} outcome={o} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip>Static tag</Chip>
            <Chip pressed={false}>Filter off</Chip>
            <Chip pressed>Filter on</Chip>
          </div>
          <Eyebrow>Links</Eyebrow>
          <p className="text-body">
            Internal{' '}
            <SmartLink href="/lab" className="link-prose">
              lab link
            </SmartLink>
            , external{' '}
            <SmartLink href="https://github.com/mumbrane" className="link-prose">
              GitHub
            </SmartLink>
            , mail{' '}
            <SmartLink href="mailto:hello@mumbrane.com" className="link-prose">
              hello@mumbrane.com
            </SmartLink>
            .
          </p>
          <Eyebrow>Keys and numbers</Eyebrow>
          <p className="flex flex-wrap items-center gap-2 text-small">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd> to search&nbsp;·{' '}
            <Numeral className="font-mono text-code">2,115 tests · 0.781&nbsp;s · 2026·09·22</Numeral>
          </p>
        </div>
        <div className="col-span-12 flex flex-col gap-4 md:col-span-6">
          <Eyebrow>Icons</Eyebrow>
          <ul className="grid grid-cols-6 gap-3 sm:grid-cols-8">
            {ICON_NAMES.map((name) => (
              <li key={name} className="flex flex-col items-center gap-1 border border-surface-rule py-3">
                <Icon name={name} />
                <span className="sr-only">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </Grid>
    </Section>
  )
}

export default function LabPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return (
    <>
      {/* The real header, so its theming can be checked over every surface below. */}
      <Header nav={HEADER} surfaceTop={SURFACE_TOP} />
      <main id="main" tabIndex={-1}>
        <Section surface="paper" rhythm="compact">
          <Eyebrow>Lab · development only</Eyebrow>
          <Heading level={1} size="display-l" className="mt-4">
            Component lab
          </Heading>
          <div className="mt-10 flex flex-col gap-3">
            <Heading level={2} size="display-l">
              Display XL
            </Heading>
            <Heading level={2} size="display-l">
              Display L
            </Heading>
            <Heading level={2} size="display-m">
              Display M
            </Heading>
            <Heading level={2} size="display-s">
              Display S — plate titles
            </Heading>
            <Heading level={2} size="title">
              Title — card titles
            </Heading>
            <p className="text-lede">Lede — intro paragraphs, 18 → 21 px.</p>
            <p className="text-body">Body — default text, 17 px, line height 1.6.</p>
            <p className="text-small">Small — secondary text, footer links.</p>
            <p className="text-caption text-surface-muted">Caption — figure captions and form hints.</p>
            <p className="font-mono text-code">code — instrument content 13.5 px</p>
          </div>
        </Section>

        {SURFACES.map((s) => (
          <Kit key={s} surface={s} />
        ))}

        <Section surface="paper" labelledBy="lab-forms" rhythm="compact">
          <Heading level={2} size="display-s" id="lab-forms">
            Forms
          </Heading>
          <form className="mt-8 grid max-w-180 gap-6 md:grid-cols-2">
            <Field id="lab-name" label="Name" autoComplete="name" />
            <Field id="lab-email" label="Work email" type="email" hint="We reply from @mumbrane.com." />
            <Field id="lab-org" label="Organization" defaultValue="x" error="Enter at least 2 characters." />
            <Field id="lab-disabled" label="Disabled" disabled defaultValue="Not editable" />
            <Select id="lab-interest" label="Interest" defaultValue="evaluation">
              <option value="evaluation">An evaluation</option>
              <option value="research">A research collaboration</option>
            </Select>
            <Select id="lab-interest-bad" label="Interest (invalid)" error="Choose an option.">
              <option value="">Choose…</option>
            </Select>
            <div className="md:col-span-2">
              <TextArea id="lab-message" label="Message" hint="Up to 2,000 characters." />
            </div>
            <div className="flex flex-col gap-4 md:col-span-2">
              <Checkbox id="lab-consent" label="I have read the privacy notice." />
              <Checkbox id="lab-checked" label="Checked" defaultChecked />
              <Checkbox id="lab-invalid" label="Invalid" error="This box is required." />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" arrow>
                Send message
              </Button>
            </div>
          </form>
        </Section>

        <Section surface="paper-2" labelledBy="lab-prose" rhythm="compact">
          <Heading level={2} size="display-s" id="lab-prose">
            Prose
          </Heading>
          <Prose className="mt-8">
            <p>
              A definition can build on another definition. An interpretation skill can make a new sentence
              form usable — see <SmartLink href="#lab-prose">the section anchor</SmartLink>. In 2026 we ran
              2,115 tests; the <code>orderone</code> case is <em>supported</em>.
            </p>
            <h2>When the field cannot establish an answer</h2>
            <p>Missing support, conflicting information, and incomplete execution mean different things.</p>
            <ul>
              <li>Missing support is not the same as a no.</li>
              <li>Conflicts point to facts that need resolving.</li>
            </ul>
            <blockquote>“Evidence, retained.”</blockquote>
            <h3>Replay</h3>
            <ol>
              <li>Retain the evidence.</li>
              <li>Replay an earlier episode against its original build.</li>
            </ol>
          </Prose>
        </Section>
      </main>
    </>
  )
}
