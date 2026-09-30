# Page specification

Structure, composition, components, behaviour and acceptance checks for every route. Words come
from CONTENT.md (same section numbers); visual rules from DESIGN.md; the console from CONSOLE.md.
Surfaces are listed in order for each page — they define the page's colour rhythm.

Contents: §0 Global · §1 Home · §2 Moth · §3 Research · §4 News · §5 Company · §6 Careers ·
§7 Contact · §8 Solutions overview · §9 Solution pages & use cases · §10 Developers ·
§11 Docs & Models · §12 Pricing · §13 Changelog & Status · §14 Legal

---

## §0 Global

### §0.1 Route registry — `src/content/routes.ts`
One typed array; everything else (header, footer, sitemap, robots, e2e route lists, shots)
reads from it.
```ts
export type RouteEntry = {
  path: string                    // '/moth'
  title: string                   // used in nav and <title>
  group?: 'solutions' | 'developer' | 'company' | 'legal' | 'console'
  nav?: { header?: boolean; footer?: boolean; description?: string }
  sitemap: boolean                // false for console, lab
  noindex?: boolean               // true for console
  surfaceTop: 'paper' | 'paper-2' | 'ink' | 'ultramarine' | 'cadmium' // first section (header theming + tests)
}
```
Dynamic routes (`/research/[slug]`, `/news/[slug]`, `/solutions/[slug]`, `/legal/[slug]`)
contribute their slugs from their content modules through helper functions in the same file.

### §0.2 Layouts
- `src/app/layout.tsx` (root): `<html lang="en" data-surface="paper" className={fontVars}>`,
  nonce read (SECURITY §4.1b), `lqip.css` import (added in P5 when the file is first generated),
  metadata base, `<body>` with the skip link target handled by children. No providers here.
- `src/app/(site)/layout.tsx`: skip link → `Header` → `<main id="main" tabIndex={-1}>` →
  `Footer`; `SmoothScroll` wraps `main` (client, no-op for reduced motion/coarse pointers).
- `src/app/console/layout.tsx`: console shell (CONSOLE §2), `robots: { index: false, follow:
  false }`, no marketing header/footer, theme bootstrap script (CONSOLE §10.2).
- `src/app/(dev)/lab/…`: `notFound()` when `NODE_ENV === 'production'`; `noindex`.

### §0.3 Page anatomy
Every marketing page: hero section (H1, lede, optional actions) → content sections (each a
`<Section surface id aria-labelledby>`) → optional `CtaBand` → footer. Section ids are stable
slugs (`#evidence`, `#language-contract`) so deep links work; `scroll-margin-top: 96px`.

### §0.4 Content model — `src/content/`
- Typed modules export plain data (`as const` + `satisfies` a type). Zod schemas in
  `src/content/schemas.ts` validate articles and blocks in unit tests (not at runtime).
- Content modules are data-only `.ts` files (no JSX, no React or Next imports) that import each
  other with relative `.ts` paths, so `node --test` can load them for the content, links and
  claims tests.
- **Blocks** (for articles, legal and long pages): `p`, `h2`, `h3`, `list` (ordered/unordered),
  `quote`, `code` (lang, text, label?, illustrative?), `table` (caption, columns, rows, source),
  `figure` (painting id | diagram id, caption, fig number), `note` (tone: info | caveat |
  proposed), `callout` (title, text, link?). Inline markup only via `src/lib/inline.ts`.
- **Articles**: `{ slug, section: 'research' | 'news', category, title, description, published,
  updated?, authors, tags, plate: paintingId, blocks, related: slug[] }`.
- Fixtures for the console live in `src/content/console/` (CONSOLE §5).

### §0.5 Metadata and structured data
`pageMetadata()` (P2) on every route with the CONTENT §6 texts; OG image by family; JSON-LD per
CONTENT §6. Article pages also set `alternates.types['text/markdown']` to their `/md/…` URL.

