# Mumbrane web — build kit

A complete, self-driving plan for the new mumbrane.com. Claude Code builds the whole site from
it with two commands, **`/setup`** (once) and **`/go`** (repeat until done), working alone — no
subagents — and committing each phase locally.

**What gets built**: the marketing site (home, Moth, research, news, company, careers, contact,
solutions, developers, docs, models, pricing, changelog, status, legal) and a console preview —
frontend only, with clean seams for the future Neon backend.

**Priorities, in order**: security (strict nonce CSP, zero third-party requests, allowlisted
and pinned dependencies, guard hooks that block risky commands and code) · design (ultramarine
field with rationed pigments, Newsreader / Host Grotesk / JetBrains Mono, a WebGL "membrane"
hero crossed by muon tracks, procedural oil-on-code paintings for research, Mistral-style
unlocking blocks on the Company page, an Anthropic-style header wordmark that collapses into the
Möbius mark, instrument windows used sparingly) · honesty (no invented customers, numbers,
prices or roles; previews and simulations labelled).

---

## 1. Before you start
1. Install **Node.js 24 LTS**, **git**, and enable **pnpm 11**: `corepack enable pnpm`.
2. Update Claude Code to the latest version.
3. Unzip the kit. The `mumbrane-build-kit` folder it creates **is** your project folder (rename it
   if you like, e.g. `mumbrane-web`). If you copy the files elsewhere instead, make sure the hidden
   `.claude/` folder comes along — Finder hides it (⌘⇧. shows hidden files).
4. Open Claude Code in that folder and **trust the folder** when asked (project settings, hooks
   and skills only load in trusted folders).

## 2. Run it
- **`/setup`** — once. Checks your tools, resolves safe versions, scaffolds the project,
  installs the allowlisted packages, wires the locked logo, harvests the current site's copy,
  and proves the security baseline. Type it in full (the menu may suggest a different command
  that also starts with "setup").
- **`/go`** — builds phases P1 → P14 in order: foundations, security platform, brand and
  chrome, motion and WebGL, the painting pipeline, then every page, the console, legal/SEO, and a
  final QA and polish pass. Whenever it stops (a question, a long session, context limits), run
  **`/go`** again — it resumes from `plan/BUILD_STATE.md`.
  - `/go status` — progress and open questions · `/go next` — one phase only · `/go P07` — redo
    one phase.
  - Type `/go` exactly; don't pick `/goal` from the suggestions.
- File edits in this folder are auto-approved and routine commands are pre-approved; anything
  unusual asks you first. Claude never pushes, deploys or publishes — it commits locally and tags
  each phase (`p00-setup` … `v0.1.0-preview`).
- Expect the build to span many `/go` runs. Each phase is verified (types, lint, security scan,
  unit and end-to-end tests, screenshots at three widths) before it is marked done.

## 3. When it's done
`pnpm build && pnpm start` → http://localhost:3000. The final report (budgets, test results,
performance, open questions, next steps for the Neon backend) is at the end of
`plan/BUILD_STATE.md`.

## 4. Decisions waiting for you
Answer whenever convenient (edit `plan/BUILD_STATE.md` → "Open questions", or tell Claude). Until
then it uses the defaults in `plan/DECISIONS.md`:
canonical domain (mumbrane.com vs mumbrane.ai) · legal entity name and address · whether
"Enterprise teams" in the footer meant "Enterprise terms" · a security contact address and
response targets · whether every subdomain is HTTPS (for stricter HSTS) · the website launch date · "Try for free" wording (it opens the
console preview) · any real job openings · review of the drafted legal pages.

## Troubleshooting
- **`/setup` says the guard canaries failed**: the safety hooks run `node` directly. Quit Claude
  Code, open a terminal where `node --version` prints v24, start Claude Code from that terminal in
  this folder, and run `/setup` again.
- **A command is refused with `[guard-bash]` or edits get `[guard-write]` feedback**: that is the
  guard doing its job; Claude adapts. If a refusal is genuinely wrong, edit the hook yourself
  (Claude can't) and re-run `node .claude/hooks/selftest.mjs`.

## 5. What's in the kit
```
START-HERE.md             this file
CLAUDE.md                 standing rules Claude reads every session (protected)
.claude/
  settings.json           permissions (no subagents; deny risky commands), hooks (protected)
  allowed-deps.json       the only packages that may be installed
  hooks/                  guard-bash (blocks risky shell), guard-write (blocks unsafe code), self-test
  skills/setup, skills/go the two commands
plan/
  BUILD_PLAN.md           phases P0–P14: tasks, budgets, exit criteria
  DESIGN.md               colour, type, layout, motion, imagery, components
  PAGES.md                structure of every route
  CONTENT.md              navigation, copy, claims policy, SEO
  CONSOLE.md              the console preview (simplest possible)
  SECURITY.md             headers, CSP, modules (code), supply chain, forms, disclosure
  QUALITY.md              gates, tests, visual review, claims audit, final report
  AUDIT.md                red-team audit of this kit: what was broken, what was fixed, residual risks
  DECISIONS.md            decisions made while planning (+ Claude's, appended)
  BUILD_STATE.md          live progress (Claude maintains)
brand/
  logo/                   the locked Möbius mark, wordmark, lockup (+ LOGO.md, LOCK.json)
  icons/, og-default.png  favicons, app icons, default social card
  palette/                tokens.css (Tailwind v4 theme) + palette.json
  board/                  the visual target (board + section crops, hero still, reference plates)
  references/             your inspiration screenshots — internal only, never shipped
reference/
  shaders/                tested GLSL: membrane hero, scene + paint passes, presets
  harness/                tested headless renderer used as the model for the paint script
```

## 6. Changing things
- The plan files are yours: edit them any time (Claude treats them as read-only and only
  maintains `BUILD_STATE.md` and appends to `DECISIONS.md`).
- The logo is locked; to replace it follow `brand/logo/LOGO.md`.
- To allow a new dependency, add it to `.claude/allowed-deps.json` yourself.
