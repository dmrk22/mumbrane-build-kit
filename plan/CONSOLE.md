# Console specification (preview)

The owner's brief: *the console should be the simplest to use.* Its one job in this build:
**pick a world, ask a question, see the answer and the evidence.** Everything else is secondary
and must not get in the way. There is no backend: answers come from a small deterministic
simulator in the browser, labelled everywhere as **Simulation — not Moth**.

Contents: §1 Principles · §2 Shell · §3 Entry · §4 Playground · §5 Worlds (fixtures) ·
§6 Simulator · §7 Result card · §8 Evidence · §9 Keys, Usage, Settings · §10 States & theme ·
§11 Keyboard · §12 Accessibility · §13 Backend seams · §14 Acceptance

---

## §1 Principles
1. **Three actions to insight**: from `/console`, a first-time user sees an answer *and its
   evidence* in ≤ 3 actions (open a world → click an example question → evidence is already
   visible; expanding details is optional).
2. **Zero setup**: no sign-in, no keys, no configuration, no empty canvas. Every world opens with
   example questions ready to click.
3. **One primary action per screen**: in the playground it is "Ask". Nothing else is a primary
   button there.
4. **Plain words**: "Ask", "Evidence", "Rebuild", "Replay". Every Moth term (field, build,
   definition) has a one-line inline explanation the first time it appears (no tooltips).
5. **Honest by construction**: a persistent "Simulation" tag in the top bar; the entry screen
   explains it in one sentence; outputs are marked as simulated; nothing pretends to be a hosted
   Moth.
6. **Calm density**: generous spacing, mono only for data, one accent per state. Same tokens as
   the site (DESIGN), light and dark themes.

---

## §2 Shell (`src/app/console/layout.tsx`)
- **Rail** (left, 72 px, ≥ 768): the mark (28 px, links to `/`), then Playground (flask), Keys
  (key), Usage (chart); bottom: Docs (book → `/developers/docs`), Settings (gear). Each item:
  20 px icon + 11 px label under it, 56 px tall hit area, active item with a 2 px accent bar and
  `aria-current="page"`. `<nav aria-label="Console">`.
- **Top bar** (48 px): page title (`title`), then right-aligned: `Tag` "Simulation" (paper-3 /
  ink-3), theme control (sun/moon/monitor segmented, 3 × 32 px).
- **Mobile (< 768)**: bottom tab bar (Playground, Keys, Usage, Settings; 56 px, safe-area inset)
  replaces the rail; Docs moves into Settings.
- **Surfaces**: light = `paper` page / `paper-2` panels / `rule` borders; dark = `ink` page /
  `ink-2` panels / `rule-dark` borders — via `[data-console-surface]` (§10.2). Radius 6 px on
  panels, 4 px on inputs.
- `noindex, nofollow`; not in the sitemap; robots disallow.

## §3 Entry (`/console`)
- H1 (`display-s` serif): "Console preview".
- Text: "Ask questions about an example world and inspect the evidence. Everything runs in your
  browser as a simulation — nothing is sent anywhere."
- Four world cards (2 × 2 ≥ 768, stacked below): name (`title`), one-line blurb, a tiny preview of
  the world's main definition in mono, "Open →". Whole card is the link to
  `/console/playground?world=<id>`.
- Footnote (`caption`): "Simulation — not Moth. The worlds are named after the four synthetic
  example worlds in Moth Preview 004; their contents here are our own illustrative examples.
  Moth itself runs locally →" (`/moth`).
- No credential fields, no sign-in button.

## §4 Playground (`/console/playground?world=…`)
`world` is parsed with `parseWorld` (SECURITY §4.5); missing/invalid → redirect to `/console`.

**Desktop ≥ 1280** — three columns:
1. **World panel** (320 px, scrollable): world switcher (4-item segmented list); build badge
   (`build 3c1e · active`, mono) with one-line explanation "A build is a compiled version of this
   world. Answers remember the build they came from."; **Definitions** (each as a card: the
   sentence in serif `small`, its requirements as chips); **Facts** (grouped by entity,
   sentences in mono `code`); **Try a change** (variants as radio options with a one-line effect
   description, and a secondary "Rebuild" button that is enabled only when the selection differs
   from the active build).
