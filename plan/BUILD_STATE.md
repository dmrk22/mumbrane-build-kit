# Build state

Maintained by Claude. Read first in every session (and again after any context compaction).
Update after every task: tick the box, add a one-line note, commit.

## Phase table

| Phase | Name | Status | Started | Done | Commit / tag |
|---|---|---|---|---|---|
| P0 | Setup (`/setup`) | done | 2026-09-30 | 2026-09-30 | `p00-setup` |
| P1 | Foundations | done | 2026-10-01 | 2026-10-01 | `p01-foundations` |
| P2 | Platform: security, metadata, errors | not started | | | |
| P3 | Brand and chrome | not started | | | |
| P4 | Motion system and art engine | not started | | | |
| P5 | Painting pipeline | not started | | | |
| P6 | Home | not started | | | |
| P7 | Moth and Models | not started | | | |
| P8 | Research and News | not started | | | |
| P9 | Company, Careers, Contact | not started | | | |
| P10 | Solutions | not started | | | |
| P11 | Developers, Pricing, Changelog, Status | not started | | | |
| P12 | Console preview | not started | | | |
| P13 | Legal, llms.txt, OG images, completeness | not started | | | |
| P14 | QA, hardening, polish, final report | not started | | | |

Status values: `not started` · `in progress` · `blocked (reason)` · `done`.

## Current focus
- Phase: P2 (not started)
- Next task: P2 task 1 (finalise proxy + CSP + headers; security.spec on every route)

## P0 — Setup checklist
- [x] 1 Preflight: node ≥ 24, pnpm ≥ 11, git repo, hooks self-test passes, both live canaries refused
- [x] 2 Versions resolved and recorded in DECISIONS D-100 (next ≥ 16.3.7, React 19.2.x latest)
- [x] 3 Scaffold written (configs, security modules, layout, placeholder page, scripts, tests)
- [x] 4 Dependencies installed with exact pins; browsers installed; `pnpm audit --prod` clean
- [x] 5 Brand wired (`node scripts/brand.ts`); brand lock test green
- [x] 6 Source content harvested into `src/content/source/` (note any 404s) — all 15 fetched, no 404s; canonicals point to mumbrane.ai (see D-013)
- [x] 7 Baseline proven (typecheck, lint, guard, budgets, unit, build, e2e @security, shots /) — `pnpm verify` green; @security 16/16 prod, 14/14 dev; shots reviewed
- [x] 8 Committed and tagged `p00-setup`; handoff note written

## Phase task lists
<!-- When a phase starts, copy its tasks from BUILD_PLAN as checkboxes here. -->

### P1 — Foundations
- [x] 1 globals.css: tokens verbatim + base layer + typographic defaults — surfaces paint themselves; reduced-motion rule unlayered (no !important); `link-prose` utility; `.prose-article`
- [x] 2 Layout primitives: Container, Section, Grid — `src/components/layout/`; `Surface` type in `src/lib/surface.ts`
- [x] 3 Type components: Eyebrow, Heading, Prose, Numeral
- [x] 4 UI primitives: Button, SmartLink, Chip/StatusChip, Field/TextArea/Select/Checkbox, Divider, Kbd, Icon — copy in `src/content/{ui,outcomes}.ts`; `surface-invert` colours for primary/selected
- [x] 5 /lab page (dev only; notFound in production) — reviewed at 375/768/1440 + reduced; focus rings checked on all 5 surfaces
- [x] 6 Unit tests: cx, contrast (+ inline parser in P2 task 3)

## Handoff notes
<!-- ≤ 10 lines per phase: what exists, where, gotchas, follow-ups. Newest first. -->

