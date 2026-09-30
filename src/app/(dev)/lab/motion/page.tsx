import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CropMarks } from '@/components/art/CropMarks'
import { EvidenceSeal } from '@/components/art/EvidenceSeal'
import { Guilloche } from '@/components/art/Guilloche'
import { MembraneCanvas } from '@/components/art/MembraneCanvas'
import { Painting } from '@/components/art/Painting'
import { Plate } from '@/components/art/Plate'
import { RegistrationMark } from '@/components/art/RegistrationMark'
import { SpectralStrip } from '@/components/art/SpectralStrip'
import { InstrumentStack, InstrumentWindow } from '@/components/instrument/InstrumentWindow'
import { Section } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { ScrubText } from '@/components/motion/ScrubText'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { StatusChip } from '@/components/ui/Chip'
import { Eyebrow, Heading } from '@/components/ui/Heading'
import { HEX } from '@/lib/gl/colors'
import { LabStatus } from './LabStatus'
import { PinDemo } from './PinDemo'

// Development-only motion and art lab (PAGES §0.9). Demo strings are fixtures, not site copy.
export const metadata: Metadata = { title: 'Motion lab', robots: { index: false, follow: false } }

const SEEDS = [1.37, 4.2, 9.1] as const
const PLATES = [
  {
    paintingId: 'plate-field',
    date: '2026-09-16',
    title: 'Towards field-based intelligence',
    meta: 'Research perspective',
  },
  {
    paintingId: 'plate-wording',
    date: '2026-09-22',
    title: 'Different wording. Different meaning.',
    meta: 'Engineering notes',
  },
  {
    paintingId: 'plate-evidence',
    date: '2026-09-22',
    title: 'When the field cannot establish an answer',
    meta: 'Research practice',
  },
] as const
const INQUIRY = [
  {
    paintingId: 'inquiry-representation',
    date: '2026-09-16',
    title: 'Can knowledge become a field?',
    meta: 'Representation',
  },
  {
    paintingId: 'inquiry-dynamics',
    date: '2026-09-16',
    title: 'What makes a field reason?',
    meta: 'Dynamics',
  },
  {
    paintingId: 'inquiry-causality',
    date: '2026-09-16',
    title: 'What can a system know, and when?',
    meta: 'Causality',
  },
] as const

// Real strips come from the paintings manifest (P5); this sample reuses the brand hexes.
const SAMPLE_PALETTE = [
  { hex: HEX.cadmium, weight: 0.3 },
  { hex: HEX.ultramarine, weight: 0.25 },
  { hex: HEX.cherenkov, weight: 0.2 },
  { hex: HEX.ultramarineDeep, weight: 0.15 },
  { hex: HEX.vermilion, weight: 0.1 },
]