### §0.6 Redirects (`next.config.ts` → `redirects()`, all tested in e2e)
| From | To | Permanent |
|---|---|---|
| `/releases` | `/moth#evidence` | yes |
| `/privacy` | `/legal/privacy` | yes |
| `/terms` | `/legal/terms` | yes |
| `/login` | `/console` | no (future auth may take it) |
| `/<path>.md` (legacy agent URLs) | `/md/<path>` | yes — try `{ source: '/:path*.md', destination: '/md/:path*' }`; if Next rejects the pattern or it misroutes, drop this row and log D-1xx (llms.txt already points at `/md/…`) |

### §0.7 Markdown alternates — `src/app/md/[...path]/route.ts`
GET only. Resolves the path against an allowlist map built from content modules (articles + the
key pages in CONTENT §6); unknown → 404 plain text. Renders markdown from the same typed blocks
(`src/lib/markdown.ts`: blocks → markdown, escaping `<` and backticks in text, no raw HTML),
with YAML frontmatter. Headers: `Content-Type: text/markdown; charset=utf-8`,
`X-Robots-Tag: noindex` (the HTML page is canonical). Static (`export const dynamic =
'force-static'` + `generateStaticParams`).

### §0.8 Error and empty pages
- `not-found.tsx` (paper): the mark (display weight, 320 px) with the draw-on; H1 "This page is
  outside the field."; text "The address doesn't match anything we've defined."; actions: Home ·
  Research · News. No echo of the requested path.
- `error.tsx` (paper): H1 "Something went wrong on our side."; "Try again" (calls `reset`) and
  "Go home". No error details.
- `global-error.tsx`: minimal own `<html>`/`<body>`, same message, system fonts, token colours via
  a class on body; no external assets.

### §0.9 Lab (`/lab`, `/lab/motion`) — development only
Every primitive in every state on every surface (P1), and every motion primitive with a
reduced-motion toggle, the membrane at three seeds, and a CSP-violation counter (P4). `/lab/og/[family]`
renders the OG card templates at 1200 × 630 for `pnpm og` (P13).

---

## §1 Home (`/`) — surfaces: ultramarine · paper · ink · paper · paper-2 · paper · ink · paper · cadmium

1. **Hero** (full-bleed field, DESIGN §7.2): `MembraneCanvas` behind; content in a container:
   eyebrow with cadmium dot, H1 (`display-xl`, two lines at ≥ 1024: "Intelligence for" /
   "*closed worlds.*"), lede (`lede` sans, on-dark, max 36 ch), actions (primary on-dark pill
   "Explore Moth" with arrow chip, ghost "Read the research"); bottom row: FIG caption (left) and
   SCROLL indicator (right). Header over it is transparent on ultramarine.
2. **Principle** (offset editorial): eyebrow cols 1–3; statement cols 4–12 (`display-m`
   serif) with ScrubText (DESIGN §7.3); chip row below (StatusChip × 5) + caption.
3. **How Moth works** (split, pinned ≥ 1024 — DESIGN §7.4): `MothDemo` section component.
   Actions below the ledger. Mobile: ledger then windows stacked (window width 100 %, the
   second window offset 16 px).
4. **Evidence** (split): left cols 1–7 H2 + text + `OutcomeLedger` (5 rows); right cols 9–12
   `EvidenceSeal` (220 px) with its caption beneath. Mobile: seal above the ledger, 160 px.
5. **Compounding** (paper-2 with a `Guilloche band` at 10 % behind the heading): H2 cols 1–8,
   text cols 1–6; four items as a 4-column row (2 × 2 at md, 1 column on mobile), each: mono
   index (01–04), `title`, question in `small`. Closing line in serif italic `lede`.
6. **Research** (card grid): H2 + text left, "All research →" right-aligned on the heading's
   baseline; three `Plate`s (`sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"`,
   `loading="lazy"`); plates reveal per DESIGN §7.5.
7. **Current release** (ink, split): left H2 + text + action; right a `SpecTable` (mono labels
   left, values right, rules between rows) and the caveat line in `caption` on-dark-2.
8. **News** (ledger): three `NewsList` rows; "All posts →".
9. **Get started** (cadmium): H2; two cards side by side (paper ground cards with ink text, 1 px
   ink border) with actions. Mobile: stacked.

Acceptance: LCP element = H1; hero fills the first viewport at 1440 × 900 with the lede and CTAs
visible; reduced-motion screenshot reads as a complete static page; JS ≤ 220 KB.

---

