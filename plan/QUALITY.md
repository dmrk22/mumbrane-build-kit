# Quality specification

"Done" means verified, not written. This file defines the gates, the tests, how screenshots are
reviewed, the claims audit, and the final report.

Contents: §1 Definition of done · §2 Commands & gates · §3 Test specifications ·
§4 Performance & accessibility measurement · §5 Visual review · §6 Claims audit · §7 Final report

---

## §1 Definition of done
A **task** is done when: its spec is implemented completely (all states: default, hover, focus,
active, disabled/loading where relevant, empty, error, long content; all widths; reduced motion;
keyboard), `pnpm verify:fast` is green with no new warnings, UI screenshots were reviewed per §5
and fixed, and BUILD_STATE is updated.

A **phase** is done when its exit criteria in BUILD_PLAN pass, `pnpm verify` is green, a
handoff note is written, and the phase is tagged.

The **build** is done when P14's checklist (SECURITY §10 + this file) is fully ticked and the
final report (§7) is written.

---

## §2 Commands & gates

| Command | What it runs | When |
|---|---|---|
| `pnpm typecheck` | `tsc --noEmit` (strict set) | every task |
| `pnpm lint` | Biome check (format + lint) | every task |
| `pnpm guard` | `scripts/guard.ts` security scan (SECURITY §2 rules, allowlist, config checks) | every task |
| `pnpm test:unit` | `node --test "tests/unit/**/*.test.ts"` | every task |
| `pnpm verify:fast` | the four above | every task |
| `pnpm budgets` | file counts, dependency allowlist/pins, built JS/CSS totals | every phase (after a build) |
| `pnpm build` | production build | every phase |
| `pnpm test:e2e` | Playwright: chromium + mobile (+ webkit for `@smoke`) against `pnpm dev` | as needed |
| `E2E_PROD=1 pnpm test:e2e` | the same against `pnpm start` (production) | inside `pnpm verify` |
| `pnpm verify` | verify:fast + budgets + build + production e2e | every phase |
| `pnpm shots <routes…>` | screenshots at 375/768/1440 (+ reduced motion at 1440) into `.shots/` | every UI task |
| `pnpm art` / `pnpm og` | paintings (scripts) / OG images (Playwright project `og` over `/lab/og/*`); deterministic | P5, P13, when art changes |
| `pnpm audit --prod --audit-level=moderate` | advisories | P0, P14, any dependency change |

Rules
- Never weaken a rule, skip a test, add `// @ts-ignore`, `biome-ignore`, `test.skip`, or raise a
  budget to get green. Fix the cause. If a rule is genuinely wrong for a line, use the narrowest
  suppression with a reason comment **and** a DECISIONS entry — expect this to be rare (≤ 3 in
  the whole build).
- A flaky test is a bug: fix the race (wait for the right condition, never `waitForTimeout` —
  the only exception is the documented motion-settle wait in `shots.spec.ts`/`og.spec.ts`), or
  quarantine it with `test.fixme` + a BUILD_STATE known-issue entry, and fix before P14.
- Test tags: `@security`, `@smoke`, `@a11y`, `@perf`, `@console`, `@seo`, `@motion`, `@forms`.

---

## §3 Test specifications

### §3.1 Unit tests (`tests/unit/*.test.ts`, `node:test` + `node:assert/strict`)
Import only pure modules (`src/lib/**`, `src/content/**`, `scripts/**`, the generated
`mark-geometry.ts`) with relative `.ts` paths. Never import `.tsx`, React, Next, or
`server-only` modules.

