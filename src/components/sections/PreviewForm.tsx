'use client'

import {
  type FocusEvent,
  type FormEvent,
  type ReactNode,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Select, TextArea } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { type FieldSpec, FORM_UI } from '@/content/contact'
import { check, type FieldError, type FormKind, type FormState, readValues, type Values } from '@/lib/forms'

type Action = (prev: FormState, form: FormData) => Promise<FormState>

/**
 * Contact and sales forms (SECURITY §6, DESIGN §9.5). A server action through `useActionState`, so
 * the form works without JavaScript; with it, the same schema checks the fields first and the
 * errors are announced and focused without a round trip. Submissions are not sent anywhere yet:
 * success is a preview state that offers the same message as a prefilled email.
 */
export function PreviewForm({
  kind,
  action,
  title,
  fields,
  submit,
  defaults,
  editHref,
  privacy,
}: {
  kind: FormKind
  action: Action
  title: string
  fields: readonly FieldSpec[]
  submit: string
  defaults: Values
  /** Without JavaScript, "Edit message" reloads the empty form. */
  editHref: string
  privacy: ReactNode
}) {
  const [state, formAction, pending] = useActionState(action, { status: 'idle' })
  const [local, setLocal] = useState<Record<string, FieldError> | null>(null)
  const [editing, setEditing] = useState<FormState | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const previewRef = useRef<HTMLHeadingElement>(null)

  const preview = state.status === 'preview' && editing !== state ? state : null
  const errors = local ?? (state.status === 'invalid' ? state.errors : {})
  const values = state.status === 'idle' ? defaults : state.values
  const count = Object.keys(errors).length

  // After the server answers: focus the preview heading, or the first field it rejected.
  useEffect(() => {
    if (state.status === 'preview') previewRef.current?.focus()
    if (state.status === 'invalid') focusField(formRef.current, Object.keys(state.errors)[0])
  }, [state])

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const result = check(kind, readValues(kind, new FormData(e.currentTarget)))
    if (result.ok) {
      setLocal(null)
      return
    }
    e.preventDefault()
    setLocal(result.errors)
    focusField(e.currentTarget, Object.keys(result.errors)[0])
  }

  // Inline feedback: once a field has been flagged, leaving it re-checks just that field.
  function onBlur(e: FocusEvent<HTMLElement>) {
    const name = e.currentTarget.getAttribute('name') ?? ''
    if (!(name in errors) || !formRef.current) return
    const result = check(kind, readValues(kind, new FormData(formRef.current)))
    const next = { ...errors }
    const now = result.ok ? undefined : result.errors[name]
    if (now) next[name] = now
    else delete next[name]
    setLocal(next)
  }

  if (preview) {
    return (
      <div data-surface="paper-2" className="border border-surface-rule p-6 md:p-10">
        <Icon name="check" className="size-8 text-ice-fg" />
        <h2 ref={previewRef} tabIndex={-1} className="mt-6 font-display text-display-s outline-none">
          {FORM_UI.preview.title}
        </h2>
        <p className="mt-4 max-w-[52ch] text-body text-surface-muted">{FORM_UI.preview.text}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button href={preview.mailto} arrow>
            {FORM_UI.preview.email}
          </Button>
          <Button
            href={editHref}
            variant="secondary"
            onClick={(e) => {
              e.preventDefault()
              setLocal(null)
              setEditing(state)
            }}
          >
            {FORM_UI.preview.edit}
          </Button>
        </div>
      </div>
    )
  }

  const firstInvalid = Object.keys(errors)[0]
  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      aria-labelledby={`${kind}-form-title`}
      className="relative"
    >
      <h2 id={`${kind}-form-title`} className="font-display text-display-s">
        {title}
      </h2>
      {/* Always rendered (never display:none) so screen readers are listening before it fills. */}
      <p role="status" className="text-small font-medium text-clay-fg not-empty:mt-4">
        {count > 0 ? FORM_UI.summary(count) : ''}
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {fields.map((f) => {
          const id = `${kind}-${f.name}`
          const code = errors[f.name]
          const error = code ? (f.errors[code] ?? f.errors.invalid ?? f.errors.missing) : undefined
          const label = f.optional ? (
            <>
              {f.label} <span className="font-normal text-surface-muted">{FORM_UI.optional}</span>
            </>
          ) : (
            f.label
          )
          const common = {
            id,
            name: f.name,
            label,
            error,
            defaultValue: values[f.name] ?? '',
            'aria-required': f.optional ? undefined : true,
            // Without JavaScript the server's answer is a fresh page: autofocus stands in for the effect.
            autoFocus: state.status === 'invalid' && f.name === firstInvalid,
            onBlur,
            ...(f.hint ? { hint: f.hint } : {}),
            ...(f.autoComplete ? { autoComplete: f.autoComplete } : {}),
          }
          return (
            <div key={f.name} className={f.half ? 'md:col-span-1' : 'md:col-span-2'}>
              {f.kind === 'textarea' ? (
                <TextArea {...common} rows={6} />
              ) : f.kind === 'select' ? (
                <Select {...common}>
                  <option value="">{FORM_UI.choose}</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Field {...common} type={f.kind} />
              )}
            </div>
          )
        })}
      </div>
      {/* Honeypot: off-screen, not display:none, so naive bots fill it (SECURITY §6). */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor={`${kind}-website`}>{FORM_UI.honeypot}</label>
        <input id={`${kind}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <Button type="submit" loading={pending} arrow>
          {submit}
        </Button>
        <p className="max-w-[40ch] text-caption text-surface-muted">{privacy}</p>
      </div>
    </form>
  )
}

function focusField(form: HTMLFormElement | null, name: string | undefined) {
  if (!form || !name) return
  const el = form.elements.namedItem(name)
  if (el instanceof HTMLElement) el.focus()
}
