# Mumbrane web — build plan

Owner intent (verbatim essentials): *frontier-lab quality website for Mumbrane (closed-world
intelligence; first model Moth, constraint-based). Pure frontend/UI now; Neon backend later.
Security is the top priority. Design on par with frontier design studios; colour is the main
thing — not dull, not neon, psychologically intriguing. Möbius logo used exactly as supplied.
Inspirations: typesafe.ai (monochrome terminal boxes, sparingly), generalintelligencecompany.com
and cofounder.co (smooth scroll motion; no pixel art), mistral.ai (building blocks that unlock as
you scroll — on the Company page), topiary × Nous (data + myth + interface), anthropic.com
(footer, main design, the wordmark that collapses on scroll). Research page uses painterly
images, hard-coded to look like paintings. The console must be the simplest possible to use.
Claude builds everything via /setup and /go, without subagents. Not a 1000-module build.*

This file is the source of truth for **what** to build and **in which order**. The how lives in
DESIGN / PAGES / CONTENT / CONSOLE / SECURITY / QUALITY. Phases run strictly in order; each has
tasks, deliverables and exit criteria. Tick tasks in `BUILD_STATE.md` as you go.

---

## Budgets (enforced by `pnpm budgets` and e2e)

| Budget | Limit |
|---|---|
| Source files in `src/`, `scripts/`, `tests/` (excl. `src/content/source/**` and generated files: `mark-geometry.ts`, `paintings.manifest.json`, `src/app/lqip.css`) | ≤ 230 (planned ≈ 200) |
| Files in `src/components/` | ≤ 80 (planned ≈ 70) |
| Direct runtime / dev dependencies | ≤ 8 / ≤ 11 (exactly the allowlist) |
| First-load JS per route (scripts loaded before `load`), compressed | marketing ≤ 190 KB · home ≤ 220 KB · console ≤ 230 KB — motion libraries load after first paint (DESIGN §7.0) |
| CSS, compressed, total | ≤ 60 KB |
| Font files / bytes | ≤ 5 files · ≤ 270 KB total; ≤ 2 preloaded (Newsreader roman + Host Grotesk, ≤ 160 KB) |
| Hero poster / each painting (1600w AVIF) | ≤ 120 KB / ≤ 180 KB |
| Core Web Vitals (Moto-G-class, 4G emulation) | LCP ≤ 2.0 s · CLS ≤ 0.02 · INP ≤ 150 ms (field target; lab proxy: no long task > 200 ms after load) |
| Hero WebGL | ≤ 4 ms GPU/frame at 1440p on M1-class; DPR cap 1.5; paused off-screen |

Directory depth under `src/` ≤ 4. No barrel (`index.ts` re-export) files. No file > 400 lines
(split by responsibility, not by line count games).

---

## Route map (all phases together)

| Route | Phase | Notes |
|---|---|---|
| `/` | P6 | Home |
| `/moth` | P7 | Model page |
| `/research`, `/research/[slug]` | P8 | Painted plates |
| `/news`, `/news/[slug]` | P8 | |
| `/company` | P9 | Mistral-style unlocking blocks |
| `/careers`, `/contact`, `/contact/sales` | P9 | Forms are UI-only (no backend) |
| `/solutions`, `/solutions/[slug]` | P10 | business, customer-support, legal, security, use-cases |
| `/developers`, `/developers/docs`, `/developers/models` | P7 (models), P11 | |
| `/pricing`, `/changelog`, `/status` | P11 | |
| `/console`, `/console/playground`, `/console/keys`, `/console/usage`, `/console/settings` | P12 | noindex |
| `/legal/[slug]` | P13 | terms, enterprise-terms, privacy, cookies, privacy-choices, responsible-disclosure |
| `/md/[...path]` | P8/P13 | markdown alternates of articles and key pages (text/markdown) |
| `/llms.txt`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/.well-known/security.txt` | P2/P13 | |
| `/lab` | P1 | dev-only component lab; 404 in production |

Legacy URLs from the current mumbrane.com are kept alive with permanent redirects (P2, PAGES §0.6):
`/releases` → `/moth#evidence`, `/privacy` → `/legal/privacy`, `/terms` → `/legal/terms`,
`/login` → `/console`, `/<path>.md` → `/md/<path>` (if the pattern is supported; see PAGES §0.6).