## §2 Moth (`/moth`) — surfaces: paper · ink · paper · paper-2 · paper · paper-2 · paper · ink · cadmium

1. **Hero** (paper, split): left H1 "Moth" (`display-xl`), subhead (`display-m` with the italic
   phrase), lede, actions; right an `InstrumentWindow` titled `moth · preview 004` listing the five
   stages as a vertical status list (all "ready"), with the mark small in the window header area
   (uniform scale only).
2. **How it works** (ink): the five steps as a horizontal pipeline diagram (DESIGN §8.6) with
   step text beneath each node (≥ 1024), vertical list on mobile; the conceptual-illustration
   caption.
3. **Define purchase readiness** (paper): `PurchasingExplainer` (client): definitions and facts
   (left), results (right), the "Require audit instead of inspection" switch → "Rebuild" button →
   results and build id update with a 320 ms cross-fade; `aria-live="polite"` announces
   "Rebuilt as build 7c21. orderone: no supported proof. ordertwo: supported."; label chip
   "Explanatory example".
4. **Outcomes and boundaries** (paper-2): `OutcomeLedger` (full variant incl. incomplete
   execution and artifact incompatibility) + the two boundary paragraphs.
5. **Preview 004** (`id="evidence"`, paper): scope paragraph + "What the preview supports"
   checklist (check icons) + note block.
6. **Language contract** (`id="language-contract"`, paper-2): rules list; `CodeBlock` with the
   two supported questions; limits as a 5-cell spec grid (mono numbers, `caption` labels) with
   the "not capacity guarantees" note directly under it.
7. **Qualification** (`id="qualification"`, paper): table (DESIGN §9.8) + caveats.
8. **Measured observations** (paper): environment sentence, table, caveat.
9. **Inspect the evidence** (ink): text with the retained failed-harness paragraph highlighted as
   a `note` (tone caveat); file names in `code` chips.
10. **Prepared-base direction** (paper-2): "Proposed" tag + paragraph + link.
11. **Get the preview** (cadmium): text + two actions.

Acceptance: every number matches `releases.md` (`claims.test.ts`); tables usable at 375 px.

---

## §3 Research

### §3.1 `/research` — surfaces: paper (hero) · paper-2 · paper · ink · paper
1. **Hero**: the `research-hero` painting full-bleed (21:9 at ≥ 1024, 4:5 crop on mobile via
   `<picture>` art direction) with a glass caption card bottom-left (the one sanctioned glass
   element: `surface` at 72 % + `backdrop-filter: blur(16px) saturate(1.3)`, 1 px on-dark border
   at 30 %); below the painting, eyebrow + H1 (`display-l`) and the two-column abstract (cols 1–6
   and 7–12 on ≥ 1024).
2. **Lines of inquiry** (paper-2): three tall `Plate`s (4:5 paintings) titled Representation /
   Dynamics / Causality with their question as the title and a one-line gloss; then the
   relativity paragraph with the light-cone diagram (FIG. 01) and its conceptual caption.
3. **From hypothesis to experiment** (paper, offset editorial): two paragraphs + three links.
4. **Research perspectives** (ink): list of perspectives — each a wide row: plate thumbnail
   (left, 1024w), meta (date, category, authors) + title (`display-s`) + description; one entry
   now, designed to hold many (no "empty" look with one: the row is generous).
5. CTA band (paper): "Talk to the lab" → `/contact?interest=research`.

### §3.2 `/research/[slug]` — `Article` template (shared with news)
- Header: breadcrumb-like eyebrow ("Research · Research perspective"), H1 (`display-l`),
  description (`lede` serif), meta row (published, updated, authors, reading time from word
  count), tags as chips.
- Plate: the article painting (16:10, 1600w) framed with crop marks and a FIG caption.
- Body: `Prose` (DESIGN §9.11) rendering blocks; sticky mini-TOC on ≥ 1280 when ≥ 3 H2s.
- End matter: "Cite as" block (text: `Mumbrane Labs. "<Title>." Mumbrane, <Month D, YYYY>.
  https://mumbrane.com/<path>` + copy button); "Read as markdown" link (`/md/…`); related posts
  (2 rows).
- `generateStaticParams` from the content registry; unknown slug → `notFound()`.

