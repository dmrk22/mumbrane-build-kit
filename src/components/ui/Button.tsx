import type { ComponentProps, MouseEventHandler, ReactNode } from 'react'
import { ui } from '@/content/ui'
import { cx } from '@/lib/cx'
import { Icon } from './Icon'
import { SmartLink } from './SmartLink'

// DESIGN §9.4 + §7.7. Primary inverts the surface (ink on paper, paper on ink/moss).
const VARIANT = {
  primary:
    'rounded-md bg-surface-invert text-surface-on-invert inset-ring inset-ring-transparent hover:inset-ring-surface-on-invert/30',
  secondary: 'rounded-md border border-surface-fg/40 text-surface-fg hover:bg-surface-raise',
  ink: 'rounded-md bg-ink text-on-dark hover:bg-ink-3',
  text: 'text-surface-fg underline decoration-1 underline-offset-[0.22em] hover:decoration-2',
} as const

const SIZE = {
  sm: { pill: 'h-9 px-4 text-small', arrow: 'pr-2', text: 'text-small' },
  md: { pill: 'h-11 px-5 text-small', arrow: 'pr-2.5', text: 'text-small' },
  // anthropic.com sets every button and text link at 15 px (D-145); the heights stay ours.
  lg: { pill: 'h-13 px-6 text-small', arrow: 'pr-3', text: 'text-small' },
} as const

type Common = {
  variant?: keyof typeof VARIANT
  size?: keyof typeof SIZE
  /** Trailing arrow: a 24 px chip on pills, a plain arrow on text links. */
  arrow?: boolean
  className?: string
  children: ReactNode
}

type AsLink = Common & { href: string; newTab?: boolean; onClick?: MouseEventHandler<HTMLAnchorElement> }
type AsButton = Common & { href?: undefined; loading?: boolean } & Omit<
    ComponentProps<'button'>,
    'className' | 'children'
  >

export function Button(props: AsLink | AsButton) {
  const { variant = 'primary', size = 'md', arrow = false, className, children } = props
  const pill = variant !== 'text'
  const classes = cx(
    'group relative inline-flex items-center justify-center gap-3 font-sans font-medium tracking-button whitespace-nowrap',
    'transition-[background-color,color,box-shadow,text-decoration-thickness,scale] duration-(--duration-hover) ease-out',
    'active:scale-[0.98] active:duration-(--duration-micro) disabled:cursor-not-allowed disabled:opacity-50',
    VARIANT[variant],
    pill ? SIZE[size].pill : SIZE[size].text,
    pill && arrow && SIZE[size].arrow,
    className,
  )
  const inner = (
    <>
      <span>{children}</span>
      {arrow && pill && (
        <span
          aria-hidden="true"
          className="grid size-6 place-items-center rounded-md bg-current/12 transition-transform duration-(--duration-hover) ease-out group-hover:translate-x-0.5"
        >
          <Icon name="arrow-right" className="size-3.5" />
        </span>
      )}
      {arrow && !pill && (
        <Icon
          name="arrow-right"
          className="-ml-1 size-4 transition-transform duration-(--duration-hover) ease-out group-hover:translate-x-0.5"
        />
      )}
    </>
  )

  if (props.href !== undefined) {
    return (
      <SmartLink
        href={props.href}
        className={classes}
        {...(props.newTab !== undefined ? { newTab: props.newTab } : {})}
        {...(props.onClick ? { onClick: props.onClick } : {})}
      >
        {inner}
      </SmartLink>
    )
  }

  const {
    variant: _v,
    size: _s,
    arrow: _a,
    className: _c,
    children: _ch,
    href: _h,
    loading = false,
    type = 'button',
    ...rest
  } = props
  return (
    <button type={type} aria-busy={loading || undefined} className={classes} {...rest}>
      {inner}
      {loading && (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-x-5 bottom-2 h-px origin-left animate-progress bg-current"
          />
          <span className="sr-only" role="status">
            {ui.loading}
          </span>
        </>
      )}
    </button>
  )
}
