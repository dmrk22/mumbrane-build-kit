# Decisions log

Append-only. Format: `### D-### — Title` · **Context** · **Decision** · **Alternatives** ·
**Status** (`Decided` / `Owner to confirm` / `Superseded by D-###`). Claude adds entries during the
build starting at **D-100** (`/setup` writes D-100 and, if needed, D-101). Entries D-001–D-099 were
decided while planning.

---

### D-001 — Stack
**Context**: Frontier-lab quality, security first, "not a 1000-module build", frontend only.
**Decision**: Next.js 16 (App Router, Turbopack) · React 19.2 · TypeScript 7 (6.x fallback) ·
Tailwind CSS 4 (CSS-first tokens) · GSAP 3 + @gsap/react · Lenis · Zod 4 · Biome 2 · Playwright +
axe · raw WebGL2 · node:test. 8 runtime + 11 dev dependencies, allowlisted.
**Alternatives**: Astro (less suited to the console app shell), three.js (heavy for two shaders),
Framer Motion (GSAP covers scroll choreography better), ESLint+Prettier (more deps).
**Status**: Decided.

### D-002 — No subagents
**Context**: Owner: "Do not run sub agents while generating this doc and even the build."
**Decision**: `.claude/settings.json` denies `Agent` and `Workflow`; CLAUDE.md and both skills
repeat the rule; everything runs sequentially in one session.
**Status**: Decided (owner instruction).

