'use server'

import { CONTACT, type FieldSpec, FORM_UI, SALES, TOPICS } from '@/content/contact'
import { check, type FormKind, type FormState, mailtoHref, readValues, type Values } from '@/lib/forms'
import type { Interest } from '@/lib/security/params'

// SECURITY §6: POST-only server actions (Next checks Origin), 64 KB body limit (next.config),
// the zod schema is the authority. Nothing is stored, logged, emailed or forwarded.

/** The message as the person would have written it by email: labelled fields, then the text. */
function emailBody(fields: readonly FieldSpec[], data: Values): string {
  const lines = fields
    .filter((f) => f.name !== 'message' && data[f.name])
    .map((f) => {
      const value = data[f.name] ?? ''
      return `${f.label}: ${f.options?.find((o) => o.value === value)?.label ?? value}`
    })
  return `${lines.join('\n')}\n\n${data.message ?? ''}`
}

function subject(kind: FormKind, data: Values): string {
  return kind === 'contact'
    ? CONTACT.form.subject(TOPICS[data.interest as Interest] ?? '')
    : SALES.form.subject(data.company ?? '')
}

async function submit(kind: FormKind, form: FormData): Promise<FormState> {
  // Honeypot: a filled `website` field gets the ordinary success state and nothing else.
  const trap = form.get('website')
  if (typeof trap === 'string' && trap !== '') {
    return { status: 'preview', values: {}, mailto: mailtoHref(FORM_UI.to, '', '') }
  }
  const values = readValues(kind, form)
  const result = check(kind, values)
  if (!result.ok) return { status: 'invalid', errors: result.errors, values }
  // Backend (SECURITY §8): persist via ContactRepository when NEXT_PUBLIC_BACKEND_ENABLED
  const fields = kind === 'contact' ? CONTACT.form.fields : SALES.form.fields
  return {
    status: 'preview',
    values: result.data,
    mailto: mailtoHref(FORM_UI.to, subject(kind, result.data), emailBody(fields, result.data)),
  }
}

export async function sendContact(_prev: FormState, form: FormData): Promise<FormState> {
  return submit('contact', form)
}

export async function sendSales(_prev: FormState, form: FormData): Promise<FormState> {
  return submit('sales', form)
}
