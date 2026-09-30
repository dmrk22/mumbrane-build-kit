// Zod schemas for content validation in unit tests (PAGES §0.4) — not used at runtime.
import { z } from 'zod'
import { PAINTINGS } from './paintings.ts'

const paintingIds = PAINTINGS.map((p) => p.id) as [string, ...string[]]
const text = z.string().min(1).max(4000)
const iso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const BlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('p'), text }),
  z.object({ type: z.literal('h2'), text, id: z.string().regex(/^[a-z0-9-]+$/) }),
  z.object({ type: z.literal('h3'), text, id: z.string().regex(/^[a-z0-9-]+$/) }),
  z.object({ type: z.literal('list'), ordered: z.boolean(), items: z.array(text).min(1) }),
  z.object({ type: z.literal('quote'), text }),
  z.object({
    type: z.literal('code'),
    lang: z.string().min(1),
    text,
    label: z.string().optional(),
    illustrative: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('table'),
    caption: text,
    columns: z.array(z.string().min(1)).min(2),
    rows: z.array(z.array(z.string())).min(1),
    source: z.string().optional(),
  }),
  z.object({
    type: z.literal('figure'),
    painting: z.enum(paintingIds),
    caption: text,
    fig: z.number().int().min(0),
  }),
  z.object({ type: z.literal('note'), tone: z.enum(['info', 'caveat', 'proposed']), text }),
  z.object({
    type: z.literal('callout'),
    title: text,
    text,
    link: z.object({ label: z.string().min(1), href: z.string().min(1) }).optional(),
  }),
])

export const ArticleSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  section: z.enum(['research', 'news']),
  category: z.string().min(1),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(160),
  published: iso,
  updated: iso.optional(),
  authors: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string().min(1)),
  plate: z.enum(paintingIds),
  plateNumber: z.number().int().min(1),
})