---

## P0 — Setup (executed by `/setup`)

Goal: a running, secure, empty shell with the brand wired in and every gate green.

### P0.files
Exact security-relevant contents are in SECURITY.md; everything else follows these specs.

- **package.json** — `"type": "module"`, `"private": true`, `packageManager: "pnpm@<resolved>"`,
  `engines: { node: ">=24" }`, exact versions only.
- **pnpm-workspace.yaml** — SECURITY §5.2 verbatim (supply-chain hardening).
- **tsconfig.json** — strict set: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `erasableSyntaxOnly`,
  `allowImportingTsExtensions`, `noEmit`, `isolatedModules`, `resolveJsonModule`, `skipLibCheck`,
  `moduleResolution: "bundler"`, `module: "esnext"`, `target: "ES2023"`, `lib: ["dom","dom.iterable","ES2024"]`,
  `paths: { "@/*": ["./src/*"] }`, `plugins: [{ "name": "next" }]`; include `src`, `scripts`,
  `tests`, `*.config.ts`, `.next/types/**/*.ts`; exclude `brand`, `reference`, `node_modules`.
  Next's first build adds `allowJs`, `incremental`, `esModuleInterop` and the
  `.next/dev/types/**/*.ts` include (verified with Next 16.3.8 + TypeScript 7.0.2, which build and
  type-check cleanly together): accept those, keep every strict flag above.
- **next.config.ts** — `poweredByHeader: false`, `reactStrictMode: true`, `typedRoutes: true`,
  `images: { unoptimized: true }` (images are pre-optimised at build; no `/_next/image` attack
  surface), `productionBrowserSourceMaps: false`, `headers()` returning the static security
  headers from `src/lib/security/headers.ts` for `/:path*` (CSP itself is set in `src/proxy.ts`).
  No `cacheComponents`/PPR (incompatible with nonce CSP — SECURITY §3.3).
- **postcss.config.mjs** — `{ plugins: { "@tailwindcss/postcss": {} } }`.
- **biome.json** — Biome 2: formatter (2 spaces, width 110, single quotes, no semicolons,
  trailing commas), linter `recommended` + domains `next`, `react`, `project`; errors for
  `security/noDangerouslySetInnerHtml` (override off only for `src/lib/security/json-ld.tsx`),
  `security/noGlobalEval`, `correctness/useExhaustiveDependencies`, `a11y` recommended; warn
  `suspicious/noConsole` (allow error/warn). **Ignore `.claude/`** (protected: Claude can't
  reformat it, so linting it would deadlock the build), `brand/`, `reference/`, `public/`,
  `.next/`, `.cache/`, `.shots/`, `src/content/source/`. Set `css.parser.tailwindDirectives: true`
  (without it Biome fails to parse `@theme`; verified on Biome 2.5). Validate keys against the installed schema (`$schema` from
  `node_modules/@biomejs/biome`; Biome ≥ 2.5 deprecates `rules.recommended` in favour of a preset
  key — run `pnpm exec biome migrate --write` if it says so); never weaken a rule to pass.
- **playwright.config.ts** — `testDir: tests/e2e`; production runs on its own port so a running
  dev server can never be mistaken for it: `const prod = !!process.env.E2E_PROD; const port = prod ?
  3100 : 3000`; `webServer: { command: prod ? 'pnpm start --port 3100' : 'pnpm dev', url:
  'http://localhost:' + port, reuseExistingServer: !prod, timeout: 180_000 }`; `use.baseURL` = the
  same URL;
  projects: `chromium` (desktop 1440×900), `mobile` (390×844, isMobile, hasTouch, chromium),
  `webkit` (desktop, only tests tagged `@smoke`), `shots` (only `shots.spec.ts`), `og` (only
  `og.spec.ts`, 1200×630); `use.trace:
  'retain-on-failure'`; reporter `list`.
