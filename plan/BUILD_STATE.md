# Build state

Maintained by Claude. Read first in every session (and again after any context compaction).
Update after every task: tick the box, add a one-line note, commit.

## Phase table

| Phase | Name | Status | Started | Done | Commit / tag |
|---|---|---|---|---|---|
| P0 | Setup (`/setup`) | done | 2026-09-30 | 2026-09-30 | `p00-setup` |
| P1 | Foundations | done | 2026-10-01 | 2026-10-01 | `p01-foundations` |
| P2 | Platform: security, metadata, errors | done | 2026-10-01 | 2026-10-01 | `p02-platform` |
| P3 | Brand and chrome | done | 2026-10-01 | 2026-10-01 | `p03-chrome` |
| P4 | Motion system and art engine | done | 2026-10-01 | 2026-10-01 | `p04-motion` |
| P5 | Painting pipeline | done | 2026-10-01 | 2026-10-01 | `p05-paintings` |
| P6 | Home | done | 2026-10-01 | 2026-10-01 | `p06-home` |
| P7 | Moth and Models | done | 2026-10-01 | 2026-10-01 | `p07-moth` |
| P8 | Research and News | not started | | | |
| P9 | Company, Careers, Contact | not started | | | |
| P10 | Solutions | not started | | | |
| P11 | Developers, Pricing, Changelog, Status | not started | | | |
| P12 | Console preview | not started | | | |
| P13 | Legal, llms.txt, OG images, completeness | not started | | | |
| P14 | QA, hardening, polish, final report | not started | | | |

Status values: `not started` · `in progress` · `blocked (reason)` · `done`.

## Current focus
- Phase: P8 (not started)
- Next task: P8 Research and News (articles, /md alternates)

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

### P2 — Platform: security, metadata, errors
- [x] 1 proxy + CSP + headers (P0, SECURITY §4 verbatim) — security.spec now runs over every built registry route; robots.txt added to static-header checks (/paintings image in P5)
- [x] 2 json-ld.tsx + Organization/WebSite on `/` (`homeJsonLd()` in seo.ts)
- [x] 3 `src/lib/inline.ts` + `<Inline>` — linear-time (precomputed next-marker tables), 20k adversarial inputs < 50 ms
- [x] 4 params.ts (P0) + params.test.ts (hostile values, arrays, objects, 10 kB)
- [x] 5 `src/lib/seo.ts` pageMetadata/routeMetadata + seo.test.ts (titles ≤ 60, descriptions ≤ 160)
- [x] 6 robots, sitemap, manifest, security.txt (Expires 2027-09-30, valid), not-found, error, global-error
- [x] 7 `src/content/routes.ts` registry (all routes incl. solution/legal slugs; article slugs join in P8)
- [x] 8 Legacy redirects incl. `/:path*.md` (Next accepts the pattern; e2e-checked, 308)

### P3 — Brand and chrome
- [x] 1 `Mark`/`Lockup`/`Wordmark` (`src/components/brand/`): weight auto, non-scaling hairline floor ≤ 48 px (D-108), CSS draw-on (`draw` / `.draw-on-reveal`), always `aria-hidden` (named by context)
- [x] 2 `Header` (client): surface sampling (1 px IO line + MutationObserver on main), backdrop after 8 px, collapse with 80/24 px hysteresis via sentinels (no scroll listener), disclosure mega menus (click, 120 ms hover intent, Esc → trigger, outside click, focus-out)
- [x] 3 `MobileNav`: native modal `<dialog>` (trap, Esc, inert, focus return), `html:has()` scroll lock, `<details name>` accordions, CTAs pinned
- [x] 4 `Footer`: six columns (CONTENT §2.2), legal row, giant wordmark rise + lockup draw-on via `InView` (D-109)
- [x] 5 `(site)/layout.tsx`: skip link, header, `main#main`, footer (SmoothScroll slot in P4); 404 renders its own chrome