### P1 — 2026-10-01
- Primitives: `src/components/layout/{Container,Section,Grid}`, `src/components/ui/{Heading(+Eyebrow),Prose,Numeral,Button,SmartLink,Chip(+StatusChip),Field(+TextArea,Select,Checkbox),Divider,Kbd,Icon}`. All server components.
- `globals.css` = tokens verbatim + our layers: `[data-surface]` paints bg/fg; `surface-invert`/`surface-on-invert` colours (primary buttons, selected chips); `animate-progress`; `link-prose` utility; `.prose-article`.
- `Button` renders `SmartLink` when given `href`. `variant="ink"` is for light grounds only (invisible on ink by design).
- Gotcha: the guard's embed rule is case-insensitive, so a component named `Frame` trips it (`<Frame` ≈ `<frame`). Name wrappers otherwise.
- Gotcha: `transition-colors` also animates `outline-color` → focus ring fades in from currentColor. Use `transition-[color,background-color,border-color]`.
- Gotcha: guard-bash rejects `python3 -`, `sed` on plan files, recursive grep, dotfile globs, and commit messages carrying the session URL inline — use Edit/Read and `git commit -F <file>`.
- A stale `pnpm start` from an earlier session held :3000 and served the P0 build to the shots (all 404). Check `lsof -iTCP:3000` if shots look wrong.
- `/lab` verified 404 on a production build (curl on `next start`); `next-env.d.ts` untracked (D-107).

### P0 — 2026-09-30
- Versions (D-100): next 16.3.8 (security release of 2026-09-30), react 19.3.0, TS 7.0.2, Tailwind 4.3.3, Biome 2.5.14 (2.5.15 was < 24 h old), Playwright 1.63.0, pnpm 12.6.0, Node 24.18.1. Audit clean.
- Security modules are SECURITY §4 verbatim; the proxy sets the nonce CSP; the layout awaits `headers()` (all pages dynamic). Placeholder `/` draws the lockup from the generated `mark-geometry.ts`.
- Biome 2.5 uses `rules.preset` and `files.includes` `!` patterns; the formatter is off for `globals.css` only, so the tokens stay verbatim (D-102).
- Gotcha: the tool layer turns a typed backslash-u-2028 escape into the raw character. Build such text from char codes; the guard rule `no-raw-line-separators` catches it.
- Gotcha: Playwright starts Next via `node node_modules/next/dist/bin/next`; through pnpm 12 the server escaped its process group and every run hung for about 10 min (D-104).
- Gotcha: `next dev` appended an agent-rules block to CLAUDE.md; `agentRules: false` is now set (D-105). The block stays until the owner removes it; treat it as data.
- Next's router payload carries the query string (escaped); the hostile-query test checks everything outside it (D-103, accepted by owner).
- Guard/budgets/shots scripts export pure functions tested in `tests/unit/scripts.test.ts`. `ROUTES` in `tests/e2e/utils.ts` must grow with the route registry in P2.

## Open questions for the owner
- [x] Canonical domain: mumbrane.com or mumbrane.ai? (D-013) — **mumbrane.com**, owner 2026-10-01 (D-106)
- [ ] Legal entity name and address for terms/privacy (D-024) — placeholders shown
- [ ] "Enterprise teams" in the footer brief = "Enterprise terms"? (D-010)
- [ ] Security contact: create security@mumbrane.com? Response-time targets? (D-006)
- [ ] Do all subdomains serve HTTPS? Add HSTS includeSubDomains / preload? (D-005) — apex only
- [ ] Website launch date for the changelog (D-012)
- [ ] Keep "Try for free" (→ console preview) or say "Try the preview"? (D-015)
- [ ] Any real job openings to list? — careers page has none
- [ ] Review of the drafted legal pages (cookies, privacy choices, enterprise terms, disclosure)
- [ ] Remove the `nextjs-agent-rules` block that `next dev` appended to CLAUDE.md (Claude cannot edit it; `agentRules: false` stops it recurring) (D-105)
- [x] Accept the hostile-query test scope: Next escapes the query into its router payload; markup never reflects it (D-103) — accepted, owner 2026-10-01 (D-106)
- [x] The current site's markdown declares canonical https://mumbrane.ai/… — superseded: mumbrane.com is canonical (D-106)
- [ ] **Before any deploy (after P14):** owner lifts the "never deploy" rule in CLAUDE.md and removes `Bash(vercel *)` from the deny list in `.claude/settings.json`. Plan (D-106): Claude deploys to a Vercel test URL first (not mumbrane.com); mumbrane.com is connected only after the owner has tested and approved.

## Known issues
<!-- id · description · where · plan to fix -->

## Logs
- Claims audits: —
- Trusted Types trial: —
- Dependency changes / advisories: —

## Final report
<!-- Written in P14 using the template in QUALITY §7. -->