- **.gitignore** — node_modules, .next, .env*, !.env.example, test-results, playwright-report,
  .shots, .cache, *.tsbuildinfo, .DS_Store, .claude/settings.local.json (personal approvals).
- **.env.example** — `NEXT_PUBLIC_SITE_URL=https://mumbrane.com` and
  `NEXT_PUBLIC_BACKEND_ENABLED=false` (plus commented, empty future server vars from SECURITY §8).
- **src/lib/env.ts** (public, Zod-parsed) and **src/lib/env.server.ts** (`import 'server-only'`,
  future Neon vars, all optional) — exact code in SECURITY §8.
- **src/lib/cx.ts** — 10-line `cx(...parts)` joiner (no dependency).
- **src/app/fonts.ts** — `next/font/google`, latin subset, `display: 'swap'`, four instances:
  `Newsreader` roman (`style: ['normal']`, `axes: ['opsz']`, `variable: '--font-newsreader'`,
  preload), `Newsreader` italic (`style: ['italic']`, no extra axes, `variable:
  '--font-newsreader-italic'`, `preload: false`), `Host_Grotesk` (`--font-host-grotesk`, preload),
  `JetBrains_Mono` (`--font-jetbrains-mono`, `preload: false`). Export `fontVars` (the four
  `.variable` class names joined). next/font self-hosts at build: zero runtime requests to Google
  (verified in e2e network log). Measured sizes ≈ 132 + 65 + 20 + 40 KB (DESIGN §3.1).
- **src/app/layout.tsx** — `<html lang="en" data-surface="paper" className={fontVars}>`; reads
  `(await headers()).get('x-nonce')` (this makes every page dynamic, required for nonces);
  metadata base from env; skip link target `#main`.

### P0.scripts (package.json)
```
dev            next dev
build          next build
start          next start
typecheck      tsc --noEmit
lint           biome check .
format         biome format --write .
test:unit      node --test "tests/unit/**/*.test.ts"
test:e2e       playwright test --project=chromium --project=mobile --project=webkit
guard          node scripts/guard.ts
budgets        node scripts/budgets.ts
brand          node scripts/brand.ts
art            node scripts/paint.ts && node scripts/images.ts
og             playwright test --project=og
shots          node scripts/shots.ts
verify:fast    pnpm typecheck && pnpm lint && pnpm guard && pnpm test:unit
verify         pnpm verify:fast && pnpm budgets && pnpm build && E2E_PROD=1 pnpm test:e2e
```

### P0.scripts-spec
- **scripts/brand.ts** — copy `brand/logo/{mumbrane-mark,mumbrane-mark-compact,mumbrane-lockup,
  mumbrane-wordmark}.svg` → `public/brand/`; `brand/icons/*` → `public/` (favicon.ico, icon.svg,
  apple-touch-icon.png) and `public/icons/` (192/512/maskable); `brand/og-default.png` →
  `public/og/default.png`. Parse the SVGs (regex on `d="…"`, `viewBox`, stroke widths) and write
  `src/components/brand/mark-geometry.ts` exporting `MARK = { viewBox, struts: string[], band,
  rim, weights: { display: {edge, strut}, compact: {edge, strut} } }`, `WORDMARK = { viewBox,
  transform, letters: { char, d }[] }` and `LOCKUP = { viewBox, markTransform, wordmarkTransform }`
  (read from the `transform` attributes of `g.mb-mark` / `g.mb-wordmark` in the lockup file), with
  a header comment "GENERATED — do not edit". Idempotent (byte-identical output on re-run). The
  LOCK.json geometry digest is `sha256(all d="…" values in document order joined by "\n")`.
- **scripts/guard.ts** — whole-repo version of `.claude/hooks/guard-write.mjs` rules over `src/`,
  `scripts/`, `tests/`, `public/` (skipping `src/content/source/**` and binary files; like the
  hook, `tests/**` and `scripts/guard.ts` itself get only the credential, import-allowlist and
  protected-write checks, because they legitimately contain hostile fixtures and the rules), plus:
  `next.config.ts` has `poweredByHeader: false` and `images.unoptimized: true`; no file imports a
  package outside the allowlist (bare specifiers checked against `package.json` deps and Node
  built-ins); `.env.example` sets `NEXT_PUBLIC_BACKEND_ENABLED=false`; no database client is
  imported; `dangerouslySetInnerHTML` appears only in `src/lib/security/json-ld.tsx`. Exit 1
  with a findings list (file:line — rule — fix hint).