### P4 — Motion system and art engine
- [x] 1 Motion core (`src/components/motion/`): `load.ts` (GSAP after load+idle), `gsap.ts` (ScrollTrigger, CustomEase, mb.* eases), `SmoothScroll` (Lenis on gsap.ticker; route change → top + focus H1), `Reveal` (+stagger), `SplitReveal`, `ScrubText`, `usePinnedSteps`, `useReducedMotion`, `InView`
- [x] 2 WebGL engine (`src/lib/gl/`): `createGL`/`program`/`setUniforms`/`drawFullscreen`, `createLoop` (fps cap, 50 ms clamp, pause w/o time jump — unit-tested), tier + DPR cap, `colors.ts` (= palette)
- [x] 3 `MembraneCanvas`: shader via `scripts/shaders.ts` (byte-exact copy, tested), CSS field until first frame, IO/visibility pause, pointer lerp, reduced motion = one frame at t 2.0, context-loss fallback (poster image joins in P5)
- [x] 4 Art (`src/components/art/`): Guilloche (band/rosette/border, `src/lib/art/guilloche.ts`, tested), CropMarks, RegistrationMark, SpectralStrip, EvidenceSeal (draw-on via InView), `dot-screen` utility
- [x] 5 `InstrumentWindow` + `InstrumentStack`
- [x] 6 `/lab/motion` (3 seeds, every primitive, CSP counter; D-111)
- Measurements (2026-10-01, dev server, headless Chromium 1440×900): scroll FPS below canvases ≥ 55 (asserted); with 3 software-GL canvases ≈ 48 (recorded, SwiftShader); CLS from motion 0; GPU timer not exposed headless → not measurable. Prod first-load JS on `/` 161.3 KB (budget 220), CSS 13.3 KB; GSAP/Lenis never before `load` (asserted).

### P5 — Painting pipeline
- [x] 1 Shaders byte-exact via `scripts/shaders.ts`; registry `src/content/paintings.ts` (integer seeds, alt text, optional scene `palette`)
- [x] 2 `scripts/paint.ts`: reference harness + SwiftShader flags + width/1440 scaling; hash-skip (2nd run no-op); ~68 s for all ten
- [x] 3 `scripts/images.ts`: AVIF (q stepped from 62 to fit budget) + WebP q78 at 640/1024/1600/2400, median-cut palette, 24 px LQIP → `paintings.manifest.json` + `src/app/lqip.css` (byte-identical re-runs)
- [x] 4 `Painting` (`<picture>`, explicit size, LQIP class, `fit` width|cover); poster fallback in `MembraneCanvas` via a server-rendered prop
- [x] 5 `Plate` (Roman number, mono date, crop marks, real seed, spectral strip; reveal + hover in CSS; stretched title link)
- [x] 6 Ten images: 4 research/news plates, 3 inquiry (4:5), research hero (21:9), company plate, membrane poster. Reviewed full size + in plates at 1440/375. Re-seeded: inquiry-causality 37 → 44; company-plate given an evening palette (every meadow seed shares one composition, so a re-seed could not separate it from plate-wording).
- 1600 w AVIF sizes (budget 180 KB / poster 120 KB): research-hero 68 · plate-field 96 · plate-wording 111 · plate-evidence 79 · plate-preview 73 · inquiry-representation 176 · inquiry-dynamics 146 · inquiry-causality 143 · company-plate 100 · poster 25 (KB, all q62)

