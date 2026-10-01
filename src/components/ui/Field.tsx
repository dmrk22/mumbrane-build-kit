import type { ComponentProps, ReactNode } from 'react'
import { ui } from '@/content/ui'
import { cx } from '@/lib/cx'
import { Icon } from './Icon'

// DESIGN §9.5: label above, hint below, error below the hint; inputs 48 px, 10 px radius, text-3
// border (≥ 3:1 non-text contrast), paper ground, clay-fg when invalid.
type Meta = { id: string; label: ReactNode; hint?: ReactNode; error?: ReactNode | undefined }

const CONTROL =
  'w-full rounded-md border bg-paper px-3.5 font-sans text-body text-text transition-[color,background-color,border-color] duration-(--duration-micro) ease-out placeholder:text-text-3 disabled:cursor-not-allowed disabled:bg-paper-2 disabled:text-text-3'

function describedBy({ id, hint, error }: Meta): string | undefined {
  const ids = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
}

function border(error: ReactNode | undefined) {
  return error ? 'border-clay-fg' : 'border-text-3'
}

function FieldShell({ id, label, hint, error, children }: Meta & { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-small font-medium text-surface-fg">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-caption text-surface-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-caption text-clay-fg">
          <Icon name="warning" className="mt-px size-4" />
          <span>
            <span className="sr-only">{ui.errorPrefix} </span>
            {error}
          </span>
        </p>
      )}
    </div>
  )
}

type InputRest = Omit<ComponentProps<'input'>, 'id' | 'className' | 'aria-describedby' | 'aria-invalid'>

export function Field({ id, label, hint, error, ...rest }: Meta & InputRest) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        aria-describedby={describedBy({ id, label, hint, error })}
        aria-invalid={error ? true : undefined}
        className={cx(CONTROL, 'h-12', border(error))}
        {...rest}
      />
    </FieldShell>
  )
}

type AreaRest = Omit<ComponentProps<'textarea'>, 'id' | 'className' | 'aria-describedby' | 'aria-invalid'>

export function TextArea({ id, label, hint, error, rows = 5, ...rest }: Meta & AreaRest) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        rows={rows}
        aria-describedby={describedBy({ id, label, hint, error })}
        aria-invalid={error ? true : undefined}
        className={cx(CONTROL, 'min-h-32 resize-y py-3', border(error))}
        {...rest}
      />
    </FieldShell>
  )
}

type SelectRest = Omit<ComponentProps<'select'>, 'id' | 'className' | 'aria-describedby' | 'aria-invalid'>

export function Select({ id, label, hint, error, children, ...rest }: Meta & SelectRest) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <select
          id={id}
          aria-describedby={describedBy({ id, label, hint, error })}
          aria-invalid={error ? true : undefined}
          className={cx(CONTROL, 'h-12 appearance-none pr-11', border(error))}
          {...rest}
        >
          {children}
        </select>
        <Icon
          name="chevron-down"
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-text-2"
        />
      </div>
    </FieldShell>
  )
}

type CheckRest = Omit<
  ComponentProps<'input'>,
  'id' | 'className' | 'type' | 'aria-describedby' | 'aria-invalid'
>

/** 20 px square box with a check icon; the native input stays in place for keyboard and forms. */
export function Checkbox({ id, label, hint, error, ...rest }: Meta & CheckRest) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
          <input
            id={id}
            type="checkbox"
            aria-describedby={describedBy({ id, label, hint, error })}
            aria-invalid={error ? true : undefined}
            className={cx(
              'peer size-5 cursor-pointer appearance-none rounded-md border bg-paper transition-[color,background-color,border-color] duration-(--duration-micro) ease-out checked:border-ink checked:bg-ink disabled:cursor-not-allowed disabled:opacity-50',
              border(error),
            )}
            {...rest}
          />
          <Icon
            name="check"
            className="pointer-events-none absolute size-3.5 text-on-dark opacity-0 peer-checked:opacity-100"
          />
        </span>
        <label htmlFor={id} className="text-small text-surface-fg">
          {label}
        </label>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="pl-8 text-caption text-surface-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-1.5 pl-8 text-caption text-clay-fg">
          <Icon name="warning" className="mt-px size-4" />
          <span>
            <span className="sr-only">{ui.errorPrefix} </span>
            {error}
          </span>
        </p>
      )}
    </div>
  )
}