| File | Asserts |
|---|---|
| `brand.test.ts` | sha256 of every file listed in `LOCK.json.files` matches, and every `.svg` in `brand/logo/` is listed; `public/brand/*.svg` are byte-identical copies; `sha256(d-values joined by "\n")` of each SVG equals `LOCK.json.geometry`; `mark-geometry.ts` exports exactly the SVGs' path data (re-parsed, compared in order) and the lockup transforms; favicon/icons exist in `public/`. |
| `csp.test.ts` | production CSP: nonce present, `'strict-dynamic'`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`, `form-action 'self'`, `upgrade-insecure-requests` only when `upgradeInsecure` is true, no `unsafe-`; dev CSP adds exactly `'unsafe-eval'`, `'unsafe-inline'` (style only) and `ws:`; malformed nonce throws; 1,000 `createNonce()` calls are unique and match the shape; `SECURITY_HEADERS` equals the SECURITY §3.4 table; `PERMISSIONS_POLICY` has no duplicates; `toScriptSafeJson` escapes `</script>`, `<!--`, `&`, U+2028/U+2029 and round-trips through `JSON.parse`. |
| `links.test.ts` | `toSafeHref` accept/reject table (internal, fragment, `//evil`, `javascript:`, `data:`, `http:`, allowlisted/non-allowlisted https, `mailto:` domains, credentials, ports, control chars, backslashes, 2,049 chars); every href in every content module and in `site.ts` is accepted and every internal one resolves to the route registry or an article slug. |
| `inline.test.ts` | AST output for each markup form; nesting; unbalanced markers become text; `<script>` stays text; rejected links become plain text; a 20,000-character adversarial string parses in < 50 ms. |
| `params.test.ts` | each parser: valid values, arrays (first element), invalid/unknown/objects/10 kB strings → `undefined`/default. |
| `forms.test.ts` | schemas: valid inputs pass (trimmed); each field's min/max; email edge cases; honeypot handling in the action helper; mailto builder encodes and caps at 1,800 characters. |
| `contrast.test.ts` | every pair in DESIGN §2.4 meets its threshold using `palette.json`; hex comments in `tokens.css` match `palette.json`. |
| `palette.test.ts` | `src/lib/gl/colors.ts` equals the corresponding `palette.json` hex values. |
| `content.test.ts` | every article/legal/page module validates against `schemas.ts`; slugs unique; ISO dates; registry paths unique and each has a `page.tsx` (fs walk) or a route handler; no `TODO`/lorem in content. |
| `claims.test.ts` | every entry in `src/content/claims.ts` appears verbatim in `src/content/source/releases.md`; forbidden patterns (CONTENT §4: `%`, "x faster", "uptime", "SOC 2", "production-ready", "guarantee", "hallucination", "customers", "trusted by") absent from content modules; every "Illustrative"/"Simulation" block carries its label field. |
| `markdown.test.ts` | blocks → markdown: headings, lists, code fences with safe backtick counts, tables, escaped `<`; frontmatter fields; no HTML output. |
| `console-sim.test.ts` | CONSOLE §6.5 (golden outcomes, hostile inputs, timing, stable build ids). |
| `seo.test.ts` | `pageMetadata()` builds canonical/OG/Twitter correctly from `publicEnv.siteUrl`; titles ≤ 60 chars, descriptions ≤ 160. |