### D-003 — Nonce-based strict CSP with dynamic rendering
**Context**: Security is the top priority; Next.js supports nonces only for dynamically rendered
pages.
**Decision**: Per-request nonce from `src/proxy.ts`; root layout reads `headers()`; no PPR or
`cacheComponents`. Pages stay cheap (local content, no fetching).
**Alternatives**: Hash-based CSP or SRI (cannot cover Next's inline RSC scripts), `unsafe-inline`
(rejected). **Status**: Decided (SECURITY §3.3).

### D-004 — No `next/image`; pre-optimised pictures
**Context**: `next/image` renders `style` attributes (blocked by the CSP) and adds an optimiser
endpoint. **Decision**: `images.unoptimized: true`; `scripts/images.ts` (sharp) produces AVIF/WebP
sets; `<Painting>` renders `<picture>`. **Status**: Decided.

### D-005 — HSTS scope
**Context**: Browsers cache HSTS for the whole max-age; `includeSubDomains` would break any
HTTP-only subdomain for up to two years, and `preload` is even harder to undo. (Red-team finding:
the first draft sent `includeSubDomains` without knowing the owner's DNS.)
**Decision**: `max-age=63072000` for this host only. **Status**: Owner to confirm that every
subdomain serves HTTPS; then add `includeSubDomains` (and optionally `preload` + submission).

### D-006 — Security contact and response targets
**Context**: The current site publishes hello@ and research@ only.
**Decision**: security.txt and the disclosure page use `hello@mumbrane.com`; no response-time
numbers until the owner sets them. **Status**: Owner to confirm (create `security@mumbrane.com`?
targets?).

### D-007 — Forms: Server Actions returning a preview state
**Context**: Backend not connected, but forms should be real, accessible and progressively
enhanced. **Decision**: Zod-validated Server Actions that store and send nothing and return a
"preview" state offering a prefilled `mailto:`; repository seam for Neon (SECURITY §6, §8.4).
**Alternatives**: client-only forms (no no-JS path), third-party form services (third-party
origin — rejected). **Status**: Decided.

### D-008 — Console answers come from a labelled in-browser simulator
**Context**: The console must be usable and simple, without a backend or a public Moth API.
**Decision**: A deterministic evaluator over illustrative worlds (named after Preview 004's four
synthetic worlds), returning only documented outcomes; "Simulation — not Moth" everywhere
(CONSOLE §1, §6). **Alternatives**: static recorded fixtures only (less useful), a fake API
(dishonest — rejected). **Status**: Decided.

### D-009 — Fonts
**Context**: The wordmark is set in Host Grotesk SemiBold; editorial display needs a refined
serif with optical sizes; instruments need a mono.
**Decision**: Newsreader (roman with `opsz`, italic without `opsz` to fit the budget), Host
Grotesk, JetBrains Mono — all via `next/font/google` (downloaded at build, self-hosted, zero
runtime requests). Budget ≤ 270 KB, ≤ 2 preloaded. **Status**: Decided.

### D-010 — Reading of the owner's footer labels
**Context**: The brief lists "Modals", "Change log", "Enterprise teams", "Linkledin".
**Decision**: Render "Models", "Changelog", "Enterprise terms", "LinkedIn".
**Status**: Owner to confirm ("Enterprise teams" might have meant a page about teams).

### D-011 — Article title normalisation
**Context**: Source title "Towards Field based Intelligence" differs in style from the other
posts. **Decision**: "Towards field-based intelligence" (hyphenation + sentence case); keep the
slug `toward-field-based-intelligence` for link continuity. **Status**: Decided.

### D-012 — Changelog honesty
**Decision**: Only entries with real dates from the source (2026-09-16, 2026-09-22). A website
launch entry is added only when the owner provides the date. **Status**: Owner to confirm date.

### D-013 — Canonical domain
**Context**: The live site is mumbrane.com; its markdown frontmatter and llms.txt point to
mumbrane.ai. **Decision**: Canonical `https://mumbrane.com` (from `NEXT_PUBLIC_SITE_URL`).
**Status**: Owner to confirm.

### D-014 — Legacy URL continuity
**Decision**: Permanent redirects `/releases` → `/moth#evidence`, `/privacy` → `/legal/privacy`,
`/terms` → `/legal/terms`; temporary `/login` → `/console`; `/<path>.md` → `/md/<path>` if Next
supports the pattern (PAGES §0.6). **Status**: Decided.

### D-015 — "Try for free" destination
**Decision**: `/console` (the free console preview), whose entry screen says it is a simulation.
**Status**: Owner to confirm the label ("Try for free" vs "Try the preview").

### D-016 — Refused outcome colour
**Context**: Violet base fails AA with both ink (3.9 : 1) and on-dark (4.46 : 1).
**Decision**: `--color-refused` = `violet-fg` with on-dark text (4.85 : 1). **Status**: Decided.

### D-017 — Company blocks tell the truth
**Decision**: 12 unlockable blocks + 3 permanent locks labelled as real future work (hosted
console, Moth Base, public API). **Status**: Decided.

### D-018 — Paintings are rendered at build time
**Decision**: `scripts/paint.ts` renders the shaders in Playwright's Chromium (software GL flags
for determinism: `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`; retry
without them if WebGL2 is unavailable, and log it), encodes with sharp, commits outputs. Browsers
never run the paint shaders. **Status**: Decided.

### D-019 — Hero before the first WebGL frame
**Decision**: A CSS field (token gradient) instead of a poster image, so the H1 remains the LCP
element; the poster image is only a fallback for no WebGL2 / Save-Data / context loss.
**Status**: Decided.

### D-020 — Budgets sized to the brief
**Context**: The owner's page list (≈ 35 routes incl. console) needs ≈ 200 source files.
**Decision**: ≤ 230 source files, ≤ 80 components, tightly coupled variants may share a file.
Still far from "a 1000-module build". **Status**: Decided.

### D-021 — No analytics, no cookies
**Decision**: Nothing that tracks, nothing that sets cookies; privacy pages say so.
**Status**: Decided (revisit only with the owner and SECURITY.md).

### D-022 — No Lighthouse dependency
**Decision**: Performance gates are measured by `perf.spec.ts` (bytes, LCP, CLS, long tasks
under mobile emulation). The owner can run Lighthouse from Chrome DevTools. **Status**: Decided.

### D-023 — "Government" dropped
**Context**: The old template site listed Government; the owner's Solutions list does not.
**Decision**: No Government page; the legacy `?interest=government` value is ignored.
**Status**: Decided.

### D-024 — Names
**Decision**: "Mumbrane" in UI and copy; "Mumbrane Labs" as the author byline (as today);
legal entity name pending. **Status**: Owner to confirm the legal entity name.

### D-025 — Trusted Types
**Decision**: Report-only trial in P14; enforce only with zero violations (SECURITY §3.5).
**Status**: Decided; outcome logged in P14.

### D-026 — Cross-origin isolation headers
**Decision**: COOP `same-origin`, COEP `require-corp` (fallback `credentialless` if anything
breaks), CORP `same-origin` except `/og/*` (`cross-origin`). **Status**: Decided.

### D-028 — Red-team hardening (planning audit, 2026-09-30)
**Context**: An adversarial pass found 27 guard bypasses and 1 false positive (npm/jsr alias specs, `pnpx`, `pnpm
create`, `gh`, `git -c … push`, `.env*` globs, recursive grep, `node -e`/`python -c`/`dd`/`curl -o`
writes into protected files, `~/.claude`, MultiEdit edits, embeds, `javascript:` URLs,
third-party fetch/import, `Function()`), a Biome/protected-file deadlock, Playwright able to reuse
a dev server for production tests, `upgrade-insecure-requests` breaking WebKit on
`http://localhost`, over-broad HSTS, and two unverifiable copy claims.
**Decision**: guard v2 (program/subcommand parsing, heredoc- and message-aware, protected paths
readable only by read-only programs, strict registry specs), MultiEdit coverage, 162-case
self-test plus live canaries in `/setup`, backstop deny rules, Biome ignores `.claude/`,
production e2e on port 3100 with no server reuse, UIR only over HTTPS, apex-only HSTS, copy
fixed. Verified by a real Next 16.3.8 + TypeScript 7.0.2 production and dev dry run (nonce CSP,
fonts, Tailwind 4, GSAP 3.15 SplitText, server-action form with and without JS): zero CSP
violations, nonce rotates, no inline style attributes. **Status**: Decided. Residual risks are
listed in `plan/AUDIT.md`.

### D-027 — Markdown alternates path
**Decision**: Serve markdown at `/md/<path>` from typed content (never raw source files);
`llms.txt` links there. **Status**: Decided.

---

## Owner confirmations (summary — mirror into BUILD_STATE "Open questions")
| # | Question | Default used until answered |
|---|---|---|
| D-005 | All subdomains HTTPS? Add HSTS `includeSubDomains` / `preload`? | Apex-only HSTS |
| D-006 | Security contact address and response-time targets | hello@mumbrane.com, no targets |
| D-010 | "Enterprise teams" = Enterprise terms? | Enterprise terms |
| D-012 | Website launch date for the changelog | No entry |
| D-013 | Canonical domain | https://mumbrane.com |
| D-015 | "Try for free" wording | "Try for free" → console preview |
| D-024 | Legal entity name and address | Omitted; `Placeholder` in terms/privacy where required |
| — | Real job openings? | Careers page without listings |
| — | Review of drafted legal pages | Draft banners shown |

---

## Build-time decisions (Claude appends below)

<!-- D-100 Resolved versions (written by /setup) -->

### D-100 — Resolved versions
**Context**: `/setup` Step 2, resolved 2026-09-30 with `pnpm view` (pnpm 12.6.0, Node 24.18.1).
Security floors re-checked on nextjs.org/blog (September 2026 Security Release, 2026-09-30:
1 high, 5 medium, 1 low → 16.3.8) and react.dev/blog (React 19.3 stable, 2026-09-09; RSC
advisories of Dec 2025 fixed from 19.2.1).
**Decision** (exact pins):

| Package | Version | Published |
|---|---|---|
| next | 16.3.8 | 2026-09-30 (security release; exempt from 24 h age) |
| react / react-dom | 19.3.0 | 2026-09-09 (newer stable 19.x, allowed by /setup) |
| gsap | 3.15.0 | 2026-04-13 |
| @gsap/react | 2.1.2 | 2025-01-15 |
| lenis | 1.3.26 | 2026-08-05 |
| zod | 4.6.5 | 2026-09-13 |
| server-only | 0.0.1 | 2022-09-03 |
| typescript | 7.0.2 | 2026-07-08 |
| @types/node | 24.19.0 | 2026-09-25 (matches the Node 24 runtime, not latest 26.x) |
| @types/react / @types/react-dom | 19.3.0 | 2026-09-09 |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | 2026-07-16 |
| postcss | 8.5.28 | 2026-09-03 |
| @biomejs/biome | 2.5.14 | 2026-09-16 (2.5.15 published < 24 h ago, skipped) |
| @playwright/test | 1.63.0 | 2026-09-04 |
| @axe-core/playwright | 4.13.0 | 2026-08-11 |
| sharp | 0.35.5 | 2026-09-27 |
| pnpm (packageManager) | 12.6.0 | installed |

**Alternatives**: React 19.2.8 (latest 19.2.x patch) — 19.3.0 is stable, past the age gate and
within Next's peer range.
**Status**: Decided.

### D-102 — Biome formatter skips `src/app/globals.css`
**Context**: `globals.css` must hold `brand/palette/tokens.css` verbatim (P0/P1). Biome's CSS
formatter rewrites it (`oklch(0.400 …)` → `oklch(0.4 …)`, collapses aligned comments), so the
copy would drift from the source the contrast test reads.
**Decision**: `biome.json` override disables only the *formatter* for `src/app/globals.css`;
linting still applies. No lint rule is disabled.
**Alternatives**: `@import` the brand file (plan asks for the contents inline); let Biome
reformat (values equal, but the file no longer matches its source byte-for-byte).
**Status**: Decided.

### D-103 — Query strings appear (escaped) in Next's router payload
**Context**: SECURITY §3.6.7 says hostile query strings are "not reflected anywhere in the HTML".
Verified on the production build (`pnpm start`, Next 16.3.8): every App Router page serialises
the request URL into its own flight data (`<script nonce>self.__next_f.push(…)</script>`), with
`<` JSON-escaped as `<` and the URL percent-encoded. The app itself never reads or renders
the value. No App Router page can satisfy the literal wording.
**Decision**: `security.spec.ts` asserts (a) the payload never appears unescaped (`<script>M`,
`M</script>`), and (b) outside Next's router-payload scripts the marker appears nowhere (markup,
title, attributes, canonical). This keeps the intent of SECURITY §2.2 ("never reflected into
markup, titles, canonical URLs or redirects").
**Alternatives**: strip unknown query params in the proxy with a redirect (conflicts with
"redirects only to constant internal paths", and breaks `?interest=` / `?world=` later).
**Status**: Owner to confirm (the plan's wording is stricter than the framework allows).

### D-104 — Playwright starts Next's CLI directly, not through pnpm
**Context**: With `webServer.command: 'pnpm start --port 3100'` (BUILD_PLAN §P0.files), pnpm
12.6's native launcher left `next-server` in its own process group (ppid 1). Playwright could not
stop it: every run hung ~10 min after the last test and leaked a server on the port. Observed on
macOS, 2026-09-30.
**Decision**: `playwright.config.ts` runs `node node_modules/next/dist/bin/next start|dev --port
<port>`. Same ports, same `reuseExistingServer` rule. Result: prod `@security` run 10.4 min → 2.2 s,
no orphaned server afterwards.
**Alternatives**: `gracefulShutdown` (cannot reach a process outside the group); killing by port
in a global teardown (fragile, could kill an unrelated server).
**Status**: Decided.

### D-105 — `agentRules: false` in next.config
**Context**: Next 16.3 `next dev` detects AI coding agents and appends a managed
"nextjs-agent-rules" block to `CLAUDE.md` (it did so on the first dev e2e run). `CLAUDE.md` is
protected: Claude may not edit it, and framework text must not steer the build.
**Decision**: Set the documented opt-out `agentRules: false` (top-level key, zod schema in
`next/dist/server/config-schema.js`, gate in `start-server.js`). The block already appended stays
until the owner removes it (Claude cannot edit CLAUDE.md); it is treated as data, not instruction.
**Alternatives**: Commit the block (lets a dependency write standing instructions into the
protected rules file).
**Status**: Owner to remove the appended block from CLAUDE.md.

### D-106 — Owner answers: domain, D-103, hosting (2026-10-01)
**Context**: Owner answered open questions after P0.
**Decision**:
- **Domain (D-013)**: canonical is **https://mumbrane.com** (confirmed; the harvested `.ai`
  canonicals are superseded). `NEXT_PUBLIC_SITE_URL` default stays `https://mumbrane.com`.
- **D-103**: accepted as implemented (hostile-query test scope).
- **Hosting**: Vercel. After P14, Claude deploys, in two stages: (1) to a Vercel test URL only
  (`*.vercel.app`, not mumbrane.com) for the owner to test; (2) only after the owner approves,
  connect mumbrane.com. Deploying still requires the owner to lift the "never deploy" rule
  first (CLAUDE.md non-negotiable 2 and `Bash(vercel *)` in `.claude/settings.json` deny list;
  Claude cannot edit either). Until then, no deploy of any kind.
- Deploy-time checks to run then: proxy on the Node runtime; CSP `upgrade-insecure-requests`
  present over HTTPS; test URL carries `noindex` (preview) so it is never indexed; HSTS stays
  apex-only until D-005.
**Status**: Decided (owner).