2. **Ask column** (fluid, max 760 px): the ask bar (§4.1), example-question chips, then the
   results stream (newest first) of Result cards (§7).
3. **Evidence panel** (380 px): evidence for the selected result (§8). When nothing is selected:
   "Ask a question to see its evidence here."

**1024–1279**: world panel collapses to a "World" button in the top bar that opens it as a
left drawer; evidence stays on the right. **< 1024**: single column — world summary (name, build,
"Show world") at the top, ask bar, results; evidence renders inside each result card (expanded
for the newest result).

### §4.1 Ask bar
Single-line input (grows to 3 lines), placeholder "Ask about <world>… e.g. Is orderone a
purchase-ready item?", a primary "Ask" button, character counter that appears after 1,800
characters ("1,934 / 2,048"). `Enter` asks, `Shift+Enter` newline is not needed (questions are
one sentence — `Enter` always asks). Under it: 4–6 example chips per world; clicking a chip asks
immediately (fills the input and submits). Last chip in Trails inserts a 2,100-character question
to demonstrate the resource limit.

## §5 Worlds (fixtures in `src/content/console/`)

### §5.1 Types (`src/lib/console/types.ts`)
```ts
export type Requirement =
  | { type: 'property'; property: string; text: string }              // "has funds available"
  | { type: 'relation'; relation: string; target: string; text: string } // supplier → 'approved supplier'
  | { type: 'is'; target: string; text: string }                        // layered: "is a lendable book"
export type Definition = { id: string; term: string; kind: string; requires: readonly Requirement[]; text: string }
export type Fact =
  | { type: 'property'; entity: string; property: string; negated?: true; text: string }
  | { type: 'relation'; entity: string; relation: string; object: string; text: string }
export type Variant = { id: string; label: string; effect: string; replace: { definitionId: string; requires: readonly Requirement[]; text: string } }
export type World = {
  id: 'purchasing' | 'libraries' | 'trails' | 'venues'
  name: string; blurb: string
  entities: readonly { id: string; kind: string }[]   // ids: single lowercase words
  definitions: readonly Definition[]                   // positive conditions only
  facts: readonly Fact[]                               // explicit negative facts allowed
  examples: readonly string[]
  variants: readonly Variant[]
}
```

### §5.2 The four worlds (illustrative content; entity ids single words, definitions positive)
**Purchasing** — "Is an order ready to purchase? Funds and supplier approval."
- Definitions: *approved supplier* = supplier that passed inspection. *purchase-ready item* = item
  with funds available and an approved supplier (relation `supplier`).
- Facts: `atlas` passed inspection · `birch` passed audit · `cedar` passed inspection · `cedar`
  did not pass inspection (explicit negative) · `orderone` has funds available, appoints `atlas` ·
  `ordertwo` has funds available, appoints `birch` · `orderthree` has funds available, appoints
  `cedar` · `orderfour` appoints `atlas`.
- Examples → expected: Is orderone a purchase-ready item? → SUPPORTED · Does ordertwo meet the
  requirements for a purchase-ready item? → NO_SUPPORTED_PROOF (missing: birch passed inspection)
  · Is orderthree a purchase-ready item? → CONFLICT (cedar) · Is orderfour a purchase-ready item?
  → NO_SUPPORTED_PROOF (missing: funds available) · Is ordertwo not a purchase-ready item? →
  REFUSED (negated question) · Is atlas an approved supplier? → SUPPORTED.
- Variant "Require audit instead of inspection" → orderone NO_SUPPORTED_PROOF, ordertwo
  SUPPORTED, orderthree NO_SUPPORTED_PROOF, orderfour NO_SUPPORTED_PROOF.

**Libraries** — "Can a book be lent or recommended? Catalogue and collection rules."
- Definitions: *lendable book* = book that is catalogued and in the lending collection.
  *recommended book* = is a lendable book (layered `is`) and has a reviewed summary.
- Facts: `bookone` catalogued, in the lending collection, has a reviewed summary · `booktwo`
  catalogued · `bookthree` catalogued, in the lending collection.