- **scripts/budgets.ts** — counts files per Budgets table; compares `package.json` deps with
  `.claude/allowed-deps.json` (no extras, exact versions, no `^`/`~`); after a build, reads
  `.next` static chunks to report total JS and CSS sizes (gzip via `node:zlib`) and fails over
  budget. Per-route JS is measured in e2e (`perf.spec.ts`).
- **scripts/shots.ts** — `pnpm shots / /moth …` → runs Playwright project `shots` with
  `SHOTS_ROUTES` env; writes `.shots/<route>/<width>.png` for 375, 768, 1440 (full page, reduced
  motion **off** and a second set with reduced motion **on** at 1440), prints the file paths.

### P0 exit criteria
- `pnpm verify:fast`, `pnpm build`, `pnpm test:e2e --grep @security` green; `pnpm audit --prod`
  clean; brand lock test green; placeholder page screenshots reviewed.

---

## P1 — Foundations

Read: DESIGN §2–§5, §9 (tokens, type, layout, components), SECURITY §4.4 (links).

Tasks
1. `globals.css`: tokens (verbatim), base layer (html/body colours from surface vars, font
   smoothing rules, `text-rendering`, selection colour, `:focus-visible` ring spec, scrollbar
   gutter stable, reduced-motion global rule), typographic defaults (DESIGN §3.4 details).
2. Layout primitives: `Container` (max 1440 with 40/24/20 px gutters), `Section` (sets
   `data-surface`, vertical rhythm presets, `aria-labelledby`), `Grid` (12-col).
3. Type components: `Eyebrow` (mono label), `Heading` (maps level→scale token, balance),
   `Prose` (article typography for blocks), `Numeral` (tabular figures).
4. UI primitives: `Button` (primary pill, secondary ghost pill, ink, text-link with arrow chip;
   sizes md/lg; loading/disabled), `SmartLink` (internal via next/link with typed routes;
   external → allowlisted domains only, `rel="noopener noreferrer"`, visually marked ↗),
   `Chip`/`StatusChip` (Moth outcomes), `Field`/`TextArea`/`Select`/`Checkbox` (labels, hints,
   errors, `aria-describedby`), `Divider` (hairline + optional tick marks), `Kbd`, `Icon`
   (inline SVG set of ≤ 24 icons drawn on a 20-px grid, 1.5 px stroke — DESIGN §9.9).
5. `src/app/(dev)/lab/page.tsx`: every primitive in every state on every surface; `notFound()`
   when `NODE_ENV === 'production'`.
6. Unit tests: `cx`, contrast table from `brand/palette/palette.json` (all pairs used by
   surfaces ≥ 4.5:1 for text), inline-markup parser (see P2 task 3).

Exit: lab screenshots at 3 widths reviewed on paper, paper-2, ink, ultramarine, cadmium
surfaces; keyboard focus visible on every control; `pnpm verify` green.

---

## P2 — Platform: security hardening, metadata, errors

Read: SECURITY (all), CONTENT §6 (SEO), QUALITY §3.

Tasks
1. Finalise `src/proxy.ts` + `csp.ts` + `headers.ts` per SECURITY §3; e2e `security.spec.ts`
   asserts every header on HTML, JS, CSS, image and 404 responses; zero `securitypolicyviolation`
   events on every route (listener injected with `page.addInitScript`).
2. `json-ld.tsx` (the only `dangerouslySetInnerHTML`, escaping `<`, `>`, `&`, U+2028/2029) +
   Organization/WebSite schema on `/`.
3. `src/lib/inline.ts`: safe inline markup parser for content strings (`**bold**`, `*em*`,
   `` `code` ``, `[text](href)` with hrefs checked by `toSafeHref`) → a small typed AST
   (linear-time, no RegExp backtracking on user-controlled lengths); `src/components/ui/Inline.tsx`
   renders the AST to React nodes. No HTML ever. Unit-tested incl. hostile inputs.
