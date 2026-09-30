# Design specification

The bar: a frontier-lab site (Anthropic, Mistral, OpenAI-era editorial) finished like a design
studio's portfolio piece. Colour is the protagonist. Every detail — a label's tracking, a
hairline's weight, when a line of text arrives — is deliberate. The visual target is
`brand/board/board.png` (section map in §12). This file says how to hit it.

Contents: §1 Principles · §2 Colour · §3 Typography · §4 Layout · §5 Surfaces & materials ·
§6 Logo in use · §7 Motion · §8 Imagery engine · §9 Components · §10 Accessibility &
responsive · §11 Never do · §12 Board map

---

## §1 Principles

1. **Instrument, not ornament.** Every visual carries meaning. Field lines are the reasoning
   field; muon tracks are questions passing through it; plates are research perspectives; the
   evidence seal is a checked answer; locked blocks are work not yet done. If a visual has no
   meaning, remove it.
2. **Paper, ink, pigment.** Calm archival neutrals carry the reading; saturated pigments arrive
   in deliberate moments. Colour is rationed so it stays intriguing.
3. **One signature moment per viewport.** A viewport has at most one animated or colour-heavy
   focal point. Everything around it is quiet typography on paper.
4. **Motion explains.** Motion reveals order and causality (define → compile → ask → check →
   replay). It never delays reading, never loops for attention, never hijacks the scroll.
5. **Editorial confidence.** Big light serif display, precise grotesk UI, mono for instruments
   and labels. Generous whitespace. Left-aligned, asymmetric, grid-true.
6. **Lab-notebook honesty.** Figures are numbered and captioned ("FIG. 00 — …"), conceptual
   illustrations say so, previews are labelled. Precision is part of the aesthetic.
7. **Performance is design.** A beautiful page that stutters is not beautiful.

What we take from each reference (and what we don't):

| Reference | Take | Don't take |
|---|---|---|
| anthropic.com | Serif + grotesk editorial system, paper backgrounds, restraint, ink footer with oversized wordmark, the header wordmark that collapses into the symbol on scroll | Their illustration style, their colours, their copy |
| typesafe.ai | Monochrome "instrument windows" with title bars, mono labels, dot-screen texture | Pixel fonts, pink dot fields, windows as wallpaper — max two per viewport, only where they show real content |
| generalintelligencecompany.com | Painted, immersive imagery with a glass caption card; smooth scroll feel | Pixel art (strictly none), cookie banners, people in paintings |
| cofounder.co | Soft, continuous motion graphics; nothing snaps | Autoplay loops that compete with reading |
| mistral.ai | Bold colour blocks that assemble/unlock as you scroll (→ Company page, §7.6) | Their pixel/retro block styling and orange palette |
| topiary × Nous | Myth + data: guilloche, crop marks, plate numbers, spectral strips, archival framing | Occult iconography, noise for its own sake |
| Owner's painting references (`brand/references/`) | Plein-air oil landscapes with digital interventions (scan slices, pixel-sorted blocks), spectral strips, security-print guilloche, crop marks | Any copying of the actual images, their logos or text |

---

## §2 Colour

### §2.1 Palette and roles (tokens in `brand/palette/tokens.css`, values in `palette.json`)

| Token | Hex | Role |
|---|---|---|
| `paper` | #f9f7f0 | Default page ground (warm archival white) |
| `paper-2` | #f2ede4 | Alternate ground, plate cards' surround, quiet bands |
| `paper-3` | #e5dfd4 | Pressed states, "limit" outcome fill, table header ground |
| `rule` | #d4cfc5 | Decorative hairlines on paper (not for input borders — §9.5) |
| `ink` | #0a0e18 | Dark ground (blue-black), footer, "how it works" |
| `ink-2` / `ink-3` | #141926 / #1f2533 | Raised dark surfaces, giant footer wordmark |
| `rule-dark` | #323846 | Hairlines on ink |
| `text` / `text-2` / `text-3` | #10141d / #424754 / #5f636e | Text on light grounds (17.2 / 8.7 / 5.6 : 1 on paper) |
| `on-dark` / `on-dark-2` / `on-dark-3` | #f6f3ec / #bfc4cf / #999eab | Text on dark grounds (on-dark-3 on ink/ink-2 only, never on ultramarine) |
| `ultramarine` | #1a30b3 | **Signature field.** Home hero, Mission block, favicon tile, primary links on paper (`ultramarine-fg`) |
| `ultramarine-deep` | #151580 | Hero field shadow, raised elements on ultramarine |
| `cobalt` | #245fd4 | Interactive accent on paper (focus ring, link hover), data lines |
| `cherenkov` | #7fc7f9 | Light on dark: field lines, accents and focus ring on ink |
| `vermilion` | #f15d35 | **The spark.** Muon track, "live" dots, Careers block. ≤ 2 % of any viewport |
| `cadmium` | #facd56 | Illumination: get-started band, Principle block, focus ring on ultramarine, `::selection` |
| `viridian` | #2a9c79 | Supported / verified |
| `madder` | #dc6684 | Warm secondary for blocks and paintings |
| `violet` / `violet-fg` | #7b5ec5 / #7658be | Refusal outcome, Research block (use `violet-fg` under any text) |

Each pigment has `-soft` (tint ground), `-fg` (text on paper, ≥ 5:1), `-glow` (text/lines on
ink, ≥ 5:1) and `-ink` (text on its soft tint, ≥ 8:1). Use those variants rather than inventing
opacities.

### §2.2 Why these colours (the psychology we are using)
- **Ultramarine** was the most precious pigment of the Renaissance (lapis lazuli, "from beyond
  the sea"). Deep saturated blue reads as depth, trust, intellect and rarity — and a large field
  of it is unusual on the web, so it is memorable without being loud. It is the brand's field.
- **Vermilion against ultramarine** is a near-complementary pair: the eye is pulled to the one
  warm stroke in a cool field (isolation / von Restorff effect). We use exactly that: one
  vermilion muon track in the hero, one vermilion block on Company. Rationing is what makes it
  intriguing; spreading it makes it cheap.
- **Cadmium** is light: optimism and invitation. It marks moments of action (get started) and
  of emphasis (selection, focus on dark blue).
- **Viridian / cadmium / vermilion / violet** map to Moth's outcomes (supported / no supported
  proof / conflict / refused). Colour is never the only carrier: every outcome chip has a label.
- **Warm paper + blue-black ink** replace pure white/black: lower glare, archival warmth, and
  every pigment looks richer against them.
- Saturation sits in the "pigment" band (OKLCH C 0.10–0.21, L 0.40–0.87): vivid, never neon
  (no fluorescent high-L/high-C combos), never dull (no greyed pastels as primary colours).

### §2.3 Proportions per page
≈ 60 % paper neutrals · 25 % ink or ultramarine fields · 10 % pigment tints/fills ·
≤ 5 % sparks (vermilion, cadmium). A page may use at most **three** pigments as fills besides
ultramarine; Company is the documented exception (the blocks are a palette celebration).

### §2.4 Text / background pairs (the only ones allowed; `contrast.test.ts` asserts ≥ 4.5 : 1
for normal text, ≥ 3 : 1 for large display text only where marked L)