- Examples: Is bookone a recommended book? → SUPPORTED (two layers) · Is booktwo a lendable
  book? → NO_SUPPORTED_PROOF · Is bookthree a recommended book? → NO_SUPPORTED_PROOF (missing
  summary) · Is bookfour a lendable book? → REFUSED (bookfour is not declared) · Is bookone a
  rare book? → REFUSED (rare book is not defined).
- Variant "Drop the summary requirement" → bookthree SUPPORTED as a recommended book.

**Trails** — "Is a trail accessible? Surface and status rules."
- Definitions: *accessible trail* = trail that is open and has a paved surface. *family trail* = is
  an accessible trail and has a shaded section.
- Facts: `trailone` open, paved surface, shaded section · `trailtwo` open · `trailthree` open, not
  open (explicit negative), paved surface.
- Examples: Is trailone a family trail? → SUPPORTED · Is trailtwo an accessible trail? →
  NO_SUPPORTED_PROOF · Is trailthree an accessible trail? → CONFLICT · the 2,100-character
  question → RESOURCE_LIMIT.
- Variant "Paved surface not required" (accessible trail = trail that is open) → trailtwo
  SUPPORTED as an accessible trail; trailthree stays CONFLICT. Variants only replace
  definitions; facts never change between builds.

**Venues** — "Is a venue ready for an event? Access, licence, and booking."
- Definitions: *suitable venue* = venue with step-free access and a licence for events. *ready
  venue* = is a suitable venue and has a confirmed booking.
- Facts: `hallone` step-free access, licence for events, confirmed booking · `halltwo`
  step-free access, has no licence for events (explicit negative) · `hallthree` step-free access,
  licence for events.
- Examples: Is hallone a ready venue? → SUPPORTED · Is halltwo a suitable venue? →
  NO_SUPPORTED_PROOF (the field records that halltwo has no licence for events) · Is hallthree a
  ready venue? → NO_SUPPORTED_PROOF (missing: confirmed booking) · Does hallone meet the
  requirements for a ready venue? → SUPPORTED.
- Variant "Booking not required" → hallthree SUPPORTED as a ready venue.

Outcomes the simulator can return — and only these (they are the documented ones): SUPPORTED,
NO_SUPPORTED_PROOF, CONFLICT, REFUSED (language), RESOURCE_LIMIT. It never invents a "fails"
outcome: an explicit negative fact yields NO_SUPPORTED_PROOF with the negative fact cited.

## §6 Simulator (`src/lib/console/`, pure TS, unit-tested)