4. `src/lib/security/params.ts`: Zod parsers for all search params used anywhere
   (`/contact?interest=…` enum). Unknown/invalid → ignored, never reflected.
5. `src/lib/seo.ts`: `pageMetadata({ title, description, path, ogImage })` → Next `Metadata`
   with canonical, OG, Twitter; title template `%s — Mumbrane`.
6. `robots.ts` (disallow `/console`, `/lab`), `sitemap.ts` (from the route registry),
   `manifest.ts`, `public/.well-known/security.txt` (created in P0; verify per SECURITY §9.1),
   `not-found.tsx`, `error.tsx`,
   `global-error.tsx` (on-brand, no stack traces, a way home).
7. `src/content/routes.ts`: single registry of routes (path, title, nav group, sitemap flag,
   noindex flag) used by header, footer, sitemap and tests.
8. Legacy redirects in `next.config.ts` `redirects()` (PAGES §0.6), each covered by an e2e check.

Exit: e2e security suite green on dev and production builds; `securityheaders`-grade A+
equivalent (all headers present, CSP without unsafe-*); unit tests for csp/inline/params green.

---

## P3 — Brand and chrome

Read: DESIGN §6 (logo), §7.1 (wordmark collapse), §9.1–§9.3 (header, menus, footer),
CONTENT §2 (navigation and footer), PAGES §0 (global).

Tasks
1. `Mark`, `Lockup`, `Wordmark` from `mark-geometry.ts`: size presets, `weight` auto (compact
   below 200 px rendered width, display above), `vector-effect: non-scaling-stroke` only for the
   compact weight at ≤ 48 px tall, `title` for a11y, `aria-hidden` when decorative, `draw` prop
   for the stroke draw-on (DrawSVG; reduced motion → static).
2. `Header`: layout, surface-aware theming (reads the `data-surface` under it via
   IntersectionObserver), sticky with backdrop after 8 px, **wordmark collapse** (DESIGN §7.1),
   mega menus (Solutions, Developer, Company) as accessible disclosure panels (not ARIA
   menus), direct links (Pricing, News, Research), CTAs (Contact sales, Try for free).
3. `MobileNav`: full-height sheet, focus trap, `Esc` closes, body scroll lock, accordion groups,
   CTAs pinned at bottom; opens from a 44×44 button.
4. `Footer`: Anthropic-inspired ink footer with the six columns in CONTENT §2.2, lockup, tagline,
   social links, legal row with "Privacy choices", and the giant wordmark reveal (DESIGN §7.8).
5. `(site)/layout.tsx`: skip link, header, `<main id="main">`, footer, `SmoothScroll` provider
   slot (implemented in P4; no-op until then).

Exit: header/footer screenshots on paper and ultramarine surfaces at 3 widths; collapse works
both directions with hysteresis; menus fully keyboard operable (Tab, Shift+Tab, Esc, arrows
optional); axe clean; reduced motion → instant collapse (no animation); `pnpm verify` green.

---

## P4 — Motion system and art engine

Read: DESIGN §7 (motion + signature moments), §8 (imagery engine), reference/shaders/README.md.

Tasks
1. Motion core (`src/components/motion/`): `SmoothScroll` (Lenis driven by `gsap.ticker`,
   ScrollTrigger sync, disabled for reduced motion and when `pointer: coarse`), `gsap.ts`
   (client-only; registers ScrollTrigger + CustomEase and the named eases of DESIGN §7.0;
   default ease `expo.out`). SplitText, DrawSVGPlugin and Flip are imported and registered only
   in the modules that use them, so routes that don't need them don't ship them. `useReducedMotion`,
   `Reveal` (fade/rise on enter), `SplitReveal` (lines/words; must produce **zero CSP
   violations** — if GSAP SplitText writes `style` attributes or HTML strings, use the fallback
   splitter in DESIGN §7.0 and log it), `ScrubText` (word dim→ink on scroll), `Pin` helper. All
   wrapped in `gsap.matchMedia()` with the reduced-motion condition. No layout thrash:
   transforms/opacity/clip-path only. The motion provider imports GSAP/ScrollTrigger/Lenis
   dynamically after first paint (DESIGN §7.0 loading strategy); above-the-fold entrances are
   CSS keyframes.