export default function MotionLab() {
  if (process.env.NODE_ENV === 'production') notFound()
  return (
    <main id="main" tabIndex={-1}>
      <LabStatus>
        <Section surface="paper" rhythm="compact">
          <Eyebrow>Lab · motion and art</Eyebrow>
          <Heading level={1} size="display-l" className="mt-4">
            Motion lab
          </Heading>
        </Section>

        <Section surface="ultramarine" rhythm="compact" labelledBy="lab-membrane">
          <Heading level={2} size="display-s" id="lab-membrane">
            Membrane at three seeds
          </Heading>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {SEEDS.map((seed) => (
              <figure key={seed}>
                <div className="relative aspect-video">
                  <MembraneCanvas seed={seed} />
                </div>
                <figcaption className="mt-2 font-mono text-label uppercase">Seed {seed}</figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section surface="paper" labelledBy="lab-reveals">
          <SplitReveal>
            <Heading level={2} size="display-m" id="lab-reveals">
              Split reveal: lines rise out of their masks, one after another.
            </Heading>
          </SplitReveal>
          <Reveal className="mt-8 max-w-[60ch]">
            <p className="text-lede">
              Reveal: a single block rises 16 px and fades in, once, at 85 % of the viewport.
            </p>
          </Reveal>
          <Reveal stagger={0.08} className="mt-10 grid gap-6 md:grid-cols-3">
            {['One', 'Two', 'Three'].map((n) => (
              <div key={n} className="border border-surface-rule bg-surface-raise p-8">
                <p className="text-title">Card {n}</p>
                <p className="mt-2 text-small text-surface-muted">Staggered by 80 ms.</p>
              </div>
            ))}
          </Reveal>
        </Section>

        <Section surface="paper" labelledBy="lab-scrub">
          <Eyebrow>
            <span id="lab-scrub">Scrub text</span>
          </Eyebrow>
          <ScrubText
            className="mt-6 max-w-[24ch] font-serif text-display-m"
            lead="The decisions that matter most already have a rulebook."
            rest="Moth answers from the world you define — and says when that world cannot support an answer."
          />
          <div className="mt-8 flex flex-wrap gap-2">
            <StatusChip outcome="supported" />
            <StatusChip outcome="unproven" />
            <StatusChip outcome="conflict" />
            <StatusChip outcome="refused" />
            <StatusChip outcome="limit" />
          </div>
        </Section>

        <PinDemo />

        <Section surface="paper-2" labelledBy="lab-plates">
          <Heading level={2} size="display-s" id="lab-plates">
            Plates
          </Heading>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PLATES.map((p, i) => (
              <Plate
                key={p.paintingId}
                {...p}
                number={i + 1}
                href="/lab/motion"
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
              />
            ))}
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {INQUIRY.map((p, i) => (
              <Plate key={p.paintingId} {...p} number={i + 4} sizes="(min-width: 640px) 30vw, 100vw" />
            ))}
          </div>
          <figure className="mt-10">
            <Painting id="research-hero" sizes="100vw" />
            <figcaption className="mt-2 font-mono text-label uppercase">research-hero · 21:9</figcaption>
          </figure>
          <figure className="mt-10">
            <div className="relative aspect-video">
              <Painting id="membrane-poster" decorative fit="cover" sizes="100vw" />
            </div>
            <figcaption className="mt-2 font-mono text-label uppercase">
              membrane-poster · fallback
            </figcaption>
          </figure>
        </Section>

        <Section surface="paper-2" labelledBy="lab-art">
          <Heading level={2} size="display-s" id="lab-art">
            Art primitives
          </Heading>
          <div aria-hidden="true" className="relative mt-8 h-60 text-surface-subtle opacity-40">
            <Guilloche kind="band" seed={3} className="absolute inset-0 size-full" />
          </div>
          <div className="mt-10 grid items-start gap-12 md:grid-cols-3">
            <div className="flex flex-col items-start gap-4">
              <p className="font-mono text-label uppercase">Evidence seal</p>
              <EvidenceSeal />
            </div>
            <div className="flex flex-col items-start gap-6">
              <p className="font-mono text-label uppercase">Crop marks · registration · spectral strip</p>
              <CropMarks className="w-full">
                <div className="dot-screen aspect-[16/10] w-full border border-surface-rule" />
              </CropMarks>
              <RegistrationMark />
              <SpectralStrip palette={SAMPLE_PALETTE} />
            </div>
            <div className="flex flex-col items-start gap-4">
              <p className="font-mono text-label uppercase">Rosette · border</p>
              <Guilloche kind="rosette" seed={11} className="w-40 text-surface-subtle" />
              <Guilloche kind="border" seed={2} className="w-full text-surface-subtle" />
            </div>
          </div>
        </Section>

        <Section surface="ink" labelledBy="lab-windows">
          <Heading level={2} size="display-s" id="lab-windows">
            Instrument windows
          </Heading>
          <InstrumentStack className="mt-10 max-w-2xl">
            <InstrumentWindow title="purchasing.field" tag="Preview 004">
              <p>An approved supplier is a supplier who passed inspection.</p>
              <p className="mt-3">atlas passed inspection.</p>
            </InstrumentWindow>
            <InstrumentWindow title="evidence.trace" footer>
              <p>orderone → purchase-ready</p>
              <p>replay build f3a9 · same runtime</p>
            </InstrumentWindow>
          </InstrumentStack>
        </Section>
      </LabStatus>
    </main>
  )
}