### §6.1 Pipeline — `ask(world, build, raw) → Result`
1. Length: `raw.length > 2048` → RESOURCE_LIMIT ("The question is longer than 2,048
   characters.") — checked before any other work.
2. Normalise: trim, collapse whitespace, strip one trailing `?`, lowercase, curly → straight
   quotes. Reject control characters → REFUSED.
3. Negation: token `not` or `n't` anywhere → REFUSED ("Negated questions are not supported in
   this language contract. Ask the positive question instead.").
4. Parse (§6.2). No match → REFUSED ("This question form is outside the supported language.
   Try: Is <entity> a <term>?").
5. Resolve: entity must be declared (else REFUSED "<x> is not declared in this world"); term must
   be defined (else REFUSED "<term> is not defined in this world").
6. Evaluate (§6.3) against the build's snapshot. Measure duration with `performance.now()`.

### §6.2 Parser (linear-time; no user-built RegExp)
Two anchored patterns over the normalised string, with fixed alternations only:
`^is ([a-z]+) (?:a|an) ([a-z][a-z -]*)$` and
`^does ([a-z]+) meet the requirements for (?:a|an) ([a-z][a-z -]*)$`. The term is matched
against definition terms after collapsing hyphens/spaces ("purchase ready item" =
"purchase-ready item").

### §6.3 Evaluator
- `holds(entity, definition, depth)` → `{ status: 'supported' | 'missing' | 'conflict', trace }`.
- Property requirement: positive fact present and negative fact present → conflict; positive only
  → supported; otherwise missing (cite the negative fact if present).
- Relation requirement: collect objects related by `relation`; supported if any object `holds`
  the target definition; conflict if any object's evaluation is a conflict and none is supported;
  else missing ("no <relation> that is <target>").
- `is` requirement: recurse on the same entity with the target definition.
- Aggregate: any conflict → CONFLICT; all supported → SUPPORTED; else NO_SUPPORTED_PROOF with the
  list of missing requirements (leaves of the trace).
- Guards: depth ≤ 16 and a step budget of 256 evaluations → RESOURCE_LIMIT; cycle detection via a
  visited set (a cycle counts as missing, never loops).

### §6.4 Builds, rebuild, replay
- A build is an immutable snapshot `{ id, worldId, variantId, definitions, facts, createdAt }`.
  `id` = first 4 hex chars of FNV-1a over the canonical JSON of definitions + facts
  (deterministic, so the same world always has the same id).
- "Rebuild" with a different variant creates and activates a new build; earlier results keep
  their build id; the build badge animates the id change (cross-fade, 320 ms).
- "Replay" on a result re-runs its question against its **original** build snapshot and shows
  "Replayed against build 3c1e — same result" (or, if the world has since changed, the original
  result is still reproduced because the snapshot is used — that is the point).

### §6.5 Tests (`tests/unit/console-sim.test.ts`)
Golden outcome for every example question in every world and variant; hostile inputs (2,049
chars, `<script>`, RTL/zero-width characters, only punctuation, 10,000 spaces) produce REFUSED or
RESOURCE_LIMIT without throwing; each `ask` completes in < 5 ms on the test machine; build ids are
stable across runs.

## §7 Result card
- Header row: outcome `StatusChip`, the question (serif `small`, as typed, rendered as text),
  and on the right: build id (mono), "Replay" (icon button with label), "Evidence" toggle.
- **Answer** (checked English, sans `body`) — templates:
  - SUPPORTED: "`orderone` is a purchase-ready item." + "Because `orderone` has funds available
    and its supplier `atlas` is an approved supplier."
  - NO_SUPPORTED_PROOF: "The field does not establish that `ordertwo` is a purchase-ready item."
    + "Missing: `birch` passed inspection." + "This does not mean it fails — the field has not
    been given that support."
  - CONFLICT: "The field contains conflicting facts about `cedar`: “cedar passed inspection.” and
    “cedar did not pass inspection.”" + "Resolve the conflict and rebuild."
  - REFUSED: the refusal reason + one suggested rephrasing as a clickable chip.
  - RESOURCE_LIMIT: the limit reached + "Shorten the question and ask again."
- Footer (`caption`, text-3): "Simulated in 0.4 ms in your browser" (measured) · "View JSON".
- New cards enter with the default reveal (reduced motion: none) and are announced (§12).

## §8 Evidence panel
- **Trace** as a nested list mirroring the evaluation: definition → requirements → facts, each
  line with ✓ (supported), ○ (missing), ! (conflict) icons + text labels; facts quoted as their
  sentences; clicking a fact or definition highlights it in the world panel (2 s cadmium-soft
  flash, reduced motion: outline only).
- **Build**: id, variant label, "Replay".
- **JSON** (toggle): an illustrative JSON rendering of the result in a `CodeBlock` tagged
  "Illustrative — not the Preview 004 schema"; actions "Copy" and "Download JSON" (SECURITY §7).
- Empty state: "Ask a question to see its evidence here."

## §9 Keys, Usage, Settings
- **Keys** (`/console/keys`): H1 "API keys" · note "Keys arrive with the hosted console. This
  page shows how managing them will work." · an empty table (Name · Created · Last used · Scope)
  with the empty state "No keys yet" · "Create key" (secondary) opens a dialog: name field, scope
  radio (Read results / Ask and build), "Create" → the dialog's final step: "No key was created —
  keys arrive with the hosted console." (SECURITY §7). Nothing persisted.
- **Usage** (`/console/usage`): "This session" — questions asked, outcomes breakdown (horizontal
  SVG bars in outcome colours with labels and counts), per-world counts, median simulation time.
  All computed from the in-memory session. Empty state: "No questions yet in this session." →
  Open the playground. Note: "Counted in this browser tab only. Nothing is sent or stored."
- **Settings** (`/console/settings`): Theme (Light / Dark / System), Motion ("Follows your
  system setting" — informational), Session ("Reset session" clears history, confirmation inline,
  not a browser dialog), Account ("Accounts arrive with the hosted console."), Links (Docs,
  Privacy, Responsible disclosure).

## §10 States and theme
### §10.1 States
- Empty world (never happens with fixtures, still designed): "This world has no questions yet."
- Simulator error (caught exception): the card shows "Something went wrong in the simulator. Try
  again." with a retry; nothing technical displayed; `console.error` without the question text.
- Long content: facts lists scroll within the panel; long questions wrap; result list virtualises
  nothing (session sizes are small) but caps at 200 results (oldest dropped, noted).

### §10.2 Theme without flash
- `public/console-theme.js` (tiny, external, same-origin) is rendered in the console layout
  **before** the shell markup with the request nonce: `<script src="/console-theme.js"
  nonce={nonce} suppressHydrationWarning />` (browsers blank the nonce attribute after parsing;
  verified CSP-clean in a Next 16 dry run). It reads `localStorage['mb-console-theme']` inside `try/catch` and sets
  `document.documentElement.dataset.consoleTheme` to `light` / `dark`, or leaves it unset for
  system.
- CSS: `[data-console-surface]` uses the paper surface variables by default; `html[data-console-
  theme="dark"] [data-console-surface]` and `@media (prefers-color-scheme: dark) { html:not([data-
  console-theme="light"]) [data-console-surface] { … } }` switch to the ink variables.
- The `ThemeControl` client component writes the preference and the attribute; it also applies the
  stored value in a layout effect on mount (covers client-side navigation into the console, where
  the bootstrap script does not re-run).

## §11 Keyboard
`/` focus the ask bar · `Enter` ask · `↑` in an empty ask bar recalls the previous question ·
`J`/`K` (or `↓`/`↑` when the results list has focus) move the selection · `E` toggle evidence of
the selected result · `R` replay it · `Esc` close drawer/dialog · `?` open the shortcuts dialog.
Single-key shortcuts never fire while focus is in a text field. All shortcuts are listed in the
dialog and in Settings.

## §12 Accessibility
- The results stream is a list; each new result is announced by an `aria-live="polite"` region:
  "<entity>: <outcome in words>".
- After asking, focus stays in the ask bar (fast repeated questions); the evidence panel is
  reachable by a "Skip to evidence" link and by `E`.
- The trace is a nested list with text status words, not only icons.
- Dialog: focus trap, labelled, returns focus to its trigger.
- Contrast checked in light and dark (axe, both themes). Targets ≥ 44 px on touch.

## §13 Backend seams (design only)
- `src/lib/console/engine.ts` defines `ConsoleEngine { ask(worldId, buildId, question); rebuild(
  worldId, variantId); replay(resultId) }`. `SimulatorEngine` implements it now; a future
  `HostedEngine` will call server actions backed by Neon (SECURITY §8.4). Components depend on
  the interface only.
- Types for results/evidence are UI types, not a promise about Moth's schema.

## §14 Acceptance (`tests/e2e/console.spec.ts`, plus unit tests in §6.5)
1. `/console` → click "Purchasing" → click "Is orderone a purchase-ready item?" → a SUPPORTED card
   is visible **and** its evidence shows "atlas passed inspection" — within 3 actions.
2. Typing "Is ordertwo not a purchase-ready item?" + Enter → REFUSED with a rephrase chip that
   works when clicked.
3. Select "Require audit instead of inspection" → Rebuild → the build id changes; replaying the
   earlier orderone result still shows SUPPORTED against the original build.
4. Keyboard-only: the same flow using `/`, typing, `Enter`, `E`.
5. axe: no violations in light and dark. No requests other than same-origin navigation/assets
   during the whole flow. No console errors. Theme persists across reload with no flash (the
   attribute is present in the first painted frame: check `document.documentElement.dataset`
   from an init script at `DOMContentLoaded`).
6. 390 × 844 mobile: the flow works with the bottom tab bar; evidence inline.
7. Console first-load JS ≤ 230 KB (perf spec).