2. WebGL micro-engine (`src/lib/gl/`): `createGL(canvas)` (WebGL2, `alpha:false`,
   `antialias:false`, `powerPreference:'high-performance'`), `program(vert, frag)` with readable
   compile errors in dev, fullscreen-triangle draw, `createLoop` (RAF, visibility + IO pause,
   30/60 fps cap, delta clamp), DPR cap, resize via ResizeObserver, context-loss handling.
3. `MembraneCanvas` (hero): shader from `reference/shaders/membrane.frag` →
   `src/shaders/membrane.ts`; uniforms from DESIGN §7.2 (colours from `src/lib/gl/colors.ts`);
   pointer smoothing; CSS field (no image) until the first frame so the H1 stays the LCP
   element; one static frame for reduced motion; the poster AVIF (generated in P5) only for
   no WebGL2 / Save-Data / context loss.
4. Art primitives (server components, zero JS): `Guilloche` (seeded SVG line families: `band`,
   `rosette`, `border` — DESIGN §8.4), `CropMarks`, `RegistrationMark`, `SpectralStrip` (SVG rects),
   `EvidenceSeal` (rosette + text on a circular path), `DotScreen` (CSS radial-gradient texture).
5. `InstrumentWindow` (+ `InstrumentStack` for at most two overlapping windows) per DESIGN §9.6.
6. Lab: a motion page with every primitive; the membrane at 3 seeds; reduced-motion toggle.

Exit: 60 fps scroll on the lab page in Chromium (Performance panel or `perf.spec.ts` FPS probe
≥ 55), GPU frame ≤ 4 ms for the membrane at 1440p (EXT_disjoint_timer_query where available;
otherwise note), no layout shift from motion (CLS 0 in lab), reduced-motion screenshots show
final states; `pnpm verify` green.

---

## P5 — Painting pipeline ("hard-coded paintings")

Read: DESIGN §8.1–§8.3, reference/shaders/README.md.

Tasks
1. Port `reference/shaders/{scene,paint}.frag` to `src/shaders/{scene,paint}.ts` (unchanged
   maths; tune only preset palettes to tokens). Add `src/content/paintings.ts`: registry of
   paintings `{ id, scene: 'range'|'sky'|'meadow'|'sea', seed, interventions, palette, alt }`.
2. `scripts/paint.ts`: starts no server; writes a temporary HTML harness to `.cache/` that
   inlines the shaders, launches Chromium via `@playwright/test`'s `chromium` with the software-GL
   flags of D-018, renders each painting 2400 px wide in its registry aspect (DESIGN §8.2) and the
   membrane poster at 2560×1440, saves PNG to `.cache/paintings/`. Same pass logic and scaling
   rule as `reference/harness/render.mjs`. Deterministic (fixed seeds, no clock). Skips unchanged
   items via a hash of (shader source + spec).
3. `scripts/images.ts` (sharp): PNG → AVIF (q 55–62) + WebP (q 78) at 640/1024/1600/2400 into
   `public/paintings/<id>-<w>.<ext>`; computes an 8–10 colour palette (median cut on a 160-px
   thumbnail) and a 24-px blurred LQIP (data URI); writes `src/content/paintings.manifest.json`
   (`{ id, width, height, palette: [{hex, weight}], lqip }`) and the generated `src/app/lqip.css`
   (DESIGN §8.3). Commit generated assets.
4. `Painting` component: `<picture>` with AVIF/WebP `srcset`/`sizes`, explicit width/height,
   `loading`/`fetchpriority` props, LQIP as background via class (not style), alt text from the
   registry (or `alt=""` + `aria-hidden` when decorative), optional CSS "varnish" hover sheen.
