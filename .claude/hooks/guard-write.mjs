#!/usr/bin/env node
// PostToolUse guard for Write|Edit|MultiEdit (v2, red-team hardened). The edit already happened;
// exit code 2 sends the findings back to Claude so it fixes them immediately. Mirrors the rules in
// scripts/guard.ts (the authoritative whole-repo check run by `pnpm guard` and `pnpm verify`).
import { readFileSync } from 'node:fs'
import { relative } from 'node:path'

let input = {}
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}')
} catch {
  process.exit(0)
}
const ti = input?.tool_input ?? {}
const file = String(ti.file_path ?? ti.notebook_path ?? '')
const parts = [ti.content, ti.new_string, ti.new_source]
if (Array.isArray(ti.edits)) for (const e of ti.edits) parts.push(e?.new_string)
const text = parts.filter((p) => typeof p === 'string').join('\n')
if (!file || !text) process.exit(0)

const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd()
const rel = relative(projectDir, file).replaceAll('\\', '/')
const inCode = /^(src|scripts|tests)\//.test(rel) && /\.(tsx?|mjs|cjs|js|css|html)$/.test(rel)
const inComponents = /^src\/(app|components)\//.test(rel) && /\.tsx$/.test(rel)
const inSrcTsx = /^src\/.*\.tsx$/.test(rel)
if (!inCode && !/^(public\/|next\.config|playwright\.config|postcss\.config)/.test(rel)) process.exit(0)

const findings = []
const add = (msg) => findings.push(`- ${msg}`)
const lines = text.split('\n')
// Tests hold hostile fixtures and scripts/guard.ts holds the rules themselves: they get only the
// credential, import-allowlist and protected-path checks.
const relaxed = /^tests\//.test(rel) || rel === 'scripts/guard.ts'

