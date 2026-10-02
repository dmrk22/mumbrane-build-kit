#!/usr/bin/env node
// PreToolUse guard for Bash (v2, red-team hardened). Blocks destructive, exfiltrating,
// publishing and supply-chain-risky commands, enforces the dependency allowlist, and lets only
// read-only programs touch protected paths. Denials are returned as JSON so Claude sees why.
// No dependencies; Node 18+. Self-test: `node .claude/hooks/selftest.mjs`.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

let input = {}
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}')
} catch {
  process.exit(0) // malformed payload from the host: permission rules still apply
}
const original = String(input?.tool_input?.command ?? '')
const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd()
const INTERPRETERS = /(^|[\s;&|(])(sh|bash|zsh|dash|ksh|node|python3?|perl|ruby|php|deno|osascript)\b[^\n]*$/
// Heredoc bodies are data (e.g. commit messages) unless they are fed to an interpreter.
const raw = original.replace(/<<-?\s*(['"]?)(\w+)\1([^\n]*)\n([\s\S]*?)\n[ \t]*\2(?=\s|$)/g, (m, _q, _tag, rest, body, offset) => {
  const lineStart = original.lastIndexOf('\n', offset) + 1
  const head = original.slice(lineStart, offset)
  return INTERPRETERS.test(head) ? `<<HEREDOC${rest}\n${body}\n` : `<<HEREDOC${rest}`
})
// Commit messages are data too.
const noMessages = raw.replace(/(\s(-m|--message)(=|\s+))("(?:[^"\\]|\\.)*"|'[^']*'|\S+)/g, '$1MSG')
// Quote/escape-squashed copy defeats splitting tricks such as .en""v or c\url.
const cmd = noMessages.replace(/["'\\`]/g, '')

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `[guard-bash] ${reason}`,
      },
    }),
  )
  process.exit(0)
}