5. `Plate` component: paper card, plate number (Roman), date, framed painting with crop marks,
   serif title, mono meta ("OIL ON CODE · SEED n"), spectral strip from the manifest palette.
6. Ship at least: 4 research/news plates, 3 "lines of inquiry" plates, 1 research hero (wide,
   21:9), 1 company plate. Review every still at full size; re-seed any that looks muddy,
   noisy or accidental. No painting may contain text, faces, logos or pixel-art artefacts.

Exit: `pnpm art` reproducible (second run is a no-op); all paintings ≤ 180 KB at 1600w AVIF;
plates reviewed at 3 widths; `pnpm verify` green.

---

## P6 — Home

Read: PAGES §1, CONTENT §3.1, DESIGN §7.2–§7.5.

Tasks: build sections 1–9 of PAGES §1 in order, each reviewed from screenshots before the next;
then the whole-page rhythm pass (surface sequence, spacing, header theme transitions, reveal
timing). Hook the membrane hero (with its CSS field and fallbacks), principle ScrubText, pinned Moth demo sequence, outcomes with
EvidenceSeal, research plates, news list, get-started split, footer.

Exit: LCP element is the H1 (not the canvas); home JS ≤ 220 KB; reduced-motion version reads
as a complete static page; `perf.spec.ts` under mobile emulation (4× CPU throttle, Fast 4G) meets
LCP ≤ 2.0 s and CLS ≤ 0.02 with no long task > 200 ms after load; axe clean; screenshots
reviewed; `pnpm verify` green. (Lighthouse is not a dependency; the owner may run it from Chrome
DevTools — QUALITY §4.)

---

## P7 — Moth and Models

Read: PAGES §2 and §11.3, CONTENT §3.2, §4 (claims), source files `moth.md`, `releases.md`.

Tasks: `/moth` (sections per PAGES §2, including the interactive purchasing example driven by
fixtures, the outcomes table, Preview 004 scope and language contract, qualification evidence
tables with their caveats verbatim, the prepared-base direction clearly marked as proposed);
`/developers/models` (model card sharing the same content modules).

Exit: every number on these pages traces to `src/content/source/releases.md` (unit test
`claims.test.ts` asserts the numbers match); screenshots reviewed; `pnpm verify` green.

---

## P8 — Research and News

Read: PAGES §3–§4, CONTENT §3.3–§3.4, DESIGN §8.