| Background | Text tokens |
|---|---|
| paper, paper-2 | text, text-2, text-3, any `*-fg` |
| paper-3 | text, text-2, text-3 (4.53) |
| ink, ink-2 | on-dark, on-dark-2, on-dark-3, any `*-glow` |
| ultramarine | on-dark, on-dark-2, cadmium, cherenkov |
| ultramarine-deep | on-dark, on-dark-2 |
| cadmium | ink, text-2, cadmium-ink |
| viridian, vermilion, madder, cherenkov | ink |
| cobalt | on-dark |
| violet-fg | on-dark |
| violet (base) | on-dark **L only** (display text ≥ 24 px) — prefer violet-fg |
| any `*-soft` | its `*-ink`, text |

### §2.5 Colour rules
- Components use tokens via Tailwind utilities (`bg-ultramarine`, `text-surface-muted`,
  `border-surface-rule`). No raw hex/rgb/hsl/oklch in components; no Tailwind default palette
  (removed in tokens).
- Gradients: only (a) the hero field fallback and scrim (§7.2), (b) paintings, (c) the
  `DotScreen` pattern. No gradient text, no glow shadows, no decorative blurs.
- Surfaces switch through `data-surface` on sections; components use `surface-*` utilities so
  they adapt automatically.
- Outcome colours come only from `--color-supported|unproven|conflict|refused|limit`.

---

## §3 Typography

### §3.1 Families (loaded by `src/app/fonts.ts`, self-hosted by next/font)

| Family | Use | Loaded as |
|---|---|---|
| **Newsreader** (serif) | Display headings, editorial ledes on paper, article body, plate titles, block text | Roman: variable `wght` + `opsz` (preload, ≈ 132 KB). Italic: variable `wght` only (≈ 65 KB, not preloaded) as a separate instance `--font-newsreader-italic` |
| **Host Grotesk** (sans) | UI, navigation, buttons, body copy, ledes on dark, tables | Variable `wght` (preload, ≈ 20 KB). This is also the wordmark's face |
| **JetBrains Mono** | Eyebrows/labels, meta, code, instrument windows, numbers in instruments | Variable `wght` (≈ 40 KB, not preloaded) |

`font-optical-sizing: auto` everywhere (Newsreader's `opsz` follows the size: hairlines get
finer at display sizes — this is why the headings look expensive). `font-synthesis: none`
globally: a faux italic or bold is a bug to fix, not to hide. Every serif italic uses
`font-serif-italic` (tokens); the base layer maps `em`/`i` inside serif contexts to it.

### §3.2 Scale (tokens; fluid 375 → 1440 px)

| Token | Size (min → max) | Family / weight | Use |
|---|---|---|---|
| `display-xl` | 52 → 132 px, lh 0.93, −0.028 em | Serif 330 | Home H1 only |
| `display-l` | 40 → 72 px, lh 1.02 | Serif 340 | Page H1 |
| `display-m` | 30 → 58 px, lh 1.10 | Serif 360 | Section H2 |
| `display-s` | 24 → 36 px, lh 1.12 | Serif 370 | H3, plate titles, block text, pull quotes |
| `title` | 20 → 24 px, lh 1.2 | Sans 600 | Card titles, H4, menu group titles |
| `lede` | 18 → 21 px, lh 1.5 | Sans 400 (dark grounds) / Serif 400 (paper editorial) | Intro paragraphs |
| `body` | 17 px, lh 1.6 | Sans 400 | Default text |
| `article` | 19 → 21 px, lh 1.6 | Serif 400, oldstyle proportional figures | Research/news body |
| `small` | 15 px, lh 1.5 | Sans 400 | Secondary text, footer links |
| `caption` | 13 px, lh 1.45 | Sans 400 | Figure captions, form hints |
| `label` | 11.5 px, lh 1.3, +0.08 em, uppercase | Mono 500 | Eyebrows, meta, chips, figure labels |
| `code` | 13.5 px, lh 1.7 | Mono 400 | Code, instrument content |

Headings never skip levels; visual size and semantic level are chosen independently
(`<Heading level={2} size="display-m">`).

### §3.3 Pairing rules
- One serif display heading per section; supporting text in sans. On paper, a lede directly under
  a serif H1 may be serif (editorial pages); on dark grounds ledes are sans.
- **One italic phrase per headline, at most**, for the turn of meaning:
  "Intelligence for *closed worlds.*" Never italicise a whole heading.
- Mono is for ≤ 2 lines: labels, meta, code, instrument text. Never mono paragraphs.
- Uppercase only in mono labels. Never uppercase serif or sans body text.