### §3.2 End-to-end tests (`tests/e2e/*.spec.ts`, Playwright)
Shared helpers in `tests/e2e/utils.ts`: route list from the registry (+ one slug per dynamic
route); `collectViolations(page)` (init script listening to `securitypolicyviolation`, storing
`{ disposition, directive, blockedURI }`); `collectConsole(page)` (errors and warnings, ignoring
`[Report Only]` messages only during the Trusted Types trial); `externalRequests(page)` (any
request whose origin ≠ the app's).

| File | Asserts |
|---|---|
| `security.spec.ts` `@security` | SECURITY §3.6 items 1–7 for every route (headers on HTML, `_next/static` JS and CSS, a `/paintings` image, `/robots.txt`, a 404); prod-only assertions gated on `E2E_PROD`. |
| `smoke.spec.ts` `@smoke` | every route: 200 (404 for a bogus slug), exactly one `h1`, `<title>`, meta description, canonical, no console errors (the only tolerated one is the document's own 404 on the not-found check), no external requests; also runs on webkit. |
| `a11y.spec.ts` `@a11y` | axe (`wcag2a, wcag2aa, wcag21aa, wcag22aa`) on every route at desktop and mobile, console in light and dark; skip link moves focus to `main`; header mega menus open/close with Enter/Space/Esc and return focus; mobile sheet traps focus and closes on Esc; every interactive element reachable by Tab has a visible focus indicator (screenshot diff of focused vs unfocused bounding box, non-zero). |
| `motion.spec.ts` `@motion` | with `reducedMotion: 'reduce'`: after load and scroll to bottom, no element in `main` has computed `opacity < 1` or a non-identity transform from GSAP; no pinned elements; blocks counter reads "12 / 12". With motion: the header lockup collapses after scrolling 200 px (letters' state attribute) and expands back at the top; blocks counter increases while scrolling the Company pin (desktop). |
| `perf.spec.ts` `@perf` | per route on the production server: first-load JS and CSS bytes (Chromium CDP `Network.loadingFinished.encodedDataLength` by resource type) within BUILD_PLAN budgets; on `/`, `/moth`, `/research`, `/company`, `/console/playground` with CPU 4× + Fast 4G emulation: LCP ≤ 2.0 s (PerformanceObserver), LCP element on `/` is the H1, CLS ≤ 0.02, no long task > 200 ms after load; WebGL frame probe on `/lab/motion` when `PERF_GPU=1` (skipped otherwise, noted in the report). |
| `forms.spec.ts` `@forms` | validation messages and focus movement; preview success state; mailto href content; the form works with `javaScriptEnabled: false`; URL never contains form values; honeypot path returns success without errors. |
| `console.spec.ts` `@console` | CONSOLE §14 items 1–7. |
| `seo.spec.ts` `@seo` | robots rules; sitemap contains every indexable route and no console/lab; manifest valid; `llms.txt` links resolve; `/md/*` returns `text/markdown`; OG image per route exists and is 1200 × 630; JSON-LD parses and has the required fields; redirects (PAGES §0.6) return the right status and location; console pages carry `noindex`. |
| `og.spec.ts` (project `og`) | for every OG family: open `/lab/og/<family>` at 1200 × 630, wait for fonts and images, screenshot to `public/og/<family>.png`; fail if any family is missing from the route registry mapping. |
| `shots.spec.ts` (project `shots`) | for `SHOTS_ROUTES`: full-page screenshots at 375, 768, 1440 with motion settled (wait for fonts, `networkidle`, then scroll to bottom and back to trigger reveals, then wait 1 s), plus 1440 with reduced motion; paths printed. |

---

## §4 Performance & accessibility measurement
- **Bytes**: measured on the production server with compression (Next's default gzip). JS budget
  counts every script loaded before `load` for that route (shared + route chunks).
- **LCP/CLS**: Chromium only, mobile emulation (390 × 844, DPR 3 → cap screenshots at DPR 2),
  CPU throttling 4× via CDP `Emulation.setCPUThrottlingRate`, network "Fast 4G" via
  `Network.emulateNetworkConditions` (latency 150 ms, 1.6 Mbps down, 750 kbps up).
- **Fonts**: at most two preloaded; total font bytes within budget (count `font` responses).
- **WebGL**: timer query when available (`EXT_disjoint_timer_query_webgl2`), else frame-time
  sampling; report "not measurable in headless" rather than inventing a number.
- **Lighthouse** is not installed. The final report tells the owner how to run it from Chrome
  DevTools if they want a score; our gates are the measurements above.
- **Accessibility** beyond axe: a manual keyboard walkthrough of every page type (record findings
  in BUILD_STATE), screen-reader spot check notes (landmarks, headings, link names), 200 % zoom
  and 320 px width checks, forced-colors screenshot of the home page.

---

## §5 Visual review (every UI task, every phase)

### §5.1 Process
1. `pnpm shots <routes>` → open **every** image with the Read tool: 375, 768, 1440, and the
   reduced-motion 1440 shot. For long pages, also inspect the section you changed at full size.
2. Compare with `brand/board/board.png` (sections per DESIGN §12) and the page spec.
3. Go through §5.2. Write down each defect, fix, re-shoot, re-check. Stop only when a critical
   designer would not flag anything on that page.
4. For interactive states, capture them in the lab (`/lab`) or with a focused Playwright
   screenshot (hover, focus, open menu, error state) and review those too.

### §5.2 Checklist per screenshot
- **Hierarchy**: one focal point per viewport; H1 dominant; primary action obvious; nothing
  competes with the signature moment.
- **Grid**: left edges on columns (serif display may be optically shifted −2 to −4 px); equal
  gutters; no element off by 1–3 px; container padding per DESIGN §4.1.
- **Rhythm**: section padding per breakpoint; heading → lede 24, lede → actions 32; equal gaps
  look equal.
- **Type**: right tokens; no faux italic/bold; headings balanced, ledes without widows; curly
  quotes, correct dashes, non-breaking number–unit spaces; measure within range; mono labels
  uppercase with tracking; tabular numbers in tables.
- **Colour**: surface sequence as specified; pigment proportions (DESIGN §2.3); only allowed pairs;
  header theme correct over each surface; no stray default colours.
- **Imagery**: paintings sharp (correct `srcset` pick), crop marks aligned to the frame, spectral
  strip matches the palette, no muddy/noisy painting, captions present.
- **Motion states**: in normal shots everything has settled (no half-revealed elements); in
  reduced-motion shots everything is in its final state.
- **Components**: focus ring visible in the focus shot; buttons of the same row share a height;
  icons on the cap height; chips on the baseline.
- **Responsive**: 375 — no horizontal overflow, long words (emails, URLs) wrap, touch targets ≥
  44 px, nav sheet usable; 768 — layouts transition sensibly (no awkward half-grids); 1440 — max
  width respected, nothing stretched.
- **Content**: no lorem, no leaked placeholders except the designed `Placeholder` chip; labels
  present on illustrative/simulated/proposed/draft content.

### §5.3 The usual suspects (hunt these in P14's polish pass)
1. Serif display not optically aligned with body text left edges. 2. Icons sitting low in buttons.
3. Underline offset/thickness inconsistent between components. 4. Mixed border colours on one
surface. 5. Double borders where cards meet. 6. Radius drift (4 vs 6 px) within a view.
7. Header backdrop banding or blur seams. 8. Focus ring clipped by `overflow: hidden`.
9. Text crowding a painting or window edge. 10. Inconsistent date formats. 11. Chips off the
baseline. 12. Numbers not aligned in tables. 13. Buttons in a row with different heights.
14. Linked cards without hover/focus states. 15. Footer column headings misaligned.
16. Giant wordmark clipping unevenly at different widths. 17. Scrollbar-induced layout shift.
18. Emails/URLs overflowing on mobile. 19. Aspect-ratio jumps when images load. 20. Instrument
window text wrapping mid-token.

### §5.4 Prose checklist (articles, legal)
Authors' wording preserved (diff against `src/content/source/*.md` shows only typo, hyphenation,
punctuation and formatting fixes) · heading levels correct · code blocks formatted and labelled
· links valid and allowlisted · figures numbered and captioned · reading time and dates correct
· cite block correct · markdown alternate matches the page · print preview readable.

---

## §6 Claims audit (P7, P10, P11, P14)
1. `claims.test.ts` green.
2. Read every page's copy against CONTENT §4: each number traced to `releases.md`; every
   illustrative, simulated, proposed or draft item carries its label in view; no forbidden words
   (grep the content modules for the CONTENT §1 avoid-list and §4 forbidden list).
3. Check CTAs: "Try for free" lands on the console entry, which states it is a simulation.
4. Log the audit result in BUILD_STATE with the date.

---

## §7 Final report (write into BUILD_STATE at P14)

```
## Final report — v0.1.0-preview (<date>)
Routes built: <n> (list)                     Tests: <unit n> unit · <e2e n> e2e (all green)
Budgets (limit → actual):
  source files 230 → … · components 80 → … · deps 8/11 → …/…
  JS: marketing 190 → max … (route) · home 220 → … · console 230 → …
  CSS 60 → … · fonts 270 KB → … (… files) · paintings ≤ 180 KB → max …
Performance (mobile emulation): LCP … s (/), … (/moth) … · CLS … · long tasks …
Accessibility: axe 0 violations on … routes (light/dark console) · keyboard walkthrough notes
Security: CSP (no unsafe-*), headers A+-equivalent, audit clean, Trusted Types trial → <result>
Open questions for the owner: …
Known limitations: …
Next steps — Neon backend: (SECURITY §8.4 checklist)
Run it: pnpm install --frozen-lockfile && pnpm build && pnpm start  (http://localhost:3000)
Optional: Lighthouse via Chrome DevTools → Lighthouse → Mobile.
```