### P6 — Home
- [x] Sections 1–9 (PAGES §1) in `src/app/(site)/page.tsx`; copy in `src/content/home.ts`; figures via `src/content/claims.ts` (claims.test.ts: verbatim in releases.md + forbidden patterns)
- [x] Hero (`HomeHero`): membrane + CSS field + poster fallback, scrim, CSS entrance, SCROLL hint; slides under the header
- [x] Principle ScrubText + outcome chips; `MothDemo` pinned 120 vh (5 steps, final state everywhere else); Evidence (`OutcomeLedger` + EvidenceSeal); Compounding (guilloche band); Research plates; Current release (`SpecTable`); News (`NewsList`); Get started (cadmium)
- [x] Rhythm pass: surface sequence ultramarine · paper · ink · paper · paper-2 · paper · ink · paper · cadmium; header themes over each; reveal timings checked in step captures
- Measured (prod, `pnpm test:perf`): first-load JS on `/` 170.9 KB (budget 220), CSS 17.4 KB; mobile (4× CPU, Fast 4G) LCP 930–953 ms, CLS 0, no long task > 200 ms; desktop LCP = H1 (D-112); axe clean; overflow 0 at 320 and 1440 (with motion)

### P7 — Moth and Models
- [x] `/moth` — 11 sections per PAGES §2 (hero window, pipeline FIG. 01, purchasing explainer, 7-outcome ledger + boundaries, `#evidence`, `#language-contract`, `#qualification`, measured, inspect (retained failure as caveat note), `#prepared-base` (Proposed), get the preview); copy verbatim from moth.md/releases.md in `src/content/moth.ts`
- [x] `/developers/models` — model card + shared modules (`LanguageContract`, `OutcomeLedger`, `Qualification`) + "Moth Base — Proposed"
- [x] New shared UI: `CodeBlock` (+`CopyButton`), `DataTable`, `Note`, `Tag`, `Pipeline`, `PurchasingExplainer`; `keepNumberUnits`
- [x] Claims: every figure in `claims.ts` (limits, qualification, measurements); limits grid checked against its claim lines; claims audit 2026-10-01 passed
- Measured (prod): first-load JS /moth 165.9 KB, /developers/models 163.5 KB (budget 190); /moth mobile LCP 861 ms, CLS 0.0004

## Handoff notes
<!-- ≤ 10 lines per phase: what exists, where, gotchas, follow-ups. Newest first. -->

### P7 — 2026-10-01
- Evidence tables and code blocks never scroll horizontally (two-column tables wrap; code wraps with `pre-wrap`): a scroller would need a focusable region (axe `scrollable-region-focusable`) and a suppression. Keep new tables ≤ 2–3 columns or revisit.
- `scripts/guard.ts` no longer flags brand `violet`/`violet-*` tokens (only numeric default shades like `violet-500`).
- Outcomes `incomplete`/`incompatible` have minimal wording: the source only names them (owner may refine).
- `MOTH.purchasing` audit-mode reasons are authored for the explanatory example (labelled "Explanatory example").

### P6 — 2026-10-01
- Reusable section components in `src/components/sections/`: `OutcomeLedger`, `SpecTable`, `NewsList`, `MothDemo`, `HomeHero` — reuse on /moth, /news, /developers.
- Articles now carry `plate` + `plateNumber` (I–III on home per CONTENT; Introducing = IV). Outcomes carry `meaning`/`next` (`CORE_OUTCOMES` = the five).
- Pinned sections always render their *final* state server-side; the pin (desktop + motion) steps them back. Full-page shots show step 1 + the spacer — review pins with viewport step captures.
- Anything hidden-until-a-step must not translate outside its container (8 px overflow regression; `overflow-x-clip` on the section; chrome.spec checks 1440 with motion).
- Hero LCP rules (D-112): below 1024 px hero text lifts without fading; H1 lines are block masks only from 1024 px.
- `pnpm verify` now ends with `pnpm test:perf` (serial, D-113).

### P5 — 2026-10-01
- `pnpm art` = `node scripts/paint.ts && node scripts/images.ts`; `--only <id>` / `--force` on paint. Stamps live in `.cache/paintings/*.hash|*.enc.json` (not committed): a fresh clone re-renders everything (~3.5 min) but produces the same files.
- Generated files are excluded from Biome (`lqip.css`, manifest, `src/shaders`) — a formatter pass would make them drift from their generators (a test compares `lqip.css` with its generator).
- `painting(id)` (`src/content/paintingsData.ts`) joins registry + manifest; never import it into a client component (ships every LQIP) — pass rendered `<Painting>` as a prop instead.
- The sky scene's warm horizon lights at the right edge are intended (board `plate-1.png` has them).
- Plate titles keep hyphenated compounds together (`TitleText`).