Tasks: content modules for the research perspective and the three news posts (converted from
`src/content/source/*.md` into typed blocks — keep the authors' wording; fix only typos);
`/research` (hero with wide painting and two-column abstract, three lines of inquiry, from
hypothesis to experiment, perspectives list with plates); `/research/[slug]` and
`/news/[slug]` (shared `Article` template: painted hero, meta, prose, figures, cite block,
related); `/news` (featured + list). `generateStaticParams` for slugs; unknown slug → 404.

Also: the `/md/[...path]` route handler (PAGES §0.7) serving each article as `text/markdown`
from the same typed blocks, linked from the article page (`alternates.types`).

Exit: articles pass the prose checklist (QUALITY §5.4); markdown alternates served for every
article (P13 links them from `/llms.txt`); screenshots reviewed; `pnpm verify` green.

---

## P9 — Company, Careers, Contact

Read: PAGES §5–§7, CONTENT §3.5–§3.7, DESIGN §7.6 (blocks unlock), SECURITY §6 (forms).

Tasks: `/company` with the pinned **blocks-unlock** sequence (desktop) and progressive reveal
(mobile, reduced motion = all unlocked); `/careers` (honest: no invented roles); `/contact` and
`/contact/sales` forms (Zod validation, accessible errors, honeypot field, preview-mode success
state that explains submissions are not sent yet; `interest` preselect from the validated param).

Exit: blocks sequence smooth at 60 fps and fully readable without JS; forms operable by keyboard
and screen reader (labels, errors announced via `aria-live`); `pnpm verify` green.

---

## P10 — Solutions

Read: PAGES §8–§9, CONTENT §3.8.

Tasks: `/solutions` overview + one `SolutionTemplate` fed by data for business,
customer-support, legal, security; `/solutions/use-cases` (filterable grid, client filter with
URL state validated by Zod). Every example world is synthetic and labelled.

Exit: screenshots reviewed; claims audit (QUALITY §6) passes; `pnpm verify` green.

---

## P11 — Developers, Pricing, Changelog, Status

Read: PAGES §10–§13, CONTENT §3.9–§3.12.

Tasks: `/developers` (API overview — honest status; illustrative request/response clearly
labelled), `/developers/docs` (docs landing with the documented concepts; "full docs ship with
the local delivery"), `/pricing` (plans without invented prices — CONTENT §3.10), `/changelog`
(entries from real dates only), `/status` (status board design with "not yet monitored" state,
no fake uptime).

Exit: screenshots reviewed; claims audit passes; `pnpm verify` green.

---

## P12 — Console preview

Read: CONSOLE (all), SECURITY §6–§7.

Tasks: console shell (left rail: Playground, Keys, Usage; bottom: Docs, Settings), `/console`
entry screen (no credential fields), Playground with the four example worlds evaluated by the
deterministic in-browser **simulator** (CONSOLE §5–§6; golden outputs unit-tested and labelled
"Simulation — not Moth"), definition variants + rebuild + replay, Keys (preview flow, nothing
created or persisted), Usage (this session's real, local activity — no sample numbers), Settings
(theme light/dark/system, reset session, profile placeholders). Keyboard shortcuts,
empty/loading/error states. Console pages `noindex`, excluded from sitemap.

Exit: a first-time user completes "ask a question and inspect the evidence" in ≤ 3 actions
(e2e `console.spec.ts`); axe clean in light and dark; console JS ≤ 230 KB; `pnpm verify` green.

---

## P13 — Legal, llms.txt, OG images, completeness

Read: PAGES §14, CONTENT §3.13 and §6.

Tasks: `/legal/[slug]` from content (terms and privacy from the harvested source, others as
clearly-marked drafts), `/legal/privacy-choices` (no non-essential cookies; honours GPC; nothing
to toggle — say so plainly), `/legal/responsible-disclosure` (SECURITY §9), `/md/[...path]`
markdown alternates for key pages (articles were done in P8), `/llms.txt` (static route: site
summary + links to the markdown alternates), OG images: a dev-only template route
`src/app/(dev)/lab/og/[family]/page.tsx` (404 in production) and `tests/e2e/og.spec.ts` (Playwright
project `og`, run by `pnpm og` against the dev server) that screenshots each family at 1200×630 into
`public/og/<family>.png` using the lockup, a painting and the real fonts; metadata audit
(every route has title, description, canonical, OG image), sitemap completeness.

Exit: e2e `seo.spec.ts` green; legal pages show the draft banner where required;
`pnpm verify` green.

---

## P14 — QA, hardening, polish, final report

Read: QUALITY (all), SECURITY §10 (checklist).

Tasks
1. Full e2e on production build across chromium/mobile/webkit; fix every failure.
2. Accessibility: axe on every route (light/dark console), keyboard walkthrough of every page,
   screen-reader spot check notes (landmarks, headings order, link names), reduced motion pass.
3. Performance: `perf.spec.ts` budgets (JS/CSS bytes per route, LCP, CLS, long tasks under
   mobile emulation) on every route, with special attention to `/`, `/moth`, `/research`,
   `/company`, `/console/playground`; fix regressions.
4. Security: SECURITY §10 checklist; Trusted Types trial (SECURITY §3.5) — enforce only if zero
   violations across the suite, otherwise keep report-only and log; `pnpm audit --prod` clean;
   `pnpm guard` clean; review every `'use client'` file for data exposure.
5. Visual polish pass: all routes at 375/768/1440 + reduced motion; fix the 20 most visible
   imperfections (QUALITY §5.3 list); verify header theme transitions across every surface.
6. Final report in BUILD_STATE (template in QUALITY §7): routes built, budgets table with actual
   numbers, test counts, performance measurements, open questions for the owner, known
   limitations, next steps for the Neon backend (SECURITY §8.4), and how to run/build.

Exit: everything green; final report written; tag `v0.1.0-preview`.