### §3.4 Typographic details (checked in every screenshot review)
- `text-wrap: balance` on h1–h3 and ledes; `text-wrap: pretty` on paragraphs.
- Measure: body 60–72 ch, article 64–70 ch, ledes ≤ 48 ch, captions ≤ 60 ch.
- Real punctuation: curly quotes (“ ” ‘ ’), apostrophes (’), en dash for ranges (2–4), em dash
  with spaces in prose (" — ", as the current site writes it), ellipsis (…), × for dimensions,
  minus sign (−) in numbers, non-breaking space between numbers and units ("0.781 s",
  "2,048 characters"), thousands separators ("2,115").
- Figures: tabular lining in tables, meta and instruments (`tabular-nums`); oldstyle
  proportional in article serif body (`oldstyle-nums proportional-nums`).
- Mono meta dates use middle dots: `2026·09·22`; prose dates are "September 22, 2026"; compact
  UI dates "Sep 22, 2026".
- Links in prose: underline 1 px, `text-underline-offset: 0.22em`, colour `ultramarine-fg` on
  paper / `cherenkov` on ink; hover thickens to 2 px (no colour jump).
- `::selection`: cadmium ground, ink text (on every surface).
- Display tracking comes from the token; never add positive tracking to serif.
- Hanging punctuation for pull quotes (`hanging-punctuation: first` where supported; otherwise
  a −0.4 em text-indent on an opening quote).
- No orphans in headings (balance handles it); no widows in ledes (`pretty`).
- Icons align to the text's cap height, not its box.

---

## §4 Layout

### §4.1 Grid
- `Container`: max width 1440 px; side padding 20 px (< 640), 24 px (640–1023), 40 px (≥ 1024).
- 12 columns, gutter 24 px (≥ 1024), 16 px below. Content snaps to columns; nothing floats
  between them.
- Reading column for articles: 8 of 12 columns (≈ 720 px) starting at column 3 on desktop;
  figures may break out to 10 or 12 columns.

### §4.2 Spacing and rhythm (4 px base: 4 8 12 16 24 32 48 64 96 128 160)
- Section padding: 128 px (≥ 1024), 96 px (768–1023), 64 px (< 768). Hero and pinned sections
  define their own.
- Heading → lede 24 px; lede → actions 32 px; eyebrow → heading 16 px.
- Between cards 24 px; between list rows 0 with 1 px rules and 20 px row padding.
- Vertical rhythm is checked on screenshots: equal gaps must look equal (optical adjustments
  allowed for serif display: −4 px above display-xl first line).

### §4.3 Section compositions (use these, don't invent new ones per page)
- **Offset editorial**: eyebrow in columns 1–3 (sticky on desktop inside long sections),
  heading and content in columns 4–12 (board: "01 — PRINCIPLE").