if (!relaxed) {
// Rendering sinks and code execution
if (/dangerouslySetInnerHTML/.test(text) && rel !== 'src/lib/security/json-ld.tsx') add('dangerouslySetInnerHTML is banned (only src/lib/security/json-ld.tsx may use it).')
if (/\.(innerHTML|outerHTML)\s*[+]?=|insertAdjacentHTML\s*\(|document\.write(ln)?\s*\(|createContextualFragment\s*\(|DOMParser\b|\bsrcdoc\b/.test(text)) {
  add('Raw HTML sinks (innerHTML/outerHTML/insertAdjacentHTML/document.write/DOMParser/srcdoc) are banned.')
}
if (/(^|[^\w.$])eval\s*\(|new\s+Function\s*\(|(^|[^\w.$])Function\s*\(/.test(text)) add('eval / Function() are banned.')
if (/set(Timeout|Interval)\s*\(\s*['"`]/.test(text)) add('String-based timers are banned.')
if (/setAttribute\(\s*['"`](style|on\w+|srcdoc)['"`]/i.test(text)) add('setAttribute("style"|"on…"|"srcdoc") is banned (CSP/XSS). Use CSSOM or addEventListener.')
if (/['"`]\s*javascript:/i.test(text)) add('javascript: URLs are banned.')
if (/<(iframe|embed|object|frame|portal)\b/i.test(text)) add('Embeds (iframe/embed/object) are banned: no third-party content.')

} // end !relaxed (rendering)

// Secrets
if (/NEXT_PUBLIC_[A-Z0-9_]*(SECRET|TOKEN|PASSWORD|PRIVATE|API_KEY|DATABASE)/.test(text)) add('Secrets must never use a NEXT_PUBLIC_ variable.')
if (/(sk_(live|test)_[0-9a-zA-Z]{8,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|postgres(ql)?:\/\/[^\s'"]+:[^\s'"@]+@|ghp_[0-9A-Za-z]{20,}|xox[bap]-[0-9A-Za-z-]{10,})/.test(text)) {
  add('Looks like a credential. Remove it; secrets live only in untracked env files the owner manages.')
}
for (const line of lines) {
  if (/localStorage|sessionStorage|indexedDB|document\.cookie/.test(line) && /(token|secret|password|passwd|e-?mail|api_?key|credential|session_?id)/i.test(line)) {
    add('Never persist credentials or personal data in web storage or cookies (only UI preferences such as the console theme).')
    break
  }
}

if (!relaxed) {
// Third parties and network
if (/http:\/\/(?!localhost|127\.0\.0\.1|www\.w3\.org\/)/.test(text)) add('Plain http:// URL found; use https:// (xmlns http://www.w3.org is fine).')
if (/<script\b(?![^>]*type=["'{]*application\/ld\+json)[^>]*\ssrc=\{?["'`]?(https?:)?\/\//i.test(text)) add('Third-party scripts are banned.')
if (/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr|unpkg\.com|cdnjs\.|esm\.sh|skypack|googletagmanager|google-analytics|segment\.(io|com)|mixpanel|hotjar|posthog|sentry\.io|plausible|intercom|hubspot/.test(text)) {
  add('Third-party runtime services (CDNs, remote fonts, analytics, trackers) are banned.')
}
if (/\b(fetch|import|axios\.\w+|navigator\.sendBeacon)\s*\(\s*['"`](https?|wss?):\/\/(?!localhost|127\.0\.0\.1)/.test(text) || /new\s+(WebSocket|EventSource|Worker)\s*\(\s*['"`](https?|wss?):\/\//.test(text)) {
  add('Runtime requests to other origins are banned (connect-src is self only).')
}
for (const m of text.matchAll(/target\s*=\s*\{?\s*["'`]_blank["'`]/g)) {
  const i = m.index ?? 0
  const around = text.slice(Math.max(0, i - 400), i + 400)
  if (!/noopener/.test(around)) {
    add('target="_blank" needs rel="noopener noreferrer" (use the <SmartLink> component).')
    break
  }
}
} // end !relaxed (network)
if (/from ['"](three|framer-motion|motion|@react-three\/[\w-]+|jquery|lodash[\w./-]*|axios|moment|clsx|classnames|styled-components|@emotion\/[\w-]+)['"]/.test(text)) add('Import from a package outside the allowlist.')
if (!relaxed) {
if (/from ['"]next\/image['"]/.test(text)) add('next/image renders style="" attributes that the CSP blocks; use the <Painting> component or a plain <img> with width/height.')
if (/from ['"]next\/script['"]/.test(text)) add('next/script is not used in this project (no third-party or inline scripts).')

// CSP-safe styling and design tokens
if (inSrcTsx && /\sstyle=\{/.test(text)) add('The style prop renders a style="" attribute during SSR (also in client components), which the CSP blocks. Use classes, data-* attributes, SVG presentation attributes, or set styles through a ref (CSSOM) after mount.')
if (inComponents) {
  if (/(?<![\w&])#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?\b|rgba?\(|hsla?\(|oklch\(/.test(text)) add('Raw colour literal in a component. Use tokens from brand/palette/tokens.css (e.g. text-ink, bg-ultramarine).')
  if (/\b(text|bg|border|fill|stroke|from|to|via|ring|outline|decoration|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(-\d{2,3})?\b/.test(text)) {
    add('Tailwind default palette classes do not exist in this project; use brand tokens.')
  }
  if (/\btext-\[\d/.test(text)) add('Arbitrary font sizes break the type scale; use text-display-*, text-title, text-body, etc.')
}

} // end !relaxed (styling)

// Protected files may not be written by code either
if (/^(src|scripts|tests)\//.test(rel)) {
  if (!relaxed && /['"`](\.\/)?(\.claude\/(?!allowed-deps\.json)|CLAUDE\.md|plan\/(BUILD_PLAN|DESIGN|PAGES|CONTENT|CONSOLE|SECURITY|QUALITY|AUDIT)\.md)/.test(text)) {
    add('Code must not reference Claude config, CLAUDE.md or plan specs (they are protected and never read or written by the app or scripts).')
  }
  for (const line of lines) {
    const writesInto = /\b(writeFile|appendFile|rm|unlink|rename|truncate|createWriteStream|mkdir|cp|symlink|link|chmod|utimes)(Sync)?\s*\(\s*['"`](\.\/)?(brand\/logo|reference|\.claude|CLAUDE\.md|plan)\b/.test(line)
    const copiesInto = /\b(copyFile|cp|rename|symlink|link)(Sync)?\s*\([^,]+,\s*['"`](\.\/)?(brand\/logo|reference|\.claude)\//.test(line)
    if (writesInto || copiesInto) {
      add('Code must not modify protected files (brand/logo/, reference/, .claude/, CLAUDE.md, plan/): read or copy *from* them only.')
      break
    }
  }
}

if (findings.length) {
  process.stderr.write(`[guard-write] ${rel}\n${[...new Set(findings)].join('\n')}\nFix these now (see CLAUDE.md non-negotiables and plan/SECURITY.md).\n`)
  process.exit(2)
}
process.exit(0)