---

## §4 News

### §4.1 `/news` — surfaces: paper · paper-2
- Header: H1 + lede.
- Featured (paper): the latest post as a large split card: plate left (cols 1–7), meta + title
  (`display-m`) + description + "Read" right.
- All posts (paper-2): ledger rows (date · category · title · arrow) sorted newest first; the
  research perspective is included with a "Research" category tag and links to its research URL.

### §4.2 `/news/[slug]`
The `Article` template (§3.2) with eyebrow "News · <category>".

---

## §5 Company (`/company`) — surfaces: paper · paper (blocks) · paper · paper-2 · ink(CTA row)

1. **Hero**: eyebrow, H1, lede (offset editorial).
2. **Blocks** (DESIGN §7.6): `BlocksMosaic` (client): heading row with the counter right-aligned;
   6-column grid, row height 200 px (≥ 1024), gap 8 px; block content: mono label top-left,
   serif `display-s` text bottom-left, arrow top-right for linked blocks. Linked blocks are
   links (whole block clickable, visible focus ring inset 4 px). Mobile: 2 columns, span-2 blocks
   become full width, row height auto (min 140 px).
3. **Why closed worlds** (split): text cols 1–6, `company-plate` cols 8–12.
4. **The name** (paper-2): H2 + text; a small diagram: μ track passing through a membrane
   (line drawing, FIG. 02, "Conceptual illustration").
5. **CTA row** (ink): three large text links (Careers, Contact, News) as a ledger.

Acceptance: sequence smooth (≥ 55 fps probe), fully readable without JS, every linked block
reachable by keyboard and unlocked on focus, all block text available to assistive tech in every
state, counter correct, locked blocks honest.

---