// ---- segmenting -------------------------------------------------------------------------------
const WRAPPERS = new Set(['command', 'exec', 'nohup', 'time', 'env', 'builtin', 'nice', 'timeout', 'xargs', 'watch'])
function unwrapShell(seg) {
  let s = seg.trim()
  for (let i = 0; i < 4; i++) {
    const m = s.match(/^(\S*\/)?(sh|bash|zsh|dash|ksh)\s+(-[a-zA-Z]*c[a-zA-Z]*)\s+(.*)$/)
    if (!m) break
    s = (m[4] ?? '').trim()
  }
  return s
}
const segments = cmd
  .split(/&&|\|\||;|\||\n|\$\(|\)|`/)
  .map(unwrapShell)
  .flatMap((s) => s.split(/&&|\|\||;|\|/))
  .map((s) => s.trim())
  .filter(Boolean)
function program(seg) {
  const words = seg.split(/\s+/).filter((w) => !/^[A-Za-z_][A-Za-z0-9_]*=/.test(w)) // drop VAR=value
  let i = 0
  while (WRAPPERS.has((words[i] ?? '').replace(/^.*\//, ''))) {
    i++
    while ((words[i] ?? '').startsWith('-') || /^\d+[smhd]?$/.test(words[i] ?? '')) i++ // wrapper flags/durations
  }
  return { name: (words[i] ?? '').replace(/^.*\//, ''), args: words.slice(i + 1) }
}
function subcommand(args) {
  // first non-option argument, skipping options that take a value (git -c x=y, -C dir)
  for (let i = 0; i < args.length; i++) {
    const a = args[i] ?? ''
    if (a === '-c' || a === '-C' || a === '--git-dir' || a === '--work-tree' || a === '--dir' || a === '--filter') {
      i++
      continue
    }
    if (!a.startsWith('-')) return { sub: a, rest: args.slice(i + 1) }
  }
  return { sub: '', rest: [] }
}

// ---- programs and subcommands that are never allowed ----------------------------------------
const PROGRAM_DENY = new Map([
  ['sudo', 'sudo is not allowed.'],
  ['su', 'su is not allowed.'],
  ['doas', 'doas is not allowed.'],
  ['printenv', 'Dumping the environment is not allowed.'],
  ...['npm', 'npx', 'yarn', 'bun', 'bunx', 'pnpx'].map((p) => [p, 'Use pnpm only (`pnpm add -E`, `pnpm exec`); one-off remote packages are not allowed.']),
  ...['vercel', 'netlify', 'firebase', 'flyctl', 'fly', 'wrangler', 'heroku', 'railway', 'gh', 'hub', 'aws', 'gcloud', 'az', 'doctl', 'docker', 'podman', 'kubectl', 'terraform'].map((p) => [p, 'Deploying, publishing and cloud CLIs are out of scope for this build.']),
  ...['nc', 'ncat', 'netcat', 'telnet', 'ssh', 'scp', 'sftp', 'ftp', 'socat'].map((p) => [p, 'Raw network tools are not allowed.']),
])
const GIT_DENY = new Set(['remote', 'clone', 'fetch', 'pull', 'submodule', 'filter-branch', 'update-ref', 'daemon', 'send-email', 'request-pull', 'credential'])
const PNPM_DENY = new Map([
  ...['dlx', 'create', 'x', 'link', 'patch', 'patch-commit', 'self-update', 'env', 'setup'].map((s) => [s, 'That pnpm command runs or links code outside the reviewed lockfile. Use installed tools via `pnpm exec`.']),
  ...['up', 'update', 'upgrade'].map((s) => [s, 'Change versions only with `pnpm add -E <pkg>@<exact>` so every bump is reviewed.']),
  ['publish', 'Publishing is not allowed.'],
  ['approve-builds', 'Allow build scripts only by editing allowBuilds in pnpm-workspace.yaml with a DECISIONS entry.'],
])

for (const seg of segments) {
  const { name, args } = program(seg)
  if (PROGRAM_DENY.has(name)) deny(PROGRAM_DENY.get(name))
  if (/^(\S*\/)?env(\s+-\S+)*\s*$/.test(seg)) deny('Dumping the environment is not allowed.')
  if (['set', 'export', 'declare', 'typeset'].includes(name) && (args.length === 0 || /^-[a-z]*[px]/.test(args[0] ?? ''))) deny('Dumping the environment is not allowed.')
  if (name === 'git') {
    const { sub, rest } = subcommand(args)
    if (GIT_DENY.has(sub)) deny('No remote changes: cloning, fetching and editing remotes are the owner’s call.')
    // D-150: plain pushes to origin only (Vercel deploys from them); force, mirror, delete and tag pushes stay out.
    if (sub === 'push') {
      const flags = rest.filter((r) => r.startsWith('-'))
      const refs = rest.filter((r) => !r.startsWith('-'))
      const okFlags = flags.every((f) => ['-u', '--set-upstream', '-q', '--quiet'].includes(f))
      const okRefs = refs.length === 0 || (refs[0] === 'origin' && refs.length <= 2 && /^[A-Za-z0-9._/-]*$/.test(refs[1] ?? '') && !(refs[1] ?? '').startsWith('refs/tags'))
      if (!okFlags || !okRefs) deny('Only plain `git push` / `git push origin <branch>` is allowed: no force, mirror, delete, tags or other targets.')
    }
    if (sub === 'reset' && rest.includes('--hard')) deny('git reset --hard is blocked; use `git restore <path>` for a single file.')
    if (sub === 'clean' && rest.some((r) => /^-[a-z]*f/.test(r))) deny('git clean -f is blocked.')
    if (args.includes('--no-verify') || rest.includes('-n') && sub === 'commit') deny('Do not bypass checks.')
  }
  if (name === 'pnpm') {
    const { sub, rest } = subcommand(args)
    if (PNPM_DENY.has(sub)) deny(PNPM_DENY.get(sub))
    if (sub === 'config' && ['set', 'delete'].includes(rest[0] ?? '')) deny('pnpm settings live in pnpm-workspace.yaml (reviewed); do not change global config.')
    if (sub === 'audit' && rest.includes('--fix')) deny('Fix advisories with an explicit `pnpm add -E pkg@patched` and a DECISIONS entry.')
  }
  if (name === 'chmod' && /(^|\s)([0-7]*[2367][0-7]{0,2}|[ugoa]*\+[rwxX]*w)(\s|$)/.test(` ${args.join(' ')} `)) {
    deny('Group/world-writable permissions are not allowed.')
  }
  if (name === 'rm' && /(^|\s)-[a-zA-Z]*[rR]/.test(args.join(' ')) && args.some((a) => /^(\/|~|\$HOME|\.\.|\*|\.)$|^(\/|~|\$HOME|\.\.\/)/.test(a))) {
    deny('Recursive delete outside the project (or of the whole project) is not allowed.')
  }
  if (['eval', 'source', '.'].includes(name)) deny('Evaluating generated or downloaded shell code is not allowed.')
}
if (/\b(curl|wget|fetch|aria2c)\b[^\n]*\|\s*(sh|bash|zsh|dash|node|python3?|perl|ruby|php)\b/.test(cmd)) deny('Piping a download into an interpreter is not allowed.')
if (/\bbase64\b[^\n]*\s-(d|-decode)\b[^\n]*\|\s*(sh|bash|node|python3?)/.test(cmd)) deny('Decoding into an interpreter is not allowed.')

// ---- secrets ----------------------------------------------------------------------------------
if (/(^|[\s/=<(:@,])\.env(?!\.example\b)(?=[\s.*?[)|;&>,]|$)/.test(cmd) || /(^|[\s/=<(:@,])\.env[*?[]/.test(cmd)) {
  deny('Environment files may contain secrets: never read, copy, list or glob them. Use .env.example.')
}
if (/(^|\s)\.[^\s/]*[*?[]/.test(cmd)) deny('Globbing dotfiles (e.g. `.*`, `.e*`) can expose secrets. Name the file you need.')
if (/(id_rsa|id_ed25519|id_ecdsa|\.ssh\/|\.aws\/|\.npmrc|\.netrc|\.pgpass|\.docker\/config|\.config\/gh|\.git-credentials|\.kube\/|keychain)/.test(cmd)) {
  deny('Credential files are off-limits.')
}
for (const seg of segments) {
  const { name, args } = program(seg)
  const a = ` ${args.join(' ')} `
  if (['grep', 'egrep', 'fgrep'].includes(name) && /\s(-[a-zA-Z]*[rR][a-zA-Z]*|--recursive|--dereference-recursive|-d\s*recurse)\s/.test(a)) {
    deny('Recursive grep also reads ignored files such as .env. Use `git grep` or the Grep tool.')
  }
  if (['rg', 'ag', 'ack'].includes(name) && /\s(-[a-zA-Z]*u[a-zA-Z]*|--no-ignore\S*|--hidden|-\.)\s/.test(a)) deny('Searching ignored/hidden files can expose secrets.')
  if (['tar', 'zip', '7z', 'rsync', 'cpio'].includes(name) && /\s\.\/?\s/.test(a)) deny('Archiving or syncing the whole project is not needed.')
  if (name === 'find' && /-exec(dir)?\s+(cat|head|tail|less|more|strings|xxd|od|base64|cp|curl)\b/.test(seg)) deny('find -exec on file contents can read secrets. Read the specific file you need.')
}

// ---- protected paths: only read-only programs may touch them ---------------------------------
const P = String.raw`(\.\/)?(\.claude(\/|\s|$)|CLAUDE\.md|brand\/logo(\/|\s|$)|reference(\/|\s|$)|src\/components\/brand\/mark-geometry\.ts|plan\/(BUILD_PLAN|DESIGN|PAGES|CONTENT|CONSOLE|SECURITY|QUALITY|AUDIT)\.md)`
const startsProtected = new RegExp(`^${P}`)
const HOME_CLAUDE = /(~|\$HOME|\$\{HOME\}|\/Users\/[^/\s]+|\/home\/[^/\s]+|\/root)\/\.claude(\/|\s|$)/
const protectedIn = (s) => new RegExp(String.raw`(^|[\s=:>(,])${P}`).test(` ${s}`) || HOME_CLAUDE.test(s)
const READ_ONLY = new Set(['cat', 'head', 'tail', 'less', 'more', 'wc', 'grep', 'egrep', 'fgrep', 'rg', 'diff', 'cmp', 'sha256sum', 'shasum', 'md5sum', 'ls', 'stat', 'file', 'test', '[', 'echo', 'printf', 'nl', 'sort', 'uniq', 'cut', 'tr', 'jq', 'column', 'realpath', 'dirname', 'basename', 'readlink', 'tree', 'du'])
const GIT_READ = new Set(['diff', 'log', 'show', 'status', 'ls-files', 'blame', 'grep', 'add', 'commit', 'rev-parse', 'cat-file', 'check-ignore'])

for (const m of cmd.matchAll(/(\d?>{1,2}|>\|)\s*([^\s;&|)]+)/g)) {
  const target = m[2] ?? ''
  if (startsProtected.test(target) || HOME_CLAUDE.test(target)) deny('Redirecting output into a protected path is not allowed.')
}
for (const seg of segments) {
  if (!protectedIn(seg)) continue
  const { name, args } = program(seg)
  const files = args.filter((t) => !t.startsWith('-'))
  if (HOME_CLAUDE.test(seg) && !READ_ONLY.has(name)) deny('User-level Claude configuration is off-limits.')
  if (name === 'git' && GIT_READ.has(subcommand(args).sub)) continue
  if (name === 'sed' && !/(^|\s)-[a-zA-Z]*i|--in-place/.test(args.join(' ')) && !/\sw\s|\/w\s/.test(seg)) continue
  if (name === 'awk' && !/inplace|>\s|print\s*>/.test(seg)) continue
  if (name === 'cp' && !startsProtected.test(files[files.length - 1] ?? '')) continue
  if (name === 'node' && /^(\.\/)?\.claude\/hooks\/selftest\.mjs$/.test(args[0] ?? '')) continue
  if (name === 'node' && /^(\.\/)?reference\/harness\/render\.mjs$/.test(args[0] ?? '') && !startsProtected.test(files[2] ?? '')) continue
  if (READ_ONLY.has(name) && !/\s-[a-zA-Z]*[oO]\s/.test(` ${args.join(' ')} `)) continue
  deny('That path is protected (Claude config, CLAUDE.md, logo, references, plan specs, generated geometry). Only read-only commands may touch it.')
}

// ---- network: the shell may only reach the owner's site and localhost ---------------------------
const urls = raw.match(/\b(https?|wss?|ftp):\/\/[^\s"'<>|;)]+/g) || []
const netTool = /(^|[\s;&|(])(curl|wget|aria2c|http|https|xh|httpie|deno|node\s+(-e|--eval|-p|--print)|python3?\s+-c|ruby\s+-e|perl\s+-e|php\s+-r)(\s|$)/
if (netTool.test(cmd) && urls.length) {
  for (const u of urls) {
    let host = ''
    try {
      host = new URL(u).hostname
    } catch {
      deny(`Unparseable URL: ${u}`)
    }
    const ok = host === 'mumbrane.com' || host === 'www.mumbrane.com' || host === 'localhost' || host === '127.0.0.1'
    if (!ok) deny(`Shell network access is limited to mumbrane.com and localhost (got ${host}). Use WebFetch for documentation.`)
  }
}
for (const seg of segments) {
  const { name, args } = program(seg)
  if (['curl', 'wget', 'aria2c'].includes(name)) {
    if (!/\bhttps?:\/\//.test(seg)) deny('Use a literal https://mumbrane.com/… URL with curl (no variables or config files).')
    if (/(^|\s)(-K|--config|-T|--upload-file|-d|--data\S*|-F|--form\S*|--json|-X\s*(POST|PUT|PATCH|DELETE))(\s|$)/.test(args.join(' '))) {
      deny('curl may only download (no uploads, forms, request bodies or config files).')
    }
  }
}

// ---- dependency allowlist -------------------------------------------------------------------------
for (const seg of segments) {
  const { name, args } = program(seg)
  if (name !== 'pnpm') continue
  const { sub, rest } = subcommand(args)
  if (!['add', 'install', 'i'].includes(sub)) continue
  const flags = rest.filter((t) => t.startsWith('-'))
  const pkgs = rest.filter((t) => !t.startsWith('-'))
  if ((sub === 'install' || sub === 'i') && pkgs.length === 0) {
    if (flags.some((f) => /^(-g|--global|--config\.|--ignore-workspace|--dangerously)/.test(f))) deny('Only a plain lockfile install is allowed.')
    continue
  }
  let allow = { runtime: [], dev: [] }
  try {
    allow = JSON.parse(readFileSync(join(projectDir, '.claude', 'allowed-deps.json'), 'utf8'))
  } catch {
    deny('Cannot read .claude/allowed-deps.json; refusing to add packages.')
  }
  const isDev = flags.some((f) => f === '-D' || f === '--save-dev' || f === '--dev')
  if (!flags.some((f) => f === '-E' || f === '--save-exact')) deny('Pin exact versions: use `pnpm add -E <pkg>@<version>`.')
  if (flags.some((f) => /^(-g|--global|--config\.|-w|--workspace-root|--allow-build|--dangerously)/.test(f))) {
    deny('Global, workspace-root and build-approving installs are not allowed.')
  }
  for (const spec of pkgs) {
    const scoped = spec.startsWith('@')
    const body = scoped ? spec.slice(1) : spec
    const at = body.indexOf('@')
    const name = (scoped ? '@' : '') + (at >= 0 ? body.slice(0, at) : body)
    const range = at >= 0 ? body.slice(at + 1) : ''
    if (!/^(@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*$/.test(name) || (!scoped && name.includes('/'))) deny(`Only registry packages are allowed (got ${spec}).`)
    if (/[:/]|\.tgz$|^(latest|next|canary|beta|alpha|rc|experimental)$/i.test(range)) {
      deny(`Use an exact registry version (no aliases, protocols, tarballs or dist-tags): ${spec}`)
    }
    const list = isDev ? allow.dev : allow.runtime
    const other = isDev ? allow.runtime : allow.dev
    if (!list.includes(name)) {
      if (other.includes(name)) deny(`${name} is allowed only as a ${isDev ? 'runtime' : 'dev'} dependency.`)
      deny(`${name} is not in .claude/allowed-deps.json. Use the platform or an allowed package; if truly needed, log a DECISIONS.md proposal for the owner.`)
    }
  }
}

process.exit(0)
