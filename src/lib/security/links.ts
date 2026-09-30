// Link policy (SECURITY §2.5). Used by <SmartLink> and src/lib/inline.ts.

export const EXTERNAL_HOSTS: ReadonlySet<string> = new Set([
  'x.com',
  'www.instagram.com',
  'www.linkedin.com',
  'github.com',
])
export const MAIL_DOMAINS: ReadonlySet<string> = new Set(['mumbrane.com'])

export type SafeHref =
  | { kind: 'internal'; href: `/${string}` }
  | { kind: 'fragment'; href: `#${string}` }
  | { kind: 'external'; href: string; host: string }
  | { kind: 'mailto'; href: string }

// Control characters, space, DEL and backslash never appear in a link we author. (Checked by
// code point rather than a RegExp: Biome rejects control characters in regex literals.)
function hasForbiddenChar(value: string): boolean {
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0
    if (code <= 0x20 || code === 0x7f || ch === '\\') return true
  }
  return false
}

export function toSafeHref(input: string): SafeHref | null {
  const href = input.trim()
  if (href.length === 0 || href.length > 2048 || hasForbiddenChar(href)) return null
  if (href.startsWith('#')) {
    return /^#[A-Za-z][\w-]*$/.test(href) ? { kind: 'fragment', href: href as `#${string}` } : null
  }
  if (href.startsWith('/')) {
    return href.startsWith('//') ? null : { kind: 'internal', href: href as `/${string}` }
  }
  try {
    const url = new URL(href)
    if (url.protocol === 'mailto:') {
      const address = decodeURIComponent(url.pathname).toLowerCase()
      const at = address.lastIndexOf('@')
      if (at < 1 || !MAIL_DOMAINS.has(address.slice(at + 1))) return null
      return { kind: 'mailto', href: `mailto:${address}${url.search}` }
    }
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null
    if (!EXTERNAL_HOSTS.has(url.hostname)) return null
    return { kind: 'external', href: url.href, host: url.hostname }
  } catch {
    return null
  }
}