### P4 — 2026-10-01
- Every motion component awaits `loadMotion()`; never import `./gsap` statically from a component (it would enter first-load JS — `perf.spec` catches it via the `._gsap` marker).
- Reveals skip boxes already on screen (`alreadySeen`) so nothing seen is re-hidden; start states only under `MOTION_OK`.
- Pins: `usePinnedSteps` gives the GSAP pin-spacer the section's background (else paper shows through).
- Shots now scroll a viewport at a time (so InView/ScrollTrigger reveals fire); tests use `settled()` / `network().quiet()`.
- Biome suppression budget: 1 of ≤ 3 used (D-110, `gl.useProgram`).
- Follow-up P14: font-swap CLS ≈ 0.0016 from JetBrains Mono (not preloaded) — consider `display: 'optional'` for the mono face if route CLS approaches 0.02.
- New CSS file `src/app/art.css` (field, dot-screen, seal, instrument body).

### P3 — 2026-10-01
- Nav copy: `src/content/nav.ts` (typed against the registry); article metadata `src/content/articles.ts` (bodies in P8) feeds `REGISTRY` (= `ROUTES` + article routes). Header seeds its surface from `SURFACE_TOP` (registry `surfaceTop`) so the first paint is themed.
- Chrome motion is CSS in `src/app/motion.css` (`@layer components`); prose in `src/app/prose.css`. `globals.css` must stay < 400 lines (budget) — new component CSS goes in those files.
- Gotchas: a class like `hidden` passed to `Button` loses to its own `inline-flex` — wrap instead. `animation` shorthand on `… path` out-ranks later delay rules of lower specificity. `InView` uses threshold 0.25 (no bottom margin) so page-end boxes can reveal.
- Links in hidden panels use `SmartLink prefetch={false}` (all pages are dynamic: each prefetch is a server render).
- e2e: `settled(page)` (no running animations) before axe/screens; `network(page).quiet()` instead of `networkidle`; console tolerance for RSC prefetches of *unbuilt* registry routes (`UNBUILT`, self-expiring; unit-tested). `/lab` now mounts the real header over all five surfaces.
- Known until P6: `/` placeholder is paper while its registry surfaceTop is ultramarine → header SSR-paints ultramarine, corrects on hydration.
- Follow-up: total built JS 193.8 KB gzip (all chunks) — per-route first-load measured in `perf.spec` (P4/P14); watch the 190 KB marketing budget.

### P2 — 2026-10-01
- Registry `src/content/routes.ts` lists the whole site now; e2e `ROUTES` = registry ∩ existing `page.tsx` (fs walk in `tests/e2e/utils.ts`), so suites grow as pages land. `routeMetadata(path)` gives any page its title/description/canonical/OG.
- Error boundaries use Next 16.3's stable `retry` prop (not `reset`). They render no error details.
- Next writes the root canonical as `https://mumbrane.com` (no slash); tests compare parsed URLs.
- Follow-ups: 404 gets the 320 px mark + draw-on in P3 (needs `<Mark>`); manifest colours move to `src/lib/gl/colors.ts` in P4; article slugs + `lastModified` join the sitemap in P8; `links.test.ts` already walks every content module.
- The `(site)` layout (header/footer) arrives in P3; the 404 renders without chrome until then.

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
- Claims audits: 2026-10-01 (P7) — claims.test green; every figure on / , /moth, /developers/models traced to releases.md; labels present (Explanatory example, Proposed, Illustrative); no forbidden words
- Trusted Types trial: —
- Dependency changes / advisories: —

## Final report
<!-- Written in P14 using the template in QUALITY §7. -->