- **Split**: text 1–5, media 7–12 (or mirrored). Media vertically centred to the heading block.
- **Full-bleed field**: hero or painting spanning the viewport; text on the left 7 columns.
- **Card grid**: 3 columns (≥ 1024), 2 (≥ 640), 1; cards align on a baseline.
- **Ledger**: full-width rows with mono index, title, meta aligned right (board: "01 Define ·
  FACTS · DEFINITIONS").

### §4.4 Breakpoints and responsive behaviour
sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1440. Designed and reviewed at **375, 768, 1440**.
- < 1024: offset-editorial stacks (eyebrow above heading); splits stack text-first; pins are
  disabled (static final states); mega menus become the mobile sheet.
- Header: 72 px tall ≥ 1024, 60 px below. Anchor offsets use `scroll-margin-top: 96px`.
- Touch targets ≥ 44 × 44 px on touch devices.
- Nothing may overflow horizontally at 320 px wide (tested).

---

## §5 Surfaces & materials

- **Surfaces**: `paper`, `paper-2`, `ink`, `ultramarine`, `cadmium` (tokens define fg/muted/
  subtle/rule/raise/accent for each). Every `<Section>` sets one; the header reads the surface
  under it and themes itself (§9.1).
- **Surface sequence**: adjacent sections never share a dark surface; a page never has more than
  two ultramarine sections; cadmium at most once per page.
- **Shape**: square by default (sections, cards, plates, windows, tables: radius 0). Radius only
  for: primary/secondary buttons and chips (pill), outcome chips (2 px), inputs (4 px), menus
  and dialogs (6 px), console panels (6 px).
- **Lines**: 1 px hairlines (`surface-rule`). Dividers may carry tick marks every 8 columns
  (4 px ticks) as a lab-instrument detail. No double borders; no borders + shadows together.
- **Elevation**: only instrument windows (`shadow-window`) and menus/dialogs (`shadow-menu`).
  Cards and plates are flat with hairline borders.
- **Focus ring**: 2 px solid `surface-accent`, 2 px offset, follows radius; never removed.
- **Texture**: flat colour. Texture appears only through art primitives (`DotScreen`,
  `Guilloche`) and paintings.
- **Scrollbars**: `scrollbar-gutter: stable` on `html`; console panes use thin scrollbars in
  surface tokens.

---

## §6 Logo in use (rules for the build; owner rules in `brand/logo/LOGO.md`)

- Render only through `<Mark>`, `<Lockup>`, `<Wordmark>` (generated geometry). Colour is
  `currentColor`: text on paper, on-dark on ink/ultramarine, ink on cadmium.
- **Weights**: the compact weight (heavier strokes) below 200 px rendered mark width, display
  weight above. At ≤ 48 px tall the compact mark uses `vector-effect: non-scaling-stroke` so
  hairlines never vanish.
- **Sizes**: header lockup 20 px tall ≥ 1024 (≈ 127 px wide), 18 px below; footer lockup 24 px;
  console rail mark 28 px wide; 404 mark 320 px wide (display weight). Minimum lockup height
  16 px; minimum mark width 24 px.
- **Clear space**: the wordmark's cap height on all sides of the lockup.
- **Allowed motion**: stroke draw-on of the mark (struts → band → rim, 1.4 s, `mb.inOut`;
  404 and footer only), uniform scale, opacity, and the wordmark collapse (§7.1).
- **Name in text**: "Mumbrane" (sentence case) in all running copy; the wordmark's capitals are
  a drawing, never typed as "MUMBRANE" in text.

---

## §7 Motion

### §7.0 System
- **Eases** (CSS tokens and GSAP `CustomEase` with the same curves, registered in `gsap.ts`):
  `mb.out` = cubic-bezier(0.16, 1, 0.3, 1) — reveals and UI; `mb.inOut` =
  cubic-bezier(0.65, 0, 0.35, 1) — state changes and scrubs; `mb.in` = cubic-bezier(0.7, 0, 0.84, 0)
  — exits; `mb.twist` = cubic-bezier(0.83, 0, 0.17, 1) — the wordmark half-twist.
- **Durations**: micro 120 ms · hover 200 · UI 320 · reveal 560 · hero 900 · signature 1400.
  Staggers: words/lines 40–70 ms, cards 80 ms, list rows 50 ms.
- **Default reveal**: `y: 16 → 0`, `opacity: 0 → 1`, 560 ms `mb.out`, trigger `top 85%`, once.
- **Heading reveal** (`SplitReveal`, H1/H2 only): lines masked (`overflow: clip` on line
  wrappers), `yPercent: 105 → 0`, 800–900 ms `mb.out`, stagger 70 ms.
- **Initial state rule**: content is visible by default in CSS. JavaScript sets the hidden start
  state only when motion is allowed and just before animating (inside `gsap.matchMedia()` with
  `(prefers-reduced-motion: no-preference)`). No-JS and reduced-motion users always see final
  states; nothing can get stuck invisible.
- **Scroll**: Lenis (`lerp: 0.1`, `smoothWheel: true`, no touch smoothing) driven by
  `gsap.ticker`, ScrollTrigger updated on Lenis scroll. Disabled for reduced motion and coarse
  pointers. In-page anchors use `lenis.scrollTo(target, { offset: -96 })`.
- **Loading strategy**: above-the-fold entrances (hero, page heroes) are CSS keyframe animations
  (no JS needed; disabled under reduced motion). GSAP, ScrollTrigger and Lenis are imported
  dynamically after first paint (`requestIdleCallback`/after `load`) by the motion provider, so
  they don't count against first-load JS; below-the-fold reveals attach when they arrive. Pins
  and scrubs initialise the same way (content is already in its final, readable state).
- **Performance**: animate transform, opacity and clip-path only; `will-change` set during
  animation and removed after; no scroll event listeners outside Lenis/ScrollTrigger;
  `ScrollTrigger.refresh()` after fonts load (`document.fonts.ready`).
- **Pins**: only the two documented pins (§7.4, §7.6), desktop ≥ 1024 only, `scrub: 0.6`,
  pinned distance ≤ 200 vh, content readable at every scroll position, snap to steps.
- **SplitText under the CSP**: verified during planning — GSAP 3.15 `SplitText.create(el, { type:
  'lines,words', mask: 'lines' })` in a Next 16 production build produced zero CSP violations (it
  styles through CSSOM). Keep the check in the lab anyway (versions change).
- **Fallback splitter** (only if a future GSAP version causes a CSP violation or Trusted Types
  report): `src/components/motion/split.ts` wraps words with `document.createElement('span')`
  + `textContent` (class `split-word`, inner `split-inner`), groups words into lines by
  `offsetTop`, keeps the original text for assistive tech (`aria-label` on the element and
  `aria-hidden="true"` on the generated spans), and restores the original text node on revert
  and on resize (debounced 150 ms).
- **Reduced motion**: no reveals, no pins, no smooth scroll, no parallax, WebGL renders one
  static frame, the header collapses instantly, the blocks are all unlocked, counters show final
  values. The page must read as complete and intentional (reviewed from the reduced-motion
  screenshots).

### §7.1 Header wordmark collapse (the Anthropic-style moment)
The header lockup (mark + wordmark) collapses into the mark alone when the page scrolls, and
expands again at the top.
- **Hysteresis**: collapse when `scrollY > 80`; expand when `scrollY < 24`. Never flickers.
- **Collapse, 520 ms total**: letters fold from last to first (E N A R B M U M), stagger 30 ms;
  each letter: `scaleY 1 → 0` (transform-origin: centre of the letter's box,
  `transform-box: fill-box`) with `x` moving 4 px per index toward the mark, opacity 1 → 0 over
  the last 40 %, ease `mb.twist`. The flattening reads as the band's half-twist passing through
  the letters. As the last letter folds, the mark does a uniform scale 1 → 1.04 → 1 (240 ms).
- **Expand, 480 ms**: the reverse order (M → E), `scaleY 0 → 1`, `mb.out`.
- The lockup keeps its box (no layout shift, nav items do not move). The link keeps
  `aria-label="Mumbrane — home"` in both states.
- Reduced motion: state swaps instantly. The mark geometry is never transformed except by the
  uniform scale above.

### §7.2 Membrane hero (home)
A WebGL2 field (`membrane.frag`): a ribbon of cherenkov field lines with a half-twist — a Möbius
band seen edge-on — drifting slowly across ultramarine, crossed by muon tracks that leave ripples
where they pass through. One track in five is vermilion (the spark).
- **Uniforms**: `uSeed 1.37`; `uBgA` ultramarine, `uBgB` ultramarine-deep, `uLine` cherenkov,
  `uSpark` vermilion, `uWarm` cadmium (RGB floats from `src/lib/gl/colors.ts`, which mirrors
  `palette.json`; a unit test asserts they match). `uTime` in seconds (real time), `uPointer`
  smoothed (lerp 0.08/frame; `(-1,-1)` when no fine pointer), `uDpr` the capped DPR.
- **Budget**: DPR cap 1.5 (1.0 when `hardwareConcurrency ≤ 4` or `deviceMemory ≤ 4`); 60 fps
  cap (30 fps on the low tier); paused when off-screen (IntersectionObserver) or tab hidden;
  ≤ 4 ms GPU per frame at 1440p.
- **Before the first frame** the section shows a CSS field (`radial-gradient` from ultramarine at
  80 % 26 % to ultramarine-deep, matching the shader's background) — no poster image, so the H1
  stays the LCP element. The canvas fades in over 900 ms when its first frame is ready.
- **Fallbacks**: no WebGL2, `Save-Data`, or context loss → the poster image
  (`/paintings/membrane-poster-*.avif`, generated by `pnpm art`, `loading="lazy"`,
  `fetchpriority="low"`). Reduced motion → one static frame at `uTime = 2.0` (the frozen
  still in `brand/board/hero-still.png`).
- **Composition**: text in columns 1–7; the ribbon runs from left-centre to lower right; a scrim
  (`linear-gradient` from ultramarine-deep at 45 % opacity on the left third to transparent)
  guarantees ≥ 4.5 : 1 for the lede over any line. Verify on screenshots at all widths.
- **Chrome**: eyebrow above H1 with a small cadmium dot ("MOTH PREVIEW 004 · LOCAL CLI ·
  CHECKED ANSWERS"); caption bottom-left in mono on-dark-2: "FIG. 00 — A MEMBRANE OF FIELD
  LINES, CROSSED BY COSMIC-RAY MUONS"; bottom-right "SCROLL" with a 1 px vertical line whose
  highlight travels down every 2.4 s (static in reduced motion).
- **Entrance** (first load, ≤ 1.4 s, CSS keyframes — see §7.0 loading strategy): 0 ms canvas
  fade; 120 ms eyebrow rises; 200 ms H1 lines (per-line mask reveal on server-rendered line spans,
  stagger 80 ms, 900 ms); 520 ms lede; 640 ms CTAs; 800 ms caption.
- **Height**: `min(100svh, 920px)` ≥ 1024; `88svh` below (min 560 px).

### §7.3 Principle scrub (home, PAGES §1 section 2)
The statement is set in `display-m` serif across columns 4–12. First sentence in `text`; the
rest starts in `text-3` (still 5.6 : 1 — readable before it "lights") and turns `text` word by
word as it scrolls through (`ScrubText`, trigger `top 75%` → `bottom 45%`, scrub 0.5). When the
scrub completes, the five outcome chips enter one by one (stagger 60 ms). Reduced motion: all
text in `text`, chips visible.

### §7.4 Pinned Moth demo (home, PAGES §1 section 3)
Ink surface. Left (columns 1–5): eyebrow "02 — HOW MOTH WORKS", H2, lede, and the five-step
ledger (01 Define · 02 Compile · 03 Ask · 04 Check · 05 Replay, each with a right-aligned mono
tag). Right (columns 7–12): an `InstrumentStack` — window `purchasing.field` with a "PREVIEW 004"
tag, and window `evidence.trace` overlapping its lower-right corner.
- **Desktop ≥ 1024**: the section pins for 120 vh. Scroll progress drives the active step
  (snap to 5 steps, 300 ms `mb.inOut`):
  1. **Define** — DEFINE and FACTS blocks write in line by line (line reveal, not per-character).
  2. **Compile** — a thin progress rule fills; a mono chip "build f3a9" appears; faint field
     lines behind the window content straighten.
  3. **Ask** — the ASK line appears: "Is orderone / ordertwo a purchase-ready item?"
  4. **Check** — rows resolve: orderone → SUPPORTED (viridian), ordertwo → NO SUPPORTED PROOF
     (cadmium), each with its one-line reason.
  5. **Replay** — `evidence.trace` slides in (x 24 → 0, opacity) showing the requirement trace
     and "replay build f3a9 · same runtime".
  The active ledger row gets `aria-current="step"`, on-dark text and a cherenkov index; rows are
  buttons that scroll to their step.
- **< 1024 and reduced motion**: no pin; the ledger is static and both windows render in their
  final state below it.
- All window content is real text and part of the accessibility tree in its final form.

### §7.5 Reveals, plates, seal, numbers
- **Plates** (research/news cards): crop marks draw in (each corner scales from 0, 320 ms),
  then the painting unveils (`clip-path: inset(0 0 100% 0)` → `inset(0)`, 900 ms `mb.inOut`),
  then the spectral strip segments grow left to right (scaleX, stagger 20 ms). Hover (fine
  pointers): painting scale 1.02 over 600 ms and a varnish sheen (a soft diagonal highlight
  pseudo-element crossing once, 900 ms); title underline appears. Reduced motion: none.
- **EvidenceSeal**: rosette rings draw on (DrawSVG, 1.4 s, stagger per ring) while the circular
  legend rotates 12° → 0°. Once.
- **Numbers** (qualification and measured tables): never count up — the numbers are evidence
  and appear as they are. Rows fade in with the default reveal.

### §7.6 Blocks unlock (Company page — the Mistral-inspired moment)
"The lab, block by block." A mosaic of 15 blocks on a 6-column grid (desktop; three blocks span
two columns), 12 unlockable and 3 that stay locked because they are genuinely future work.
- **Locked look**: paper ground with `DotScreen` (1 px dots, 6 px pitch, `text-3` at 25 %),
  1 px `rule` border, mono "LOCKED" label bottom-left, a small lock icon top-right.
- **Unlock** (one block at a time, in a designed order that alternates colours and sizes): an
  iris wipe from the block's top-left corner (`clip-path: circle(0% at 0 0)` →
  `circle(150% at 0 0)`, 600 ms `mb.inOut`) reveals the pigment fill; then the mono label and
  the serif text rise 12 px and fade in (stagger 60 ms). A counter at the top right, mono and
  tabular — "08 / 12 UNLOCKED" — ticks with each unlock.
- **Desktop ≥ 1024**: the section pins for ≈ 180 vh and scroll progress maps to 12 unlocks
  (scrub 0.6, snap per block). Linked blocks are links: focusing a still-locked linked block
  unlocks it immediately (keyboard users never wait on scroll). Block text is always in the
  accessibility tree; the locked overlay is decorative (`aria-hidden`).
- **< 1024**: 2-column mosaic, no pin; each block unlocks as it enters the viewport.
- **Reduced motion / no JS**: all 12 unlocked from the start; the counter reads "12 / 12".
- **Contrast**: each block's fill/text pair must be in §2.4 (violet uses `violet-fg`).
- Block content and colour map: PAGES §5 and CONTENT §3.5. The 3 permanent locks are labelled
  honestly (e.g. "Hosted console — in preparation").

### §7.7 Micro-interactions
- **Buttons**: hover — background shifts one step (e.g. paper → paper-2 for ghost; primary gets
  a 1 px inner highlight), the arrow chip moves 2 px right, 200 ms `mb.out`; press — scale 0.98,
  120 ms; loading — label stays, a 1 px progress line runs along the bottom.
- **Nav links**: underline grows from the left (scaleX 0 → 1, 200 ms); current page keeps it.
- **Mega menu**: panel fades and rises 8 px (240 ms `mb.out`); items stagger 20 ms; closes in
  160 ms `mb.in`. No hover-intent delays shorter than 120 ms (prevents flicker).
- **Mobile sheet**: opens with a clip-path circle expanding from the menu button (420 ms
  `mb.inOut`); groups are accordions (height via `grid-template-rows: 0fr → 1fr`, 320 ms).
- **Chips/toggles**: 120 ms colour transitions. **Copy buttons**: icon swaps to a check for
  1.6 s with an `aria-live` "Copied" message.

### §7.8 Footer giant wordmark
At the bottom of the ink footer the wordmark spans the container width, in `ink-3` on `ink`
(decorative, `aria-hidden`), clipped so only its top ≈ 62 % shows. On entering the viewport the
letters rise from `yPercent 40 → 0` with a 40 ms stagger (900 ms `mb.out`). Reduced motion:
static. The footer lockup above uses the draw-on reveal once.

### §7.9 Page transitions
None beyond Next's instant navigation. On route change: scroll to top (Lenis `immediate`), move
focus to `<main>`'s first heading for screen readers, and replay only the new page's hero reveal.

---

## §8 Imagery engine

### §8.1 Paintings — "oil on code"
The research imagery is **hard-coded paintings**: procedural plein-air landscapes rendered by
two shaders at build time and shipped as static images.
1. **Scene pass** (`scene.frag`): a flat-colour landscape at half resolution — one of four
   scenes: `range` (cobalt mountains under a cadmium sky), `sky` (cumulus over a dark horizon),
   `meadow` (green field, tree line, pale sky), `sea` (dusk sky over ultramarine water with
   glints).
2. **Paint pass** (`paint.frag`): repaints the scene as oil — oriented bristle strokes in two
   sizes that follow the image structure, impasto relief, canvas weave and varnish.
   Optional Replay-style interventions: **scan slices** (a band of horizontal lines displaced
   sideways) and **pixel-sorted blocks** (small rectangles of sorted colour streaks).
Paintings never contain text, faces, figures, logos or pixel-art artefacts. They are never
rendered live in the browser.

### §8.2 Scenes, presets and the required set
Tested presets are in `reference/shaders/presets.json` (use them as the starting point; tune only
palettes toward tokens and seeds). Stroke size: `uStroke 30` at 1440 px output width, scale
linearly with width (25 at 1200, 50 at 2400).

| id | Scene | Where | Interventions | Aspect |
|---|---|---|---|---|
| `research-hero` | range | /research hero | slices + blocks | 21:9 |
| `plate-field` | range | "Towards field-based intelligence" | blocks | 16:10 |
| `plate-wording` | meadow | "Different wording. Different meaning." | none | 16:10 |
| `plate-evidence` | sea | "When the field cannot establish an answer" | none | 16:10 |
| `plate-preview` | sky | "Introducing Moth Preview 004" | slices | 16:10 |
| `inquiry-representation` | range (new seed) | Research: Representation | none | 4:5 |
| `inquiry-dynamics` | sea (new seed) | Research: Dynamics | slices | 4:5 |
| `inquiry-causality` | sky (new seed) | Research: Causality | blocks | 4:5 |
| `company-plate` | meadow (new seed) | Company | none | 16:10 |
| `membrane-poster` | membrane.frag at `uTime 2.0` | Home fallback | — | 16:9 |

Render at 2400 px wide (poster 2560 × 1440). Review each at full size and at 640 px: re-seed
anything muddy, noisy, accidental-looking or visually similar to another plate.

### §8.3 Outputs and presentation
- `scripts/images.ts` writes AVIF (q 55–62) + WebP (q 78) at 640/1024/1600/2400 widths,
  a palette of 8–10 colours with weights (median cut on a 160 px thumbnail), and a 24 px LQIP.
  Because inline styles are blocked, the LQIP and a dominant-colour fallback are emitted as
  generated CSS classes in `src/app/lqip.css` (`.lqip-<id> { background: <colour>
  url(data:image/webp;base64,…) center/cover }`), imported once by the root layout.
- **Plate anatomy** (board §12 "plates"): paper card with a 1 px rule border and 16 px padding;
  mono header row "PLATE I" (left) and "2026·09·16" (right); the painting framed by four
  12 px L-shaped crop marks set 6 px outside its corners; serif `display-s` title (≤ 2 lines);
  mono meta "RESEARCH PERSPECTIVE · OIL ON CODE · SEED 3"; a 6 px spectral strip from the
  painting's palette weights along the bottom edge.
- Plate numbers are Roman numerals in publication order. "SEED n" is the painting's real seed.

### §8.4 Guilloche (security-print line work)
Seeded SVG line families generated as path data (server components, memoised, coordinates
rounded to 1 decimal):
- `band`: 24–40 sinusoidal lines modulated by a slow envelope, spanning a section's width
  (e.g. behind the Research teaser heading on paper-2, `text-3` at 12 % opacity).
- `rosette`: epitrochoid rings (`R`, `r`, `d` from the seed; 3–6 rings) for the EvidenceSeal.
- `border`: a thin interlaced frame for OG images and the 404 page.
Stroke 0.6 px (non-scaling), colour from surface tokens, never animated except the seal draw-on.

### §8.5 Other art primitives (server components, zero JS)
- `CropMarks` — four 12 px L-marks, 1 px, `surface-subtle`.
- `RegistrationMark` — 16 px circle + crosshair; used sparingly as a figure anchor.
- `SpectralStrip` — SVG rects whose widths are palette weights; height 6 px; no gaps.
- `EvidenceSeal` — rosette + legend "CHECKED · RETAINED · REPLAYABLE ·" on a circular text path
  + the mark (uniformly scaled) at the centre. 160–220 px.
- `DotScreen` — `radial-gradient` dot texture (1 px dot, 6 px pitch) in a surface token colour.

### §8.6 Diagrams
Line-drawn SVG in the house style: 1 px strokes (`surface-fg` at 70 %), mono labels, pigment
dots for emphasis, no fills otherwise. Needed: the five-step pipeline (Moth), a light cone with
"what can reach a decision" annotations (Research: causality; Home: limits), a layered field
(Research: representation). Every diagram has a FIG number and, where it depicts a hypothesis,
the caption "Conceptual illustration — not an experimental result."

---

## §9 Components

### §9.1 Header
- Row (72 px ≥ 1024): lockup (left) · nav: Solutions ▾, Developer ▾, Company ▾, Pricing, News,
  Research · actions (right): "Contact sales" (ghost pill), "Try for free" (primary pill).
  The nav follows the lockup, left-aligned, 40 px after it (as on the board); items 32 px apart
  (24 px at 1024–1279); `small` sans 500.
- Transparent at the top of the page, adopting the surface under it: it samples the
  `data-surface` of the section beneath via an IntersectionObserver on a 1 px line under the
  header and sets its own `data-surface` (colour transitions 240 ms). After 8 px of scroll it
  gains a backdrop (`surface` at 86 % + `backdrop-filter: saturate(1.4) blur(14px)`) and a
  bottom hairline. Sticky, never hides on scroll (the collapse is the scroll behaviour).
- < 1024: lockup · "Try for free" (compact) · menu button (44 × 44, animated two-line icon).

### §9.2 Menus
- **Mega menus** (Solutions, Developer, Company) are disclosure panels: a `button` with
  `aria-expanded`/`aria-controls`; the panel is a region with links, not an ARIA menu. Open on
  click and on hover (fine pointers, 120 ms intent), close on Esc (focus returns to the
  trigger), outside click, or focus leaving. One open at a time.
- Panel: full container width under the header, paper surface (ink when the header is on a dark
  surface), 6 px radius on the bottom corners, `shadow-menu`. Layout: link columns (title in
  `title` sans 600 + one-line description in `small` text-2) + a feature card on the right
  (e.g. Developer → "Moth Preview 004 — Release & evidence" with a mini instrument window; Company
  → latest news item; Solutions → "Use cases" with the four example worlds).
- **Mobile sheet** (§7.7): full height, header row with close button, accordion groups, direct
  links, CTAs pinned to the bottom, focus trapped, `Esc` closes, body scroll locked,
  `inert` on the page behind.

### §9.3 Footer (ink; board §12)
Top: lockup (on-dark) + tagline in serif `display-s` "Intelligence for closed worlds." (left,
columns 1–4); six link columns (columns 5–12): Solutions · Company · Developer · Enterprise ·
Legal · Social, headings in mono label `on-dark-3`, links in `small` `on-dark-2` → `on-dark` on
hover. Middle: 1 px `rule-dark`. Legal row: "© 2026 Mumbrane" · "Privacy choices" (link) ·
"Evidence, retained." (right, serif italic). Bottom: the giant wordmark (§7.8). Mobile: columns
become a 2-column grid; Social stays last.

### §9.4 Buttons and links
- **Primary** (pill, 44 px tall md / 52 px lg, padding 20/24 px): on light surfaces `ink` fill +
  `on-dark` text; on dark surfaces `paper` fill + `ink` text. Optional arrow chip: 24 px circle
  in the inverse colour with → icon.
- **Secondary** (ghost pill): 1 px border `surface-fg` at 40 %, text `surface-fg`; hover fills
  `surface-raise`.
- **Text link with arrow**: `title`/`small` sans, 1 px underline, trailing → that moves 2 px.
- **Disabled** is rare: prefer explaining why an action is unavailable.
- Labels are verbs or destinations ("Explore Moth", "Read the research") — never "Click here".

### §9.5 Forms
- Label above input (sans 500 `small`), hint below (`caption`, text-2), error below hint
  (`caption`, `vermilion-fg`, prefixed with a warning icon and "Error:" visually hidden).
- Inputs: 48 px tall, 4 px radius, 1 px border `text-3` (≥ 3 : 1 non-text contrast), paper
  ground; focus: 2 px `surface-accent` ring; invalid: border `vermilion-fg`.
- Select: native `<select>` styled; checkbox: 20 px square custom box with a check icon.
- Layout: single column ≤ 720 px wide; related fields may pair on ≥ 768.
- Submit area: primary button + a one-line privacy note linking to the privacy notice.
- Preview success state: a panel on paper-2 with a viridian check icon, heading, text, and the
  "Send it by email instead" button (SECURITY §6).

### §9.6 Instrument window (typesafe-inspired, used sparingly)
- Title bar 28 px: `paper` ground, 1 px `ink` bottom border, mono `label` filename left
  ("purchasing.field"), optional tag chip (ink fill, on-dark text: "PREVIEW 004"), three 8 px
  outline squares right (decorative, `aria-hidden`).
- Body: `ink-2` (on ink surfaces) or `paper` (on paper) ground, mono `code` text, 20 px padding;
  section tags (DEFINE / FACTS / ASK) as small `paper-3` blocks with `ink` mono text; entity
  names in `ink-3` chips; results as ledger rows with outcome chips.
- Footer strip (optional): 24 px `DotScreen`.
- Border 1 px `rule-dark`/`rule`; `shadow-window`; radius 0.
- Max two windows per viewport (`InstrumentStack` offsets the second by 24 px down/right with a
  higher z-index). Windows show real, relevant content — never filler.

### §9.7 Chips and outcomes
- **StatusChip** (outcomes): 24 px tall, 2 px radius, 8 px square dot + mono `label` text.
  SUPPORTED (viridian), NO SUPPORTED PROOF (cadmium), CONFLICT (vermilion), REFUSED (violet-fg,
  on-dark text), RESOURCE LIMIT / INCOMPLETE / INCOMPATIBLE (paper-3). Text first, colour second.
- **Chip** (tags, filters): pill, 32 px, 1 px border; selected = ink fill (on light).
- **Outcome ledger**: rows of chip + meaning + "what to do next" (CONTENT §3.1/§3.2).

### §9.8 Cards, plates, lists, tables
- **Plate**: §8.3. **News row**: date (mono) · category (mono) · title (serif `display-s`) ·
  arrow; hover: title underline + arrow nudge; 1 px rules between rows.
- **Feature card**: paper-2 ground, 32 px padding, icon (20 px) + `title` + `small` text + link.
- **Tables**: full-width, 1 px rules, header row in mono `label` on paper-3, numbers right-aligned
  tabular, captions above in `caption` with the source ("From the Preview 004 qualification
  report"). On < 768, tables scroll horizontally inside a focusable region with a visible
  "Scroll →" hint, never squashed.

### §9.9 Icons
One inline SVG set, ≤ 24 icons, drawn on a 20 px grid, 1.5 px stroke, round caps/joins,
`currentColor`, `aria-hidden` unless meaningful: arrow-right, arrow-up-right, chevron-down,
chevron-right, menu, close, plus, minus, check, copy, download, sun, moon, monitor, key, chart,
flask, book, gear, replay, layers, lock, info, warning. No icon fonts, no emoji, no sparkles.

### §9.10 Code and data blocks
Mono `code` on `paper-2` (light) or `ink-2` (dark), 20 px padding, 1 px rule border, no
syntax-highlight rainbow: keywords `text` weight 500, strings `ultramarine-fg`, comments `text-3`
(dark: on-dark / cherenkov / on-dark-3). A header row with the language/label and a copy button.
Illustrative blocks carry an "Illustrative" tag chip in the header (CONTENT §4).

### §9.11 Article prose
Serif `article` size, 64–70 ch column; H2 serif `display-s` with 64 px above; H3 sans `title`;
lists with hanging bullets (en dash markers); blockquotes as pull quotes (serif italic
`display-s`, 2 px `ultramarine` left rule); figures with FIG labels; footnotes as numbered
sidenotes on ≥ 1280 and endnotes below. Cite block at the end (mono label "CITE AS" + text +
copy button).

### §9.12 Console
Console-specific components (rail, world selector, ask bar, result card, evidence drawer) are
specified in CONSOLE.md and reuse these tokens and primitives.

---

## §10 Accessibility & responsive specifics
- Landmarks: one `header`, `nav` (labelled "Primary"), `main#main`, `footer`; skip link first.
- Heading order strict; one H1 per page.
- Focus visible everywhere; focus order follows reading order; no positive `tabindex`.
- Every animation respects reduced motion; nothing flashes more than 3×/s.
- Contrast pairs from §2.4 only; non-text UI boundaries ≥ 3 : 1.
- Forced colours (`@media (forced-colors: active)`): borders become visible, focus uses
  `Highlight`, SVGs use `currentColor`, painting frames keep a border.
- Zoom to 200 % and 320 px width without loss of content or horizontal scroll.
- Language `lang="en"`; decorative SVGs `aria-hidden`; paintings have alt text written as a
  description of the painting ("Oil-on-code study: cobalt mountains under a cadmium sky").
- Print stylesheet for articles and legal pages: hide header/footer chrome, black on white,
  show link URLs.

---

## §11 Never do
Pixel art or pixel fonts · stock photos, AI-generated images, third-party brand assets ·
glassmorphism beyond the one research caption card · neon glows, gradient text, drop shadows on
text · emoji or "AI sparkle" icons · rounded-2xl card soup · carousels, autoplay video, cursor
followers, scroll-jacking beyond the two documented pins · parallax on text · more than two
instrument windows per viewport · mono paragraphs · centred long text · uppercase serif ·
counting-up numbers · fake logos walls, testimonials, metrics · lorem ipsum in anything that
ships · colours outside the tokens · a second accent "just for this page".

---

## §12 Board map (`brand/board/board.png`, 1440 × 5556; cropped views in `brand/board/sections/`)

| y (px) | Crop | Section | Status |
|---|---|---|---|
| 0–879 | `01-hero.png` | Home hero on ultramarine with the membrane field, header, CTAs, FIG caption | Canonical |
| 880–1508 | `02-principle.png` | Principle statement + outcome chips | Canonical (dim colour: use `text-3`; the board's grey is too light for AA) |
| 1509–2428 | `03-how-moth-works.png` | How Moth works on ink: ledger + instrument windows | Canonical |
| 2429–3387 | `04-research-plates.png` | Research teaser on paper-2 with guilloche band and three plates | Canonical |
| 3388–4381 | `05-company-blocks.png` | Company blocks mosaic ("08 / 12 UNLOCKED" mid-sequence) | Canonical for the look; blocks, colours and copy per CONTENT §3.5 (violet → `violet-fg`) |
| 4382–4994 | `06-footer.png` | Ink footer with six columns, legal row, giant wordmark | Canonical |
| 4995–5555 | `07-palette-type.png` | Palette and type specimens | Reference only |

`brand/board/hero-still.png` is the membrane at `uTime 2.0`; `plate-0..3.png` are the four
reference paintings (range with interventions, sky, meadow, sea). They are targets, not assets:
the build regenerates its own through `pnpm art`.
