import type { Route } from 'next'
import Link from 'next/link'
import type { ComponentProps, MouseEventHandler, ReactNode } from 'react'
import { ui } from '@/content/ui'
import { toSafeHref } from '@/lib/security/links'

// next/link types its own handlers without `| undefined`, so onClick is redeclared to match.
type AnchorRest = Omit<
  ComponentProps<'a'>,
  'href' | 'children' | 'className' | 'rel' | 'target' | 'onClick' | 'onMouseEnter' | 'onTouchStart'
> & { onClick?: MouseEventHandler<HTMLAnchorElement> }

/**
 * Every link goes through the link policy (SECURITY §2.5, §4.4): internal and fragment links use
 * next/link; external links are allowlisted, `noopener noreferrer` and marked ↗; anything the
 * policy rejects renders as plain text. `prefetch={false}` is for links that sit in hidden panels
 * (menus, the mobile sheet): every page here is dynamic, so a prefetch is a server render.
 */
export function SmartLink({
  href,
  className,
  children,
  prefetch,
  ...rest
}: { href: string; className?: string; children: ReactNode; prefetch?: false } & AnchorRest) {
  const safe = toSafeHref(href)
  if (!safe) {
    if (process.env.NODE_ENV !== 'production') console.error(`SmartLink rejected href: ${href}`)
    return <span className={className}>{children}</span>
  }
  switch (safe.kind) {
    case 'internal':
    case 'fragment':
      return (
        // Internal paths are checked against the route registry by links.test.ts, not by the type.
        <Link
          href={safe.href as Route}
          className={className}
          {...(prefetch === false ? { prefetch } : {})}
          {...rest}
        >
          {children}
        </Link>
      )
    case 'external':
      return (
        <a href={safe.href} rel="noopener noreferrer" className={className} {...rest}>
          {children}
          <span aria-hidden="true"> ↗</span>
          <span className="sr-only"> {ui.externalSuffix}</span>
        </a>
      )
    case 'mailto':
      return (
        <a href={safe.href} className={className} {...rest}>
          {children}
        </a>
      )
  }
}