## §6 Careers (`/careers`) — surfaces: paper · paper-2 · paper · cadmium
Hero (H1 + lede) · How we work (4 principles as a 2 × 2 grid with mono indices) · Areas we care
about (list as chips with one-line glosses; clearly titled "Areas we care about — not open
roles") · CTA (cadmium): write to us + contact form link. No job listing component exists until
the owner supplies roles.

---

## §7 Contact

### §7.1 `/contact` — surfaces: paper · paper-2
- Split: left (cols 1–5) H1, lede, the two email cards (mono label, address as link, copy
  button), the "focused note" text; right (cols 7–12) the `ContactForm`.
- `interest` search param (parsed by `parseInterest`) preselects Topic. Invalid → ignored.
- Form states: idle → invalid (inline + summary) → preview success (replaces the form in place,
  focus moves to its heading).

### §7.2 `/contact/sales` — surfaces: paper · ink (what to expect)
- Split: left H1 + lede + "What to expect" panel (ink ground, 3 items with icons); right the
  `SalesForm`. Same states.

Acceptance: works with JS disabled (server action), errors announced, no PII in URLs, no network
requests except the same-origin action POST.

---

## §8 Solutions overview (`/solutions`) — surfaces: paper · paper-2 · paper · ink
Hero (H1 with italic "your", lede) · four solution cards (2 × 2 on ≥ 768; each: icon, title,
one-line promise from CONTENT §2.1, "Explore →") + a wide Use cases card · "Fit" section: two columns
"Moth fits when…" / "Moth is not…" as checklists · CTA (ink): Contact sales.

---

## §9 Solution pages and use cases

### §9.1 `/solutions/[slug]` — `SolutionTemplate` (slugs: business, customer-support, legal, security)
Surfaces: paper · ink · paper · paper-2 · cadmium.
1. Hero: eyebrow "Solutions · <Name>", H1, lede.
2. Illustrative world (ink): split — left "The rulebook" (what gets defined, 3 bullets); right an
   `InstrumentWindow` `<world>.field` tagged "Illustrative" with definitions, facts, 2 questions
   and their outcomes.
3. Outcomes in this domain (paper): `OutcomeLedger` with domain-specific "next step" wording.
4. Why evidence matters here (paper-2): 3 short points; for Security also "Our own security"
   panel + link to `/legal/responsible-disclosure`; for Legal the "Not legal advice" note.
5. CTA (cadmium): "Talk to us about <domain>" → `/contact?interest=<slug>` (topic preselected by
   `parseInterest`), secondary "Contact sales" → `/contact/sales`, and "See all example worlds" →
   use cases.
Unknown slug → `notFound()`.

### §9.2 `/solutions/use-cases` — surfaces: paper · paper-2
- Hero + filter chips (client component; state mirrored to `?domain=` via `router.replace`,
  parsed by `parseUseCaseFilter`; server renders the filtered list for the initial param so it
  works without JS as plain links).
- Two groups: "Delivered in Preview 004" (4 cards) and "Sketches" (6 cards). Card: badge, title,
  definition sentence (serif), question (mono), outcome chip.
- Empty filter result (possible for some combos) shows "No example worlds in this area yet."

---

## §10 Developers — API overview (`/developers`) — surfaces: paper · ink · paper · paper-2 · paper
1. Hero: H1, lede, status banner (info note: "Preview 004 is a local CLI. There is no public
   inference API yet.").
2. Lifecycle (ink): the six-stage diagram (define → compile → activate → ask → inspect → replay)
   with one line per stage.
3. Concepts (paper): 7 concept cards in a 3-column grid (field, build, activation, question,
   result, evidence, replay).
4. Results (paper-2): `CodeBlock` with the illustrative JSON (tag "Illustrative — not the
   Preview 004 schema") next to its checked-English rendering; the two supported question
   examples.
5. Outcomes + limits (paper): compact `OutcomeLedger` and the limits grid (shared module with
   `/moth`). "When the hosted API arrives" paragraph. CTA: Documentation → · Models →.

---

## §11 Docs and Models

### §11.1 `/developers/docs` — docs landing (single page)
Surfaces: paper. Two-column layout ≥ 1024: sticky table of contents (cols 1–3, mono labels,
current section highlighted via IntersectionObserver, `aria-current="location"`) and content
(cols 4–11) with the CONTENT §3.9 sections as H2s. Top note: complete docs ship with the local
delivery (lists the four files as `code` chips). Mobile: TOC collapses into a "Contents"
disclosure at the top.

### §11.2 Docs details
Anchors on every H2/H3 (hover-revealed "#" link with `aria-label="Link to <heading>"`); code
blocks with copy; glossary as a definition list; "Last reviewed" date from content.

### §11.3 `/developers/models`
Surfaces: paper · paper-2 · paper. Model card layout: header (name, status chip "Preview · local",
profile, announced 2026-09-22) · two-column spec (capabilities / not included) · shared
modules: language contract, outcomes, qualification (same components/content as `/moth` — no
duplicated copy) · "Upcoming: Moth Base — Proposed" card.

---

## §12 Pricing (`/pricing`) — surfaces: paper · paper-2 · paper
Hero · three plan columns (equal height; top rule in the plan's pigment: cherenkov / ultramarine /
ink; price line in `display-s` serif: "Free", "By arrangement", "Not yet available"; 3–4 bullet
facts; action) · FAQ (accordion, `<details>`-based with custom styling, one open at a time not
required) · note linking to the claims-honest changelog.

---

## §13 Changelog and Status

### §13.1 `/changelog` — surfaces: paper
Timeline ledger: date column (mono, sticky per month on ≥ 1024), entry title (`title`), tag chips
(Model / Research / News / Website), one-line description, link. Newest first. No invented entries.

### §13.2 `/status` — surfaces: paper · paper-2
Overall banner (paper-2, info tone): "Not yet monitored — we'll publish live status when there is
a hosted service." Component rows: name, description, state chip "Not yet monitored" (paper-3),
and a 90-cell bar of empty outlined cells labelled "No data yet" (SVG, `aria-hidden`, with a
text equivalent). No numbers.

---

## §14 Legal (`/legal/[slug]`) — surfaces: paper
Slugs: terms, enterprise-terms, privacy, cookies, privacy-choices, responsible-disclosure.
Layout: left rail (cols 1–3) listing all legal pages (current highlighted); content (cols 4–10)
with H1, "Last updated" date, optional draft banner (CONTENT §3.13), blocks rendered by `Prose`.
`privacy-choices` adds a small client island reading `navigator.globalPrivacyControl` to show the
GPC notice (nothing stored or sent). Unknown slug → `notFound()`. Print-friendly.
