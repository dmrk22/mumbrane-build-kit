// Contact and sales form rules (SECURITY §6). The same schema gives inline feedback in the browser
// and is the authority in the server action. Nothing here stores, logs or sends anything.
// `zod/mini`: the same package and rules as the classic API, but tree-shakable — the classic build
// alone put /contact 66 KB over its 190 KB first-load budget.
import * as z from 'zod/mini'
import { INTERESTS } from './security/params.ts'

// These schemas run in the browser too. Zod's JIT probes `new Function` once, and the strict CSP
// reports that probe as a script-src violation even though Zod catches it: parse without the JIT.
z.config({ jitless: true })

const text = (min: number, max: number) => z.string().check(z.trim(), z.minLength(min), z.maxLength(max))
const email = () => z.email().check(z.maxLength(254))

export const ContactSchema = z.object({
  name: text(1, 120),
  email: email(),
  organization: z.optional(text(0, 160)),
  interest: z.enum(INTERESTS),
  message: text(20, 4000),
})
export type ContactInput = z.infer<typeof ContactSchema>

// Data minimisation: no phone numbers, no budget fields.
export const SalesSchema = z.object({
  name: text(1, 120),
  email: email(),
  company: text(1, 160),
  role: z.optional(text(0, 120)),
  size: z.enum(['1-50', '51-500', '501-5000', '5000+']),
  area: z.enum(['business', 'customer-support', 'legal', 'security', 'other']),
  timeframe: z.enum(['exploring', 'this-quarter', 'this-year']),
  message: text(20, 4000),
})
export type SalesInput = z.infer<typeof SalesSchema>

export const SCHEMAS = { contact: ContactSchema, sales: SalesSchema } as const
export type FormKind = keyof typeof SCHEMAS

export type FieldError = 'missing' | 'invalid' | 'short' | 'long'
export type Values = Record<string, string>
export type FormState =
  | { status: 'idle' }
  | { status: 'invalid'; errors: Record<string, FieldError>; values: Values }
  | { status: 'preview'; values: Values; mailto: string }

/** Only the schema's own fields, as strings — unknown keys and files are dropped, never echoed. */
export function readValues(kind: FormKind, data: FormData): Values {
  const values: Values = {}
  for (const key of Object.keys(SCHEMAS[kind].shape)) {
    const v = data.get(key)
    if (typeof v === 'string') values[key] = v.slice(0, 8000)
  }
  return values
}

/** Validates and names one failure per field, in schema order. */
export function check(
  kind: FormKind,
  values: Values,
): { ok: true; data: Values } | { ok: false; errors: Record<string, FieldError> } {
  const result = SCHEMAS[kind].safeParse(values)
  if (result.success) {
    const data: Values = {}
    for (const [k, v] of Object.entries(result.data)) if (typeof v === 'string') data[k] = v
    return { ok: true, data }
  }
  const errors: Record<string, FieldError> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0]
    if (typeof key !== 'string' || key in errors) continue
    const blank = (values[key] ?? '').trim() === ''
    errors[key] = blank
      ? 'missing'
      : issue.code === 'too_small'
        ? 'short'
        : issue.code === 'too_big'
          ? 'long'
          : 'invalid'
  }
  // Keep the schema's field order so "first invalid field" matches the visual order.
  const order = Object.keys(SCHEMAS[kind].shape)
  return {
    ok: false,
    errors: Object.fromEntries(order.filter((k) => k in errors).map((k) => [k, errors[k] as FieldError])),
  }
}

export const MAILTO_MAX = 1800

/**
 * A `mailto:` link whose total length stays ≤ 1,800 characters (SECURITY §6): subject and body are
 * percent-encoded; a long body is cut at a code point boundary and ends with "…".
 */
export function mailtoHref(to: string, subject: string, body: string): string {
  const head = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=`
  const budget = MAILTO_MAX - head.length
  const full = encodeURIComponent(body)
  if (full.length <= budget) return head + full
  const chars = Array.from(body)
  let n = chars.length
  let encoded = full
  while (n > 0 && encoded.length > budget) {
    // Shrink in proportion to the overshoot; at least one code point per pass.
    n = Math.min(n - 1, Math.floor((n * budget) / encoded.length))
    encoded = encodeURIComponent(`${chars.slice(0, Math.max(n, 0)).join('')}…`)
  }
  return head + (encoded.length <= budget ? encoded : '')
}
