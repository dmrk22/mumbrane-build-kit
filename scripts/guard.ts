// Whole-repo security scan (BUILD_PLAN §P0.scripts-spec). Same rules as the write hook in
// .claude/hooks/guard-write.mjs, applied to every file, plus config, env and import checks.
// Exit 1 with "file:line — rule — fix hint" findings.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { builtinModules } from 'node:module'
import { extname, join } from 'node:path'

export type Finding = { file: string; line: number; rule: string; hint: string }
type Rule = { id: string; re: RegExp; hint: string; applies: (file: string) => boolean }

const TEXT_EXT = new Set([
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.js',
  '.css',
  '.html',
  '.json',
  '.txt',
  '.svg',
  '.md',
])
const CODE_EXT = /\.(tsx?|mjs|cjs|js|css|html)$/
const ROOTS = ['src', 'scripts', 'tests', 'public']
const CONFIGS = ['next.config.ts', 'playwright.config.ts', 'postcss.config.mjs']
const SKIP = [/^src\/content\/source\//]
const DB_CLIENTS =
  /^(pg|postgres|@neondatabase\/.+|@prisma\/client|prisma|drizzle-orm|mysql2?|kysely|knex|sequelize|typeorm|mongodb|mongoose|@supabase\/.+|@vercel\/postgres)$/

// Tests hold hostile fixtures and this file holds the rules: only credential, import and
// protected-path checks apply to them (as in the hook).
const isRelaxed = (f: string) => f.startsWith('tests/') || f === 'scripts/guard.ts'
const strict = (f: string) => !isRelaxed(f)
const any = () => true
const inComponents = (f: string) => /^src\/(app|components)\/.*\.tsx$/.test(f)
const inSrcTsx = (f: string) => /^src\/.*\.tsx$/.test(f)
const inCodeDirs = (f: string) => /^(src|scripts|tests)\//.test(f)
// Kept on separate lines so this file's own source never trips the rule it defines.
const STORES = 'localStorage|sessionStorage|indexedDB|document\\.cookie'
const PERSONAL = 'token|secret|password|passwd|e-?mail|api_?key|credential|session_?id'

export const RULES: readonly Rule[] = [
  {
    id: 'no-dangerously-set-inner-html',
    re: /dangerouslySetInnerHTML/,
    hint: 'Only src/lib/security/json-ld.tsx may use it.',
    applies: (f) => strict(f) && f !== 'src/lib/security/json-ld.tsx',
  },
  {
    id: 'no-html-sinks',
    re: /\.(innerHTML|outerHTML)\s*[+]?=|insertAdjacentHTML\s*\(|document\.write(ln)?\s*\(|createContextualFragment\s*\(|DOMParser\b|\bsrcdoc\b/,
    hint: 'Render React nodes; never raw HTML.',
    applies: strict,
  },
  {
    id: 'no-eval',
    re: /(^|[^\w.$])eval\s*\(|new\s+Function\s*\(|(^|[^\w.$])Function\s*\(/,
    hint: 'eval / Function() are banned.',
    applies: strict,
  },
  {
    id: 'no-string-timers',
    re: /set(Timeout|Interval)\s*\(\s*['"`]/,
    hint: 'Pass a function, never a string.',
    applies: strict,
  },
  {
    id: 'no-unsafe-set-attribute',
    re: /setAttribute\(\s*['"`](style|on\w+|srcdoc)['"`]/i,
    hint: 'Use CSSOM or addEventListener.',
    applies: strict,
  },
  {
    id: 'no-javascript-url',
    re: /['"`]\s*javascript:/i,
    hint: 'javascript: URLs are banned.',
    applies: strict,
  },
  {
    id: 'no-embeds',
    re: /<(iframe|embed|object|frame|portal)\b/i,
    hint: 'No third-party content or embeds.',
    applies: strict,
  },
  {
    id: 'no-public-secrets',
    re: /NEXT_PUBLIC_[A-Z0-9_]*(SECRET|TOKEN|PASSWORD|PRIVATE|API_KEY|DATABASE)/,
    hint: 'Secrets must never use a NEXT_PUBLIC_ variable.',
    applies: any,
  },
  {
    id: 'no-credentials',
    re: /(sk_(live|test)_[0-9a-zA-Z]{8,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|postgres(ql)?:\/\/[^\s'"]+:[^\s'"@]+@|ghp_[0-9A-Za-z]{20,}|xox[bap]-[0-9A-Za-z-]{10,})/,
    hint: 'Remove it; secrets live only in untracked env files the owner manages.',
    applies: any,
  },
  {
    id: 'no-plain-http',
    re: /http:\/\/(?!localhost|127\.0\.0\.1|www\.w3\.org\/)/,
    hint: 'Use https:// (xmlns http://www.w3.org is fine).',
    applies: strict,
  },
  {
    id: 'no-third-party-script',
    re: /<script\b(?![^>]*type=["'{]*application\/ld\+json)[^>]*\ssrc=\{?["'`]?(https?:)?\/\//i,
    hint: 'Third-party scripts are banned.',
    applies: strict,
  },
  {
    id: 'no-third-party-services',
    re: /fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr|unpkg\.com|cdnjs\.|esm\.sh|skypack|googletagmanager|google-analytics|segment\.(io|com)|mixpanel|hotjar|posthog|sentry\.io|plausible|intercom|hubspot/,
    hint: 'No CDNs, remote fonts, analytics or trackers.',
    applies: strict,
  },
  {
    id: 'no-cross-origin-requests',
    re: /\b(fetch|import|axios\.\w+|navigator\.sendBeacon)\s*\(\s*['"`](https?|wss?):\/\/(?!localhost|127\.0\.0\.1)|new\s+(WebSocket|EventSource|Worker)\s*\(\s*['"`](https?|wss?):\/\//,
    hint: 'connect-src is self only.',
    applies: strict,
  },
  {
    id: 'no-next-image',
    re: /from ['"]next\/image['"]/,
    hint: 'Use <Painting> or a plain <img> with width/height.',
    applies: strict,
  },
  {
    id: 'no-next-script',
    re: /from ['"]next\/script['"]/,
    hint: 'next/script is not used.',
    applies: strict,
  },
  {
    id: 'no-style-prop',
    re: /\sstyle=\{/,
    hint: 'style="" is blocked by the CSP; use classes, data-* or CSSOM after mount.',
    applies: (f) => strict(f) && inSrcTsx(f),
  },
  {
    id: 'no-raw-colour',
    re: /(?<![\w&])#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?\b|rgba?\(|hsla?\(|oklch\(/,
    hint: 'Use brand tokens (text-ink, bg-ultramarine, …).',
    applies: (f) => strict(f) && inComponents(f),
  },
  {
    id: 'no-default-palette',
    re: /\b(text|bg|border|fill|stroke|from|to|via|ring|outline|decoration|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(-\d{2,3})?\b/,
    hint: 'Tailwind default palette classes do not exist here; use brand tokens.',
    applies: (f) => strict(f) && inComponents(f),
  },
  {
    id: 'no-arbitrary-font-size',
    re: /\btext-\[\d/,
    hint: 'Use the type scale (text-display-*, text-title, text-body, …).',
    applies: (f) => strict(f) && inComponents(f),
  },
  {
    id: 'no-protected-references',
    re: /['"`](\.\/)?(\.claude\/(?!allowed-deps\.json)|CLAUDE\.md|plan\/(BUILD_PLAN|DESIGN|PAGES|CONTENT|CONSOLE|SECURITY|QUALITY|AUDIT)\.md)/,
    hint: 'App code and scripts never read or write Claude config or plan specs.',
    applies: (f) => strict(f) && inCodeDirs(f),
  },
  {
    id: 'no-protected-writes',
    re: /\b(writeFile|appendFile|rm|unlink|rename|truncate|createWriteStream|mkdir|cp|symlink|link|chmod|utimes)(Sync)?\s*\(\s*['"`](\.\/)?(brand\/logo|reference|\.claude|CLAUDE\.md|plan)\b|\b(copyFile|cp|rename|symlink|link)(Sync)?\s*\([^,]+,\s*['"`](\.\/)?(brand\/logo|reference|\.claude)\//,
    hint: 'Read or copy *from* brand/logo, reference, .claude and plan only.',
    applies: inCodeDirs,
  },
  {
    // A raw LINE/PARAGRAPH SEPARATOR silently breaks regex and string literals; write the escape.
    id: 'no-raw-line-separators',
    re: new RegExp(`${String.fromCharCode(0x2028)}|${String.fromCharCode(0x2029)}`),
    hint: 'Write the escape sequence (backslash-u-2028/2029), never the raw character.',
    applies: any,
  },
  {
    id: 'no-web-storage-secrets',
    re: new RegExp(`(${STORES}).*(${PERSONAL})|(${PERSONAL}).*(${STORES})`, 'i'),
    hint: 'Web storage holds UI preferences only.',
    applies: any,
  },
]

const IMPORT_RE = /(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)['"]([^'"]+)['"]/g

export function packageName(specifier: string): string | null {
  if (/^(\.|\/|@\/|node:|#)/.test(specifier)) return null
  const parts = specifier.split('/')
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : (parts[0] ?? null)
}

export function scanText(file: string, text: string, allowedPackages: ReadonlySet<string>): Finding[] {
  const findings: Finding[] = []
  const lines = text.split(/\r?\n/)
  const rules = RULES.filter((r) => r.applies(file))
  const code = CODE_EXT.test(file) || CONFIGS.includes(file)
  lines.forEach((line, i) => {
    for (const rule of rules)
      if (rule.re.test(line)) findings.push({ file, line: i + 1, rule: rule.id, hint: rule.hint })
    if (!code) return
    for (const m of line.matchAll(IMPORT_RE)) {
      const name = packageName(m[1] ?? '')
      if (name === null) continue
      if (DB_CLIENTS.test(name)) {
        findings.push({
          file,
          line: i + 1,
          rule: 'no-db-client',
          hint: `${name}: the backend is not wired in this build.`,
        })
      } else if (!allowedPackages.has(name) && !builtinModules.includes(name)) {
        findings.push({
          file,
          line: i + 1,
          rule: 'import-allowlist',
          hint: `${name} is not a declared dependency.`,
        })
      }
    }
  })
  if (strict(file)) {
    for (const m of text.matchAll(/target\s*=\s*\{?\s*["'`]_blank["'`]/g)) {
      const at = m.index ?? 0
      if (!/noopener/.test(text.slice(Math.max(0, at - 400), at + 400))) {
        const line = text.slice(0, at).split('\n').length
        findings.push({
          file,
          line,
          rule: 'blank-needs-noopener',
          hint: 'Use <SmartLink> (rel="noopener noreferrer").',
        })
      }
    }
  }
  return findings
}

export function scanConfig(nextConfig: string, envExample: string): Finding[] {
  const findings: Finding[] = []
  if (!/poweredByHeader:\s*false/.test(nextConfig)) {
    findings.push({
      file: 'next.config.ts',
      line: 1,
      rule: 'powered-by',
      hint: 'Set poweredByHeader: false.',
    })
  }
  if (!/images:\s*\{[^}]*unoptimized:\s*true/.test(nextConfig)) {
    findings.push({
      file: 'next.config.ts',
      line: 1,
      rule: 'images-unoptimized',
      hint: 'Set images: { unoptimized: true }.',
    })
  }
  if (!/agentRules:\s*false/.test(nextConfig)) {
    findings.push({
      file: 'next.config.ts',
      line: 1,
      rule: 'agent-rules-off',
      hint: 'Set agentRules: false so `next dev` never writes into the protected CLAUDE.md (D-105).',
    })
  }
  const backend = /^NEXT_PUBLIC_BACKEND_ENABLED=(.*)$/m.exec(envExample)?.[1]?.trim()
  if (backend !== 'false') {
    findings.push({
      file: '.env.example',
      line: 1,
      rule: 'backend-disabled',
      hint: 'NEXT_PUBLIC_BACKEND_ENABLED must be false.',
    })
  }
  return findings
}

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else out.push(path)
  }
  return out
}

function main() {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as Record<
    string,
    Record<string, string> | undefined
  >
  const allowed = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})])
  const files = [...ROOTS.flatMap((root) => walk(root)), ...CONFIGS]
    .map((f) => f.replaceAll('\\', '/'))
    .filter((f) => TEXT_EXT.has(extname(f)) && !SKIP.some((re) => re.test(f)))
  const findings = files.flatMap((f) => scanText(f, readFileSync(f, 'utf8'), allowed))
  findings.push(...scanConfig(readFileSync('next.config.ts', 'utf8'), readFileSync('.env.example', 'utf8')))
  if (findings.length === 0) {
    process.stdout.write(`guard: ${files.length} files clean\n`)
    return
  }
  for (const f of findings) console.error(`${f.file}:${f.line} — ${f.rule} — ${f.hint}`)
  console.error(`guard: ${findings.length} finding(s)`)
  process.exitCode = 1
}

if (import.meta.main) main()
