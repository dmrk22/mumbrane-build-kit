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

### D-107 — `next-env.d.ts` is untracked (2026-10-01)
**Context**: Next rewrites `next-env.d.ts` on every `dev`/`build` (double-quoted imports of
`.next/types/*`), so the tracked copy failed `biome check` after any server run. Next's own docs
(`02-typescript.md`) say to gitignore it.
**Decision**: `git rm --cached next-env.d.ts` and add it to `.gitignore`; Biome skips it via VCS
ignore. It is regenerated by `next dev`, `next build` or `next typegen`.
**Alternatives**: Biome override for the file (a suppression for a file we don't own).
**Status**: Decided.

### D-108 — Hairline floor for the compact mark below 48 px tall (2026-10-01)
**Context**: DESIGN §6 / LOGO.md ask for `vector-effect: non-scaling-stroke` on the compact mark
at ≤ 48 px tall "so hairlines never vanish". With non-scaling strokes the width is in screen px,
so the file's unit weights must be converted: at the 20 px header lockup the compact strut would
be 3.16 × 0.051 ≈ 0.16 px — invisible.
**Decision**: `markStrokes()` converts the weights to px and floors them (edges ≥ 1 px, struts
≥ 0.5 px) only in that regime. Paths, angles and proportions are untouched; above 48 px the
file's weights apply as-is. Brand SVGs render `aria-hidden` and are named by their context
(the header link's "Mumbrane — home"), because Biome's SVG title rule needs static attributes.
**Alternatives**: Plain scaling (struts disappear in the header); a third weight file (the logo
folder is owner-only).
**Status**: Decided; owner may veto the floors.

### D-109 — Chrome motion in CSS, not GSAP (2026-10-01)
**Context**: P3 needs the header collapse (§7.1), the mark draw-on and the footer wordmark rise
(§7.8) before the P4 motion system exists; all three are fixed-sequence transitions.
**Decision**: CSS transitions/animations keyed on `data-collapsed` / `data-reveal`; per-letter
timing via `data-letter` selectors; `pathLength="1"` + dash offsets for the draw-on. State comes
from IntersectionObserver sentinels (no scroll listener) and the `InView` primitive, which arms
the hidden start state only when motion is allowed and the box is below the fold. Chrome motion
lives in `@layer components` so the unlayered reduced-motion rule (durations and delays → 0)
always wins. Zero JS weight; GSAP stays for scrubs and pins (P4).
**Alternatives**: GSAP timelines (adds GSAP to every route's first load for three sequences).
**Status**: Decided.

### D-110 — Suppression 1 of ≤ 3: `gl.useProgram` is not a React hook (2026-10-01)
**Context**: Biome's `useHookAtTopLevel` treats any call named `use*` as a React hook, including
the WebGL2 method `WebGLRenderingContext.useProgram` in `src/lib/gl/context.ts` (a plain library
function, no React).
**Decision**: One line-level `biome-ignore lint/correctness/useHookAtTopLevel` with a reason, on that
call only. QUALITY §2 budget: 1 of ≤ 3 suppressions used.
**Alternatives**: Calling it through `.call`/bracket access to dodge the matcher (obscures the code);
a folder-wide rule override (broader than the one line).
**Status**: Decided.

### D-111 — Motion lab: live reduced-motion state instead of a toggle; probes (2026-10-01)
**Context**: BUILD_PLAN P4 task 6 asks for a reduced-motion toggle on the lab page. A page cannot
change `prefers-reduced-motion`, and the motion code rightly reads only that media query.
**Decision**: `/lab/motion` shows the live state, a CSP-violation counter and a Replay button;
reduced motion is exercised through Playwright emulation (`1440-reduced` shots, `motion.spec`)
and DevTools → Rendering. Probes: the FPS probe measures scrolling below the membranes, because
headless Chromium rasterises WebGL in software (SwiftShader) — the with-canvases figure is
recorded, not asserted; the GPU timer (`EXT_disjoint_timer_query_webgl2`) is not exposed headless
and is reported as not measurable rather than estimated. CLS from motion is measured after fonts
load; font-swap CLS is a font-loading matter held to the 0.02 budget by `perf.spec` (P14).
**Alternatives**: A global motion flag read by every component (a second source of truth that
could disagree with the OS setting).
**Status**: Decided.

### D-112 — Home LCP: hero text painted in the first frame (2026-10-01)
**Context**: Under the QUALITY §4 mobile profile (390 px, CPU 4×, Fast 4G) the main thread is busy
with JS until ≈ 2.6 s. Hero text that faded in from opacity 0, or H1 lines starting fully inside
their masks, was only counted as painted then (LCP ≈ 2.5 s). At 390 px the H1 and the lede are
near-equal text boxes (≈ 32.8k vs 33.3k px²), so which one Chrome names is incidental.
**Decision**: Below 1024 px hero text lifts with transform only (no fade) and the H1 is a single
text box; from 1024 px the H1 keeps its per-line mask reveal (lines start at 40 %, not fully
masked) and the fades. perf.spec asserts mobile LCP ≤ 2.0 s with a hero text element (H1 or
lede) and, on desktop, that the H1 is the LCP. Measured: mobile LCP 930–953 ms, CLS 0.
Also: long tasks during the membrane loop in headless runs are SwiftShader (software GL, present
without throttling, absent under reduced motion) — all under the 200 ms limit; real devices
render the shader on the GPU.
**Alternatives**: Dropping the hero entrance (loses the designed moment); a font-display change
(the late paint was the animation, not the fonts).
**Status**: Decided.

### D-113 — Timing probes run alone: `pnpm test:perf` (2026-10-01)
**Context**: Web-vitals and long-task probes measured inside the parallel e2e run saw other
workers' browsers competing for the same CPU (one run: an 880 ms long task that is ≈ 120 ms when
the probe runs alone). A timing budget only means something on a quiet machine.
**Decision**: `perf.spec.ts` is its own Playwright project (`perf`), excluded from
chromium/mobile/webkit and run by `pnpm test:perf` (`--workers=1`), which `pnpm verify` now runs
after the functional e2e. Budgets and assertions are unchanged.
**Alternatives**: One worker for the whole suite (triples verify time as routes grow);
loosening the thresholds (not allowed).
**Status**: Decided.

### D-114 — Company blocks: locked from the first paint by CSS, with a failsafe (2026-10-01)
**Context**: DESIGN §7.6 wants the mosaic locked while you scroll into it, but fully open without
JS and under reduced motion. Rendering "open" on the server and locking at hydration would re-hide
text the visitor has already seen (the H1 and the mosaic share the first screen, board 05).
**Decision**: Open is the default state. `@media (scripting: enabled) and (prefers-reduced-motion:
no-preference)` draws blocks without `data-unlocked` as locked from the first paint; `BlocksMosaic`
then sets `data-unlocked` per block (pin steps ≥ 1024 px, viewport entry below, focus on linked
blocks). If the section is never armed (`data-live` missing — scripts blocked or failed), a CSS
failsafe opens every block after 4 s; the component checks for the finished failsafe and then never
re-locks. The heading row moved the lede beside the H1, and rows are `clamp(140px, (100dvh − 300px)
/ 3, 200px)`, so the pinned section fits a 900 px viewport (200 px rows there).
**Alternatives**: Server-rendered locked state (unreadable without JS); lock at hydration (a visible
re-hide); an inline pre-paint script (CSP allows none).
**Status**: Decided.

### D-115 — P9 copy and a hook false positive (2026-10-01)
**Context**: PAGES §6 asks for one-line glosses on the careers areas; CONTENT §3.6 lists the areas
only. The write hook reads the brand utility `bg-violet-fg` as Tailwind's default violet palette.
**Decision**: Six neutral one-line glosses authored (descriptions of the field, no claims), flagged
for the owner in BUILD_STATE. The violet block uses the same token as `bg-(--color-violet-fg)`.
Form error copy for fields CONTENT does not cover follows its pattern ("Enter your company.",
"Choose a company size.", "Keep it under 160 characters.").
**Alternatives**: Areas without glosses (thinner than the layout spec); editing the protected hook.
**Status**: Decided; glosses await owner confirmation.

### D-116 — Browser-side Zod: `zod/mini`, jitless (2026-10-01)
**Context**: SECURITY §6 runs the form schema in the browser as well as in the server action. The
classic `zod` build put /contact at 256 KB first-load JS (budget 190), and Zod's JIT probes
`new Function` once, which the strict CSP reports as an enforced `script-src` violation even though
Zod catches the throw (security.spec failed on /contact and /contact/sales in production).
**Decision**: `src/lib/forms.ts` and `src/lib/security/params.ts` use `zod/mini` (same pinned
package, same rules, tree-shakable) and `z.config({ jitless: true })`, which skips the probe.
Server-only modules (`env`, content schemas) keep the classic API. Measured (prod): /contact
182.8 KB, /contact/sales 180.8 KB; security.spec clean.
**Alternatives**: A hand-written client validator (two sources of truth); raising the budget (not
allowed); dropping client validation (loses inline, announced errors without a round trip).
**Status**: Decided.

### D-117 — Solutions copy: authored, illustrative, and nothing invented for the delivered worlds (2026-10-01)
**Context**: CONTENT §3.8 fixes the headings, the four illustrative worlds' subjects and the Fit
lists, but not the rulebook bullets, the "why evidence matters" points, the domain "next step"
wording, or the sketch definitions. The sources name the libraries, trails and venues worlds
without any detail.
**Decision**: Authored copy stays descriptive (what gets defined, what the evidence lets a reader
do); every world is tagged Illustrative / Illustrative sketch / Synthetic example world, with a
caption that it is not a customer deployment or a live console. The limits box reuses sourced
sentences from releases.md/moth.md. Libraries, Trails and Venues show no question or outcome —
only "Its questions and definitions ship with the local delivery." The Security page's "Our own
security" panel states only what this build does (strict CSP, no third parties, no tracking).
The Solutions menu is marked current on its overview page (`Menu.index`).
**Alternatives**: Inventing example questions for the three undetailed worlds (would read as
real results); leaving the template sections empty.
**Status**: Decided; authored solution copy listed for owner review.

### D-118 — Developers, pricing, changelog, status: sourced or labelled (2026-10-01)
**Context**: CONTENT §3.9–§3.12 names the sections; the sources (releases.md, moth.md) hold the
wording. The concept one-liners, the plan fact bullets and the illustrative JSON are not in the
sources. The changelog source says "no published changelog entries yet"; CONTENT §3.11 lists
entries dated by the real article publications.
**Decision**: Docs and API overview reuse `MOTH` wording by reference (no duplicated copy). The
seven concept lines restate source sentences; the JSON is tagged "Illustrative — not the Preview
004 schema" and its checked-English twin sits beside it. Plan bullets state only what the
sources say (local CLI, documentation and qualification evidence, four synthetic worlds; the
console is a no-network simulation per SECURITY §7). Changelog entries use article dates only (an
e2e test checks every date against the article metadata). Status shows "Not yet monitored" and
an empty 90-cell bar; no numbers. The docs contents list measures heading positions on scroll
(an IntersectionObserver missed bottom → top jumps; regression test in pages.spec).
**Alternatives**: Copying source text into new modules (drift); a "Website launched" entry
(waits for the owner, D-012).
**Status**: Decided.

### D-119 — Pushing to the owner's private GitHub repository is allowed (2026-10-01)
**Context**: The build was local-only ("Never push, publish or deploy"; the bash guard denied
`git push`, `git remote` and every `gh` command). The owner asked for the project on GitHub and
for the rules to be rewritten accordingly, keeping every security rule as it is.
**Decision** (owner): plain pushes to the owner's **private** GitHub repository (`origin`) are
allowed — `git push` (no force, mirror, prune or ref-deleting pushes), `git remote add/-v/show/
get-url` with GitHub URLs only, and `gh auth status`, `gh repo view`, `gh repo create … --private`.
Still blocked: clone/fetch/pull, public or internal repositories, every other `gh` command,
deploying, publishing packages, and all existing security rules. Changed: CLAUDE.md (non-negotiable
2 and the loop's step 6), SECURITY.md (the commits line), `.claude/settings.json`,
`.claude/hooks/guard-bash.mjs` and its self-test (new attack and allow cases). The owner applies the
protected-file edits; the hooks still refuse Claude's own writes to them.
**Alternatives**: The owner pushing by hand each time (kept possible); lifting the hook entirely (no).
**Status**: Decided by the owner.

### D-120 — Console theme script only in server HTML; `<html suppressHydrationWarning>` (2026-10-01)
**Context**: CONSOLE §10.2 puts `<script src="/console-theme.js" nonce>` before the console shell.
Rendered on a client-side navigation into the console, React creates an inert copy and logs
"Encountered a script tag…" in development; and the script's own `data-console-theme` on `<html>`
made hydration report an attribute mismatch on every console load with a stored theme.
**Decision**: `ThemeBootstrap` (in `ThemeControl.tsx`) renders the script only during SSR and
hydration (`useSyncExternalStore` with a server snapshot of `true`); after client navigation
`ThemeControl`'s layout effect applies the stored theme before paint. The root `<html>` carries
`suppressHydrationWarning`, which covers that element's own attributes only.
**Alternatives**: Separate root layouts for site and console (full reload between them; larger
restructure); an async script (could run after first paint — a flash).
**Status**: Decided.

### D-121 — Console shell details (2026-10-01)
**Context**: CONSOLE §2/§4 leave room on a few placements.
**Decision**: The top-bar title is the page's H1 (the entry screen keeps its own display H1, so its
bar shows "Console"). Below 640 px the top bar drops the theme control (Settings has it) so the
title fits. The world drawer button sits in the playground's world summary for every width below
1280 px (not in the top bar). `Esc` in the question box leaves it, so `E`/`R`/`J`/`K` work from
the keyboard without the mouse (listed in the shortcuts). The Playground rail item leads to the
entry screen (where a world is chosen) and is current on both.
**Alternatives**: A visible H1 in each page body (duplicates the bar); a top-bar World button
(needs a portal from the page into the layout).
**Status**: Decided.

### D-122 — Entry cards show each example's simulated outcome (2026-10-01)
**Context**: The four world cards (CONSOLE §3) were text-only.
**Decision**: Each card shows "N example questions, simulated:" followed by one small square per
example in its outcome colour, computed on the server by the same simulator (so it is true by
construction and labelled as simulated). Decorative (`aria-hidden`); the label carries the meaning.
**Alternatives**: No preview (plainer); a sample answer (longer cards).
**Status**: Decided.

### D-123 — Markdown documents for key pages come from the content modules (2026-10-01)
**Context**: PAGES §0.7 / CONTENT §6 ask for `/md/index`, `/md/moth`, `/md/research`, `/md/news`,
`/md/contact`, `/md/changelog`, `/md/legal/terms` and `/md/legal/privacy`. The harvested source has
markdown for most of them, but it predates this site: its `changelog.md` says there are no entries
while `/changelog` lists four dated ones, and `index.md` is the old home page.
**Decision**: `src/content/mdDocs.ts` composes each key page's document from the same content
modules its HTML page renders (headings, ledes, lists, the Moth evidence tables via `claims.ts`);
legal pages and articles reuse their blocks. `/llms.txt` lists every document under "Core pages"
and "Publications" with its registry description. The live terms and privacy texts are generated
from the source by `scripts/articles.ts`, which now also emits `LEGAL_BODIES` and keeps a heading
that sits directly under the title.
**Alternatives**: Serve the harvested files (contradicts the site); hand-written markdown (drifts).
**Status**: Decided.

### D-124 — Social cards: the brand default, generated families, template outside `(dev)` (2026-10-01)
**Context**: CONTENT §6 lists the families default, moth, research (per article), news (per post),
company, solutions, developers and legal. `brand/og-default.png` is the owner's default card, copied
to `public/og/default.png` and held byte-identical by `brand.test.ts`. BUILD_PLAN names
`src/app/(dev)/lab/og/[family]/page.tsx`, five directory levels under `src/` (budget: four).
**Decision**: The default card stays the brand file and is never generated. `pnpm og` generates the
seven other families and one card per article (`src/content/og.ts`: titles from each section's own
copy; `ogImage(path)` maps a route by prefix, an article to its own card, anything else to the
default). The template lives at `src/app/lab/og/[family]/page.tsx`: the same URL, 404 in production
(asserted). The `(dev)` group has no layout, so nothing else changes.
**Alternatives**: Regenerate the default (breaks the brand lock); `/lab/og?family=` (changes the
URL in PAGES §0.9).
**Status**: Decided.

### D-125 — Legal page details (2026-10-01)
**Context**: CONTENT §3.13 and SECURITY §9.2 leave a few placements open.
**Decision**: "Last updated" is the date the text last changed on this site (2026-10-01 for all six;
the owner may set effective dates). The sentence added to privacy is an info note under
"Information you provide", under the "Updated — pending owner review." banner. The disclosure page
mirrors the repository SECURITY.md (US spelling, Oxford commas) plus the drafted "Safe harbor"
sentence, and states no response time (D-006). The GPC notice is a client island (`GpcNotice`) that
shows server-rendered children only when `navigator.globalPrivacyControl` is true; nothing is
stored or sent. Below 1024 px the legal rail wraps above the title, so reading order matches the DOM.
**Alternatives**: A draft banner on privacy (it is the live text plus one sentence); a notice built
in the client (ships the Note and Icon code).
**Status**: Decided; the legal texts await owner review (open question).

### D-126 — Trusted Types trial: kept off (2026-10-01)
**Context**: SECURITY §3.5. A full production run (chromium + mobile, 680 tests) with
`CSP_TT_TRIAL=1` recorded 94 report-only `require-trusted-types-for` violations, on every route,
from a single sink: `HTMLScriptElement.src`, assigned by the Turbopack runtime (`turbopack-*.js`)
when it loads lazy chunks (the motion libraries among them). Our own code hits no sink. The runtime
creates no Trusted Types policy (it never references `trustedTypes`), so there is no framework
policy name to allow.
**Decision**: Trusted Types stay off; the report-only header remains available behind
`CSP_TT_TRIAL=1`. The e2e suite records report-only findings as annotations, never as failures.
Listed under known limitations.
**Alternatives**: Enforce (blocks lazy chunk loading); a narrow `default` policy that admits only
same-origin `/_next/static/chunks/*.js` (an owner decision — §3.5 forbids a permissive default
policy); revisit when Next/Turbopack ships a named policy.
**Status**: Decided.

### D-127 — WebKit full-suite run: findings and the default (2026-10-01)
**Context**: The webkit project runs `@smoke` only; SECURITY §10 asks for `@security` on WebKit
too. P14 added `E2E_WEBKIT_ALL=1` to run every spec there.
**Decision**: `@security` passes on WebKit. Findings: icon-only buttons had no accessible name in
WebKit (named by an SVG `<title>`) — fixed in `Icon` (aria-label) with an `@smoke` regression test;
keyboard tests fail because WebKit, like Safari, Tabs only to form controls unless "Press Tab to
highlight each item" is on (Option+Tab reaches links — verified), which is platform behaviour, not
a site defect; the Company pin fps probe is calibrated for Chromium. The default stays `@smoke`;
the full WebKit run is a QA tool.
**Alternatives**: Run everything on WebKit by default (keyboard tests would need Option+Tab
variants; slower runs).
**Status**: Decided.

### D-128 — Owner-directed redesign: "blackboard" identity (2026-10-01)
**Context**: The owner reviewed v0.1.0-preview and overrode the design rules in the plan files:
the ultramarine field, the fonts, the header (too close to the old mumbrane.com), the instrument
boxes, the console demo and the evidence seal were all rejected as boring. Direction: artistic,
mathematical, frontier-lab quality; references typesafe.ai, generalintelligencecompany.com,
cofounder.co, mistral.ai, topiary.supply (Nous Research), anthropic.com.
**Decision**: New identity, security and brand locks unchanged (CSP, no third parties, locked
Möbius logo, allowlisted deps). Palette "blackboard": plaster paper, blackboard ink, deep, chalk,
and chalk pigments (sulfur, malachite, cinnabar, iris, verdigris, madder, ochre, moss), regenerated
in palette.json/tokens.css with every contrast pair re-tested. Type: Mona Sans (headlines, wdth
112 %), Source Serif 4 (reading text, theorem statements), Martian Mono (instrument windows), Noto
Sans Math (logic symbols). Home set like a paper (Definition 1 Γ ⊢ φ, Example 2 proof sheet,
Theorem 3 outcomes as judgements, Conjecture 4). Hero: a WebGL string model of the
helicoid–catenoid associate family (minimal surfaces: a membrane at rest), its equations as the
legend with a live θ; muon crossings kept. The console demo became a Gentzen-style proof sheet;
instrument windows are printed light windows used twice. Company blocks became a lemma wall
(conjectures for future work). Header: nav right, Anthropic-style collapse into the mark; footer
after Anthropic's with the catenoid as a bookend. Owner explicitly allowed going beyond the plan.
**Alternatives**: Keep the ultramarine system and restyle components only (rejected by the owner).
**Status**: Decided (owner instruction in session).

### D-129 — Owner-directed redesign, round 2: "field" (2026-10-01)
**Context**: The owner rejected round 1 (D-128) as messy: the logic notation (Γ ⊢ φ and the rest),
the theorem framing, the proof-sheet demo, the outcome symbols and the green palette all had to
go; the console and contact pages were to be redesigned; News, Research and About were acceptable.
Direction: minimal but creative, built from the original mumbrane.com figures.
**Decision**: Neutral palette (paper and ink, no green) with one accent, ice, for the path to an
answer, and three quiet status tones (sand, clay, lilac). Mona Sans for everything read and
clicked, Geist Mono for figure labels and data, the serif kept for article prose only. One diagram
vocabulary everywhere, after the original site: a filled dot is established, a hollow dot is
missing, the accent line is the path to an answer, a dashed line has no support, labels are
lowercase mono. Home hero: the original wireframe field, alive (Canvas 2D, server SVG still). How
Moth works: a pinned chain diagram of the purchasing example. Outcomes: one glyph each. Moth:
stacked layers. Console: top bar instead of the rail, entry and evidence redrawn in the
vocabulary. Contact and sales: dark page, address routes drawn as paths, form on a paper card.
**Alternatives**: Iterate on round 1 (rejected by the owner).
**Status**: Decided (owner instruction in session).

### D-130 — Footer wordmark fades out downward (2026-10-01)
**Context**: The owner asked for the giant footer wordmark to sit below the footer card and lose
opacity toward the bottom, after a reference. Rule 3 allows opacity on the wordmark but lists no
gradient fade.
**Decision**: The wordmark keeps one uniform colour (currentColor at low opacity); the fade is a
CSS mask on its wrapper, so the logo's paths, proportions and fill are untouched. The footer card
sits on the deep surface with six columns: Solutions, Company, Developer, Enterprise, Legal, Social.
**Alternatives**: Plain uniform opacity (does not match the owner's reference); cropping the
wordmark at the page edge (not requested).
**Status**: Decided (owner instruction in session).

### D-131 — Butterfly curve back in the Moth hero (2026-10-01)
**Context**: D-129 replaced Moth's Fig. 1 (Fay's butterfly curve, ca24aa5) with LayerStack. The
owner asked for the butterfly figure with its equations back on /moth.
**Decision**: Restore `MothCurve`, `src/lib/art/curves.ts` and its unit tests unchanged, in the
hero's figure slot. LayerStack stays for the dev lab; the hero's layer copy is removed.
**Alternatives**: Show both figures on /moth (not asked; crowds the hero).
**Status**: Decided (owner instruction in session).

### D-132 — One corner radius across the site (2026-10-01)
**Context**: Seven radii were in use (2, 4, 8, 16, 28 px, pill, circle). The owner asked for every
pill and circle to become a box with the same curve everywhere, keeping the footer card as it is.
**Decision**: Every rounded HTML box computes to exactly 8 px (`rounded-md`); the footer card keeps
28 px (`data-footer-card`). 8, not 12: any radius ≥ half an element's height draws a pill, and the
smallest boxes (the 24 px button arrow chip) need r < 12 to read as boxes. SVG chips use rx 8 in
drawing units; the 10-unit outcome glyph boxes use 3.6 (the 22-unit chip's shape at their scale);
no SVG rect may have 2·rx ≥ its shorter side. Dots under 16 px still render round: 8 px clamps to
half their size. An e2e test measures every element and pseudo-element on every route.
**Alternatives**: 12 px (arrow chip and 24 px controls stay circles/pills); per-size radii (not
one value).
**Status**: Decided (owner instruction in session).

### D-133 — Site radius 10 px, footer card included (2026-10-01)
**Context**: After D-132 (8 px, footer 28 px) the owner asked for one value everywhere, the footer
card included, at 10 px.
**Decision**: `--radius-md` is 10 px and every rounded box uses it, the footer card too. SVG chips
use rx 10 in drawing units; the 10-unit outcome glyph boxes use 4.5 (10 × 10/22, the chip's shape
at their scale). Supersedes D-132's values; its method and the e2e measurement stand.
**Status**: Decided (owner instruction in session).

### D-134 — Copy rewritten around field-based intelligence (2026-10-01)
**Context**: The owner asked for every page to describe what Mumbrane builds — knowledge as the
shape of a field made by the data, reasoning as a question settling to equilibrium, priority
inputs as heavier charges — and to cut page copy roughly in half, keeping only what is relevant.
**Decision**: Owner-confirmed framing "method + direction" and "encoders place, definitions
decide": present tense for the method; Moth is "built to" settle questions; Preview 004 is the
first step (fixed compiled field, local BGE assets at compile time, native constraint reasoning).
Duplicated blocks removed (per-page outcome ledgers, limits grids, qualification and measured
tables outside /moth, the concept grid on /developers, the home news list, two use-case sketches,
the rulebook lists). Articles rewritten in their sources and regenerated. Marketing `<main>` text
went from 10,298 to 6,027 words (localhost, scratch counter).
Research basis, checked before writing: modern Hopfield networks retrieve by one-step settling
and attention is that update (Ramsauer et al. 2020, arXiv 2008.02217); mean shift converges to a
stationary point of the density, also with positive per-point weights (Comaniciu & Meer 2002);
EBM inference is argmin_Y E(X, Y) (LeCun et al. 2006). Not written as fact: literal electrostatics
(Earnshaw's theorem: fixed charges give no stable equilibrium, so "charge" stays a metaphor);
that Preview 004 settles or weights facts; how settling and definitions combine. Encoders are
known to be negation-blind (arXiv 2504.00584), hence "nearness is not meaning".
**Alternatives**: present tense for Moth (contradicts releases.md); pure similarity settling
(contradicts the audit ≠ inspection example).
**Status**: Decided (owner instruction in session). CONTENT.md §1 voice predates this framing.

### D-135 — Owner-directed font change: Source Serif 4, Fustat, Commit Mono (2026-10-01)
**Context**: The owner supplied a type system and asked for the fonts only (no colours, spacing,
layout, measures or casing). Roles: prose → serif, interface → sans, data → mono.
**Decision**: Source Serif 4 for headlines, ledes and body text (roman preloaded as the hero's LCP
face; italic instance not preloaded); Fustat for interface text (the body default); Commit Mono
v1.143 variable woff2 (`brand/fonts/`, SIL OFL licence alongside; not on Google Fonts, so
`next/font/local`) for labels, meta and code. Mona Sans and Geist Mono removed. Every serif size
class carries the serif and its weight through one base-layer role rule (Display 350, others 400;
−25 on ink/deep surfaces and the console's dark theme via `--serif-shift`, restated 0 on light
surfaces so nested cards reset); interface text at a prose size opts out with `font-sans` and
keeps Fustat's 400/500 unshifted. Line height and tracking of the serif
tokens follow the owner's spec (Display 1.02/−0.03em, Title 1.1/−0.02em, Heading 1.2/−0.01em,
Lead 1.45, Body 1.6); sizes unchanged. Weights limited to serif 350/400, Fustat 400/500, mono 400:
no bold headlines, `font-semibold` gone, prose `strong` renders as serif italic (italic is the only
emphasis; one italic accent word per headline allowed). Display headlines shift −0.04em for
optical alignment; inline code is 0.88em. Fallback metrics come from next/font (size-adjust).
Supersedes the family rows of DESIGN §3.1/§3.3 and D-129's "Mona Sans / Geist Mono".
**Alternatives**: the owner's full 8-style size scale, uppercase labels and colours (out of scope
by owner instruction); keeping Geist Mono (owner chose Commit Mono); renaming ~95 class uses to
carry the family per usage (the role rule does it in one place).
**Status**: Decided (owner instruction in session).

### D-136 — Headlines in heavy Fustat (2026-10-02)
**Context**: The owner judged the light serif headlines of D-135 weak and pointed at
anthropic.com (a heavy sans headline over serif reading text) as the target.
**Decision**: Every headline is Fustat: display sizes (`hero`, `display-xl`, `display-l`) at 700,
`display-m`, `display-s`, `title` and article h2/h3 at 600; `font-display` now means Fustat.
Ledes and body stay Source Serif 4 (with the −25 dark-ground shift); interface text stays Fustat
400/500. Fustat is now the only preloaded face (it carries the hero, the LCP element); the serif
roman is no longer preloaded. Italic accents apply to serif text only. Sizes, line heights and
tracking unchanged. Supersedes D-135's headline rows and the spec's "never bold a headline".
**Alternatives**: a heavier serif headline (not the reference's look).
**Status**: Decided (owner instruction in session).

### D-137 — Home hero: the membrane (2026-10-02)
**Context**: The owner asked for one widely recognised, sci-fi-feeling hero artifact that says what
Mumbrane builds (D-134: data shapes a field, a question settles to an equilibrium, priority inputs
pull harder) without breaking the paper, ink and one-accent look; "go all in at creativity".
Prototyped live in the dev hero (browser pane, no files) before planning. The owner chose the
rubber-sheet "spacetime fabric" as a borderless sheet (over the same sheet in a closed box, and
over field lines in a box), click/tap to drop a question, and "play once, then rest".
**Decision**: `FieldCanvas` (client) + `FieldStill` (server SVG, passed as children so its
2,000-step settle never re-runs on hydration) over `src/lib/art/field.ts` (the sheet, pure) and
`src/lib/art/scene.ts` (the timeline). Five facts dent a sheet pinned at |x|, |y| = 1: four light
Lorentzian wells and a priority well shaped as a softened 1/r. A 1/r³ pull (Lorentzian) makes
circular orbits unstable, so every orbit collapsed through the centre; the 1/r² pull of the
priority well gives the coin-funnel spiral. Questions roll under slope-normalised gravity with light
drag and a soft floor in each well; at rest needs low speed *and* a level slope (speed alone fired
at the top of every swing, up to 0.36 from any well). Tested: every drop on a 19 × 19 grid rests
within 0.01 of a well bottom; the opening is a spiral past a candidate, a light-well answer, a
second spiral. The opening plays once; then the loop sleeps (`createLoop.setAwake`) until a click,
a tap or the keyboard button, which announces where the question came to rest (`aria-live`).
Desktop: a layer behind the right of the hero, masked toward the text and the horizon; below
1024 px, in flow after the actions. Caption "Conceptual illustration…" (CONTENT §4); the canvas
shows no numbers. Not electrostatics: a ball on a sheet, so D-134's Earnshaw caveat holds.
**Alternatives**: the same sheet inside a closed-world box (prototyped; owner preferred no box);
field lines in a box (flatter, more textbook); keeping the previous field figure.
**Status**: Decided (owner instruction in session).

### D-139 — Paintings are plain oil: no scan slices or sorted blocks (2026-10-02)
**Context**: Reviewing /research, the owner asked what the "weird boxes" and stray lines on the hero
and Plates II–III were. They were DESIGN §8.2's Replay-style interventions, taken from the owner's
reference card: three pixel-sorted blocks and a band of scan slices, burnt into 5 of the 10
paintings. Rendered faithfully to the reference, but at display size the 1.6 px slice rules shrink
to hairlines and the blocks float free of the landscape, so both read as rendering faults; and
they appeared on some plates and not others.
**Decision**: Removed everywhere (owner's choice). `PaintingSpec` drops `slices`/`blocks`;
`scripts/paint.ts` sets `uSlices`/`uBlocks` to 0 for every painting (the protected range preset
still switches both on; the shaders are unchanged). Re-rendered research-hero, plate-field,
plate-preview, inquiry-dynamics and inquiry-causality; the other five came out byte-identical.
Alt text no longer describes them. Supersedes DESIGN §8.2's "Interventions" column and the
interventions in §8.1.
**Alternatives**: keep them on the /research hero only; keep as designed; redraw them bolder like
the reference card (changes the reference shader maths, which DESIGN §8.2 forbids).
**Status**: Decided (owner instruction in session).

### D-138 — How Moth works as a map of the field (2026-10-02)
**Context**: The owner found the home "How Moth works" section plain and hard to follow: a bare
chain of chips on black, unconnected to the membrane hero above it, with no key to its marks.
**Decision**: Owner-chosen "field map": the hero's field seen from above. The purchasing example
is drawn as a map (facts as wells, the supported answer as a basin, the unsupported path stopping
on flat ground) in a framed instrument panel (crop marks, dot screen, a live "02 / 05 · encode"
readout), over a section backdrop of equipotential rings and field lines; a legend names the four
marks; plainer step copy tied to the example (owner-approved); an eyebrow and a progress rail.
Honesty caption unchanged. Fixed on the way, each with a regression test: (1) Chromium does not
restyle a descendant matched through an SVG attribute selector (`path[pathLength]`) when an
ancestor attribute changes, so the old section's paths never redrew between steps; the draw rules
now select by class. (2) A `pathLength` dash measured against a non-scaling stroke stops short on
figures drawn larger than their viewBox (the home principle figure stopped at about 75 %); drawn
`.dg-accent` paths now measure in drawing units. (3) `usePinnedSteps` reports the pin's step on
creation, so a section below the fold starts at its first step instead of jumping back as it
pins (the Company blocks gain the same).
**Alternatives**: a metro-map version of the chain; today's chain with only the atmosphere added.
**Status**: Decided (owner instruction in session).

### D-140 — Hero figure: 15 % smaller, aligned to the grid, still under the pointer (2026-10-02)
**Context**: The owner asked for the membrane (D-137) 15 % smaller, aligned on the screen, and not
moved by the cursor: it sat right and low, bled off the right edge, and leaned with the pointer.
**Decision**: On the desktop layer the figure draws at 0.85 × its former scale, and its core (the
box around the five wells, funnel included) centres on the grid columns beside the copy — from
the copy's edge plus the column gap to the grid's content edge — and on the copy's vertical
middle, measured from the page on every resize (`aim` in field.ts; FieldCanvas `beside`). The
pointer lean and the slow camera drift are gone: only the scroll-away tilt moves it. The sheet now
fades softly at the screen's right edge and the hero's foot too. The server still (reduced motion,
no JS) uses the same shrink with an average aim, since it cannot measure the page. Phones unchanged.
**Alternatives**: a fixed share of the layer for the aim (off by up to 60 px across widths, since
the copy and the container do not scale with the layer); placing the canvas in the grid cell
(loses the full-bleed fade the owner chose in D-137).
**Status**: Decided (owner instruction in session).

### D-141 — How Moth works panel: square corners (2026-10-02)
**Context**: The owner asked for no rounded corners on the How Moth works instrument panel.
**Choice**: The panel frame drops `rounded-md`; border, ground and crop marks stay. A square box
passes D-133's measure (0 px is allowed); the definition cards drawn inside the SVG keep rx 10.
An e2e test pins the panel at 0 px.
**Alternatives**: squaring the inner cards too (not asked).
**Status**: Decided (owner instruction in session).

### D-142 — Page frame matches anthropic.com's container (2026-10-02)
**Context**: The owner asked for content squeezed toward the centre by exactly Anthropic's amount,
on every page. Measured live on anthropic.com (`.u-container`): `--site--width: 89.5rem`,
`--site--margin: clamp(2rem, 1.0816rem + 3.9184vw, 5rem)`, content = min(100vw, 1432) − 2 × margin
→ 311 / 673.2 / 909.13 / 1284.53 / 1272 px at 375 / 768 / 1024 / 1440 / 1920.
**Choice**: Supersedes DESIGN §4.1's 1440 px frame with 20 / 24 / 40 px padding. Two theme tokens,
`--container-site` (`max-w-site`) and `--spacing-edge` (`px-edge`, `-mx-edge`, `right-edge`), used by
`Container`, the header, the mobile nav and the hero figure's bleed and caption. Inner 12-column
grids, gaps and text measures are unchanged. The console app shell keeps its full-width layout.
The margin token is not named `site`: Tailwind resolves `max-w-*` from `--spacing-*` first, so a
shared name made `max-w-site` 80 px. `tests/unit/frame.test.ts` pins both facts.
**Alternatives**: a fixed narrower max-width (does not reproduce the fluid margin).
**Status**: Decided (owner instruction in session).

### D-143 — Header height matches anthropic.com's (2026-10-02)
**Context**: The owner found the header row sat too high and asked for Anthropic's, measured.
Measured live on anthropic.com/news (`SiteHeader…__header`): `padding: var(--sp-16) 0`, a 36 px
row on desktop (68 px in all) and a 32 px row on phones (64 px). Ours was a flat 56 px.
**Choice**: The header row is `h-16` (64 px) below `lg` and `h-17` (68 px) from `lg`, items
centred, so the 36 px button sits 16 px from the top on desktop, as Anthropic's does (14 px on
phones, where our button stays 36 px for its touch target). The phone menu's top bar is 64 px
too, so its close button lands where the open button was. An e2e test pins both heights.
Also: D-141's square panel carries `data-square`, the one exemption from D-133's rule that
framed boxes are rounded (that rule caught the panel; the exemption is the owner's request).
**Alternatives**: copying Anthropic's 32 px phone button (a smaller touch target).
**Status**: Decided (owner instruction in session).

### D-144 — Frame re-verified: anthropic.com's exact model on every page (2026-10-02)
**Context**: The owner asked to re-verify that every page aligns mathematically. A sweep of 36
routes × 13 widths (320–2560) in Chromium, with anthropic.com measured beside it in the same
browser, found D-142's frame off: 1/128–1/64 px at most widths (its rounded constants and
padding-based centring); 7–15 px narrower than theirs beside a classic scrollbar (Windows, Linux,
a Mac with a mouse) below 1447 px, because their frame is 100vw-based; the home hero's caption and
drop chip inset from the viewport edge, up to 540 px outside the frame above 1432 px; at 320 px
the narrower frame pushed the header's menu button 15 px past it and "Documentation" 17 px past it
(below 337 px); How Moth works centred its frame with flex, 1/128 px off the others at a quarter of
widths.
**Choice**: `.u-container`'s model verbatim: `--container-site: calc(min(89.5rem, 100vw) -
var(--spacing-edge) * 2)`, centred by `mx-auto`, no padding. The edge line is written with exact
binary fractions, `2rem + (100vw - 23.4375rem) * 3 / 76.5625`, because the CSS minifier rounds
their 16-digit decimals to six digits. `--spacing-inset` (100cqw inside an `@container`) puts the
hero's bleed, caption and drop chip and the menu sheet's rows on the frame. Header logo 16 px below
360 px; a soft hyphen in `DOCS.title` (Chromium never auto-hyphenates a capitalised word); How
Moth works centres with grid. Result: the same box as theirs at all 9,201 widths tested (300–2600,
¼ px steps); no frame off, no text outside the frame and no overflow on 31 pages, with and without
a classic scrollbar. `tests/unit/frame.test.ts` and `tests/e2e/frame.spec.ts` pin it.
**Alternatives**: the padding model (not their box beside a classic scrollbar); hiding the header's
CTA below 360 px (loses the primary action).
**Open**: the display headings' −0.04em optical shift lands the first letter's ink 3 px inside
(D) to 2 px outside (W) at 1440; exact alignment needs a per-glyph offset table. At exactly 320 px
the last "e" of /careers' "intelligence" (display-xl at its 52 px floor) inks 0.43 px past the
frame; a 51.2 px floor or a hyphen would fix it, both owner calls (type scale, copy).
**Status**: Decided (owner instruction in session).

### D-146 — Closing CTA bands: one component, actions on the text's last baseline (2026-10-02)
**Context**: The owner found the solution pages' closing actions misaligned and asked for them
closer together and the band slightly smaller, the same everywhere. Measured at 1728 px: the action
labels sat between the two lines of the paragraph beside them, because the row was bottom-aligned
by box, not by text. Careers, research, the solutions index and each solution page each had a
hand-copied version of the band, and the copies had drifted (gap-3 vs gap-6 vs gap-8, 48–52ch).
**Choice**: `CtaBand` (sections/) renders all four. The band aligns by last baseline, so the
action labels sit on the paragraph's last line. The actions are an `inline-flex` row inside a block,
because WebKit takes a last baseline only from a line box: a flex or grid row put the labels
5.5 px high in Safari (tested both engines, 1100–1728 px). Actions are 6 px apart (was 8–12). The
solution pages' text link is 44 px tall like the pills, with an 8 px left pad from `sm` so its
bare label has the room a pill's padding gives. New `band` rhythm on `Section`: 64/56 px on
desktop (was compact's 80/64), 56/48 px on tablet, so the band is 15 % shorter. An e2e test pins
baseline, height and gap on all four pages in Chromium and WebKit.
**Alternatives**: centring the actions on the paragraph (labels float between lines); first
baseline (actions align with the first line and hang below the text).
**Status**: Decided (owner instruction in session).
