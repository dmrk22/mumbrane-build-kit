import type { ReactNode } from 'react'
import { Section } from '@/components/layout/Section'
import { Heading } from '@/components/ui/Heading'
import type { Surface } from '@/lib/surface'

// A page's closing call to action. The actions sit on the last baseline of the line beside them,
// so their labels read as the end of that sentence instead of floating between its lines (D-146).
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
      <div className="flex flex-wrap items-baseline-last justify-between gap-x-8 gap-y-6">
        <div>
          <Heading level={2} size="display-m" id={titleId}>
            {title}
          </Heading>
          <p className="mt-4 max-w-text text-body text-surface-muted">{text}</p>
        </div>
        {/* An inline row inside a block: the block's line box is the only last baseline WebKit
            hands up to the band; a flex or grid row lands its labels 5.5 px high in Safari. */}
        <div>
          <div className="inline-flex flex-wrap items-baseline gap-1.5">{children}</div>
        </div>
      </div>
    </Section>
  )
}
