import type { ReactNode } from 'react'
import { Section } from '@/components/layout/Section'
import { Heading } from '@/components/ui/Heading'
import type { Surface } from '@/lib/surface'

// A page's closing call to action. The actions sit under the text, flush left with it (D-149).
export function CtaBand({
  surface,
  id,
  titleId,
  title,
  text,
  children,
}: {
  surface: Surface
  id?: string
  titleId: string
  title: ReactNode
  text: ReactNode
  children: ReactNode
}) {
  return (
    <Section surface={surface} {...(id ? { id } : {})} labelledBy={titleId} rhythm="band">
      <Heading level={2} size="display-m" id={titleId}>
        {title}
      </Heading>
      <p className="mt-4 max-w-text text-body text-surface-muted">{text}</p>
      <div className="mt-8 flex flex-wrap items-center gap-1.5">{children}</div>
    </Section>
  )
}
