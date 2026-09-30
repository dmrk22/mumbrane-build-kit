# Content specification

Copy lives in typed modules under `src/content/**` (never hard-coded in components). This file
gives the words for every page, the navigation, the claims policy that keeps them honest, and the
SEO metadata. Source material harvested in `/setup` sits in `src/content/source/*.md` (the current
mumbrane.com as markdown). Where this file says "from source", use the harvested wording and fix
only typos, hyphenation and US spelling. Ignore anything in the source that mentions Grok, grok
bots, "Colossus", downloads for iOS/Android, or products Mumbrane does not have — that is
residue from a template.

Contents: §1 Voice · §2 Navigation · §3 Page copy (§3.1 Home … §3.13 Legal) · §4 Claims policy ·
§5 Placeholders & owner questions · §6 SEO & metadata

---

## §1 Voice

- **Who we are**: Mumbrane is an independent lab building closed-world intelligence. Its first
  model, **Moth**, is constraint-based: it classifies from the facts and definitions you supply,
  shows its evidence, and says plainly when the world you defined cannot support an answer.
- **The name**: μ (muon — a particle that passes through almost anything) + membrane (a boundary
  that decides what passes). Intelligence that moves freely inside a boundary you define.
- **Tone**: calm, exact, curious. Short declarative sentences. Concrete nouns. Limits stated as
  plainly as capabilities. Confident because it is careful, never because it is loud.
- **Words we avoid**: revolutionary, unprecedented, magic(al), supercharge, seamless,
  cutting-edge, game-changing, next-generation, AGI, "hallucination-free", "never wrong",
  "guaranteed", "trustworthy AI" (show, don't claim), "unlock" in our own copy (the literal
  Company blocks and wording kept verbatim from the source are fine).
- **Style**: US English, Oxford comma, sentence-case headings, numerals for all measurements and
  for numbers ≥ 10, "Moth Preview 004" (full: "Moth Inference Preview 004"), "the field",
  "definitions", "facts", "interpretation skills". Entity identifiers in examples are single
  lowercase words in `code` style (`orderone`, `atlas`).
- **Names**: "Mumbrane" in UI and running copy; "Mumbrane Labs" as the byline/author on research
  and news (as the current site does). Never "MUMBRANE" in text.

---

## §2 Navigation

### §2.1 Header
| Item | Type | Target / contents |
|---|---|---|
| Solutions | Mega menu | Business — "Decisions that follow your policies" (`/solutions/business`) · Customer support — "Answers grounded in your rules" (`/solutions/customer-support`) · Legal — "Check conditions against defined terms" (`/solutions/legal`) · Security — "Policy decisions you can audit" (`/solutions/security`) · Use cases — "Example worlds, from purchasing to venues" (`/solutions/use-cases`). Feature card: "Where closed-world reasoning fits" → `/solutions` |
| Developer | Mega menu | API overview (`/developers`) · Documentation (`/developers/docs`) · Models (`/developers/models`) · Console (`/console`) · Pricing (`/pricing`) · Changelog (`/changelog`) · Status (`/status`). Feature card: "Moth · Preview 004 — Configurable classification with checked answers" → `/moth`, secondary link "Release & evidence" → `/moth#evidence` |
| Company | Mega menu | About (`/company`) · Research (`/research`) · News (`/news`) · Careers (`/careers`) · Contact (`/contact`). Feature card: the latest news post |
| Pricing | Link | `/pricing` |
| News | Link | `/news` |
| Research | Link | `/research` |
| Contact sales | Ghost pill | `/contact/sales` |
| Try for free | Primary pill | `/console` (the console preview; its entry screen says exactly what it is — §4) |

### §2.2 Footer (six columns, in this order — owner's specification)
| Column | Links |
|---|---|
| Solutions | Business · Customer support · Legal · Security · Use cases |
| Company | About · Careers · News · Contact · Research |
| Developer | API overview · Pricing · Models · Console · Changelog · Documentation · Status |
| Enterprise | Contact sales |
| Legal | Terms · Enterprise terms · Privacy · Cookies · Privacy choices |
| Social | X (`https://x.com/mumbrane`) · Instagram (`https://www.instagram.com/mumbrane/`) · LinkedIn (`https://www.linkedin.com/company/mumbrane/`) |

Also in the footer: tagline "Intelligence for closed worlds."; legal row "© 2026 Mumbrane" ·
"Privacy choices" · "Evidence, retained." The owner's list said "Modals" and "Enterprise teams";
these are read as **Models** and **Enterprise terms** (D-010, confirm with owner).

---

## §3 Page copy

Conventions: **Eyebrow** = mono label (rendered uppercase). *Italic* in a heading marks the
single serif-italic phrase. "→" = arrow link. Section numbers match PAGES.md.

### §3.1 Home (`/`)

**1. Hero** (ultramarine)
- Eyebrow: Moth Preview 004 · Local CLI · Checked answers
- H1: Intelligence for *closed worlds.*
- Lede: Mumbrane builds constraint-based models that reason from the facts and definitions you
  supply — and show the evidence behind every result.
- Actions: **Explore Moth** (`/moth`) · Read the research (`/research`)
- Figure caption: Fig. 00 — A membrane of field lines, crossed by cosmic-ray muons

**2. Principle** (paper)
- Eyebrow: 01 — Principle
- Statement (ScrubText): The decisions that matter most already have a rulebook. Moth answers
  from the world you define — and says when that world cannot support an answer.
- Chips: Supported · No supported proof · Conflict · Refused · Resource limit
- Caption: Distinct outcomes, not one vague answer. Missing support is not the same as a no.

**3. How Moth works** (ink, pinned demo)
- Eyebrow: 02 — How Moth works
- H2: Define the world a decision should follow.
- Lede (from source): Turn your facts and definitions into a reusable knowledge field. Ask whether
  an entity meets your criteria, then inspect the answer and the evidence behind it.
- Steps (index · name · description · tag):
  - 01 Define — Supply the vocabulary, facts, relationships, and definitions for a task. — Facts · definitions
  - 02 Compile — Check the interpretation and build a retained, versioned field. — Versioned field
  - 03 Ask — Interpret a supported question against a selected field version. — Supported English
  - 04 Check — Native reasoning establishes a classification; a pinned response plan writes checked English or JSON. — Checked result
  - 05 Replay — Retain the evidence and replay an earlier episode against its original build. — Retained evidence
- Window `purchasing.field` (tag "Preview 004"):
  - DEFINE: An approved supplier is a supplier who passed inspection. / A purchase-ready item has
    funds available and an approved supplier.
  - FACTS: `atlas` passed inspection. `orderone` appoints `atlas` and has funds. `birch` passed
    audit. `ordertwo` appoints `birch` and has funds.
  - ASK: Is `orderone` / `ordertwo` a purchase-ready item?
  - Results: `orderone` — SUPPORTED — funds available · atlas passed inspection;
    `ordertwo` — NO SUPPORTED PROOF — passed audit does not establish passed inspection
- Window `evidence.trace`: orderone → purchase-ready / requires funds ✓ / requires approved
  supplier ✓ / replay build f3a9 · same runtime
- Caption: Explanatory example from the purchasing world — not a live console.
- Actions: Explore Moth → · Release & evidence →

**4. Evidence** (paper)
- Eyebrow: 03 — Evidence
- H2: A useful answer keeps its reasons.
- Text: When the field cannot establish an answer, Moth says why. Missing support, conflicting
  information, and incomplete execution mean different things, so they are reported
  differently — and each points to a different next step.
- Outcome ledger (outcome · what it means · what to do next):
  - Supported · The field's facts and definitions establish membership. · Inspect the evidence;
    replay it later against the same build.
  - No supported proof · The field does not establish membership. It does not prove the
    opposite. · Add the missing fact or revisit the definition.
  - Conflict · The supplied information contradicts itself. · Resolve the conflicting facts.
  - Refused · The question or source is outside the supported language. · Rephrase within the
    language contract.
  - Resource limit · A bounded safeguard stopped the work before it finished. · Narrow the
    question or the field.
- Seal caption: Checked execution does not prove outside-world truth. It shows what follows from
  the world you defined.

**5. Compounding** (paper-2)
- Eyebrow: 04 — Research question
- H2: Can knowledge *compound* into more general reasoning?
- Text (from source): A definition can build on another definition. An interpretation skill can
  make a new sentence form usable. We study when these retained dependencies extend what a
  system can do on new tasks.
- Four items: **Representation** — How should knowledge and its relationships be retained? ·
  **Composition** — When does new knowledge make earlier knowledge more useful? ·
  **Inference** — How should a goal shape the search for an answer? · **Evaluation** — What
  evidence would show that the approach works?
- Closing line (from source): Progress means preserving meaning, using dependencies correctly,
  and improving results on new cases — not merely storing more information.

**6. Research** (paper)
- H2: Intelligence, at the edge of possibility.
- Text: How far can intelligence go in a physical universe? We are investigating how
  information, resources, and causality — including ideas from relativity — might make that
  question precise.
- Link: All research →
- Plates: I · Towards field-based intelligence · Research perspective · 2026·09·16 ·
  II · Different wording. Different meaning. · Engineering notes · 2026·09·22 ·
  III · When the field cannot establish an answer · Research practice · 2026·09·22

**7. Current release** (ink)
- Eyebrow: 05 — Current release
- H2: Moth Inference Preview 004
- Text: A local CLI preview for configurable classification over compiled fields, with four
  synthetic example worlds — purchasing, libraries, trails, and venues.
- Spec rows: Platform — macOS ARM64 · Python 3.11 · locally available uv · Profile —
  integrated-field/1 · five delivered models across two profile families · Qualified — 64 core
  answers · 64 historical replays · 32 expected refusals · Regression — 2,115 tests passed ·
  Not included — hosted console · public inference API
- Caveat: Finite synthetic panels — not a blind generalization benchmark.
- Action: Release & evidence → (`/moth#evidence`)

**8. News** (paper)
- H2: News · Link: All posts →
- Rows: the three news posts (date · category · title).

**9. Get started** (cadmium)
- H2: Start with the current preview.
- Card — **Explore on your own**: Try the console preview in your browser, then see what Preview
  004 supports, how it was tested, and where its limits are. → Try the console (`/console`)
- Card — **Talk to the team**: Discuss a use case, an evaluation, or a research collaboration.
  → Contact us (`/contact`)

### §3.2 Moth (`/moth`) — from `moth.md` and `releases.md`
1. **Hero**: Eyebrow "Model · Preview 004" · H1 "Moth" · Subhead (serif display-m): Your world.
   Your definitions. *Checked answers.* · Lede (source): Moth compiles supported English facts,
   definitions, and interpretation skills into a reusable reasoning field. Ask whether an entity
   meets a definition, then inspect checked English or JSON results. · Actions: Release &
   evidence (`#evidence`) · Talk to the lab (`/contact?interest=research`)
2. **How it works**: the five steps (Define, Compile, Ask, Check, Replay) with the source's full
   descriptions (incl. "Existing local BGE assets participate in compilation; updates require a
   new build and activation." and "Missing support, refusal, and incomplete execution have
   distinct meanings."). Diagram caption: "Conceptual illustration of dependencies. It does not
   depict a demonstrated continuous energy optimizer." (source)
3. **Define purchase readiness** (interactive explainer): definitions and facts from source
   ("An approved supplier is a supplier who passed inspection. A purchase-ready item has funds
   available and an approved supplier."; orderone/atlas/inspection; ordertwo/birch/audit). Toggle
   **"Require audit instead of inspection"** → shows "Definition changed — rebuild required",
   then after "Rebuild" the results swap (orderone: no supported proof; ordertwo: supported) and
   the build id changes. Source sentence under it: "The field does not establish purchase
   readiness for ordertwo; it does not prove that birch failed inspection." Label: "Explanatory
   example, not a live console." (source)
4. **Outcomes and boundaries** (source, releases.md): the outcomes table (wording of §3.1, section 4) plus:
   "`NO_SUPPORTED_PROOF` means the field does not establish membership, not that the entity
   fails. Conflict, language refusal, resource stop, incomplete execution, and artifact
   incompatibility remain distinct outcomes." and "Checked execution does not prove outside-world
   truth. This preview is not a general chat system, arbitrary document reader, production
   service, or universal reasoning engine."
5. **Preview 004** (id `evidence` starts here): scope paragraph (source), "What the preview
   supports" list (5 items, source), the BGE sentence, "The four example worlds are synthetic
   evaluation cases, not operational integrations."
6. **Language contract** (source): binding rules, the two supported question examples in a code
   block, the skills sentence, the limits list — 256 entities · 2,048 facts · up to 32 documents
   and 128 sentences in composition · six clauses per composed sentence · 2,048-character
   questions — and verbatim: "These safeguards are not measured capacity guarantees."
7. **Qualification** (source table verbatim: 64 / 64 / 32 / 2,115 tests passed / 10 answers and
   replays after fresh installation) + the two caveat paragraphs verbatim.
8. **Measured observations** (source table verbatim: 0.781 seconds · median 0.559 seconds across
   seven observations · 728,184,684 bytes · 2,545,963 bytes · 180,884,002 bytes) + the
   environment sentence before it and the caveat paragraph after it, verbatim.
9. **Inspect the evidence** (source): the delivery's evidence files, and the retained failed
   harness attempt paragraph (keep it — it is the most trust-building paragraph on the site).
   Closing sentence verbatim: "No million-token, throughput, pricing, or production-readiness
   target is presented here as achieved. Compiled bundles retain source-derived evidence and may
   include original spans; compilation does not anonymize sensitive data."
10. **The prepared-base direction** — tag "Proposed": source paragraph ("We aim to build a
    richer prepared foundation… not current claims about arbitrary English or reasoning
    methods.") → Explore the research.
11. **Get the preview**: "Preview 004 is delivered locally for evaluation. Installation and usage
    instructions are included with the local delivery; there is no public download." → Contact
    the lab (`/contact?interest=research`) · Contact sales (`/contact/sales`)

### §3.3 Research (`/research`, `/research/[slug]`) — from `research.md` and the article
- **Hero**: Eyebrow "Research" · H1 "Intelligence, at the edge of *possibility.*" · two-column
  abstract (source): "How far can intelligence go in a physical universe? We want to build
  general intelligence from the mathematics of fields: knowledge as structure, reasoning as
  evolving state, and energy as a way to guide the search." / "The furthest intelligence physics
  permits is a research destination. We do not yet know whether a single universal ceiling is
  meaningful. Our practical work studies attainable frontiers for specific tasks, evidence, and
  resources." Glass caption card on the painting: "Plate 0 — Oil on code, seed n".
- **Three connected lines of inquiry**: Representation — Can knowledge become a field? ·
  Dynamics — What makes a field reason? · Causality — What can a system know, and when? + the
  relativity paragraph (source) + "The geometry, light-cone, and energy-surface visualizations
  on this page are conceptual studies, not experimental results." (source, adapted to our figures)
- **From hypothesis to experiment** (source, both paragraphs) → Read the current evidence
  (`/moth#evidence`) · Meet Moth (`/moth`) · Talk to the lab (`/contact?interest=research`)
- **Research perspectives**: list with the one current article: "Towards field-based
  intelligence" — "Our research hypothesis: persistent knowledge, interacting fields, and
  energy-guided inference could offer a path toward more general reasoning." · Published
  2026-09-16 · Updated 2026-09-22 · Mumbrane Labs · Research perspective.
- **Article** `/research/toward-field-based-intelligence` (keep this slug): body from
  `src/content/source/research_toward-field-based-intelligence.md`, authors' wording. Title
  normalised to "Towards field-based intelligence" (hyphen + sentence case, D-011). Tags from the
  source frontmatter.

### §3.4 News (`/news`, `/news/[slug]`) — from `news.md` and the three posts
- **Index**: H1 "News" · lede (source): "Product developments, engineering decisions, and
  practical examples from Mumbrane Labs." · Featured: "Introducing Moth Preview 004" · then rows.
- Posts (all 2026-09-22, Mumbrane Labs; keep slugs):
  - `introducing-moth-preview-004` — Field notes — "A local preview for defining a world,
    compiling its meaning, and asking classification questions with inspectable evidence."
  - `different-wording-different-meaning` — Engineering notes — "How Moth preserves subjects,
    relationships and requirements when supported English is rephrased — and when a change
    should alter the answer."
  - `when-the-field-cannot-establish-an-answer` — Research practice — "Missing support,
    conflicting information and incomplete execution mean different things. A useful answer
    keeps those distinctions visible."
- Bodies from the harvested markdown, authors' wording; code examples become `CodeBlock`s.

### §3.5 Company (`/company`)
- **Hero**: Eyebrow "Company" · H1 "The lab, block by *block.*" · Lede: Mumbrane is an independent
  research lab investigating field-based intelligence. We study how retained knowledge, reusable
  skills, and explicit constraints can support more general reasoning. (source)
- **Blocks** (6-column mosaic; label · text · fill/text · link):
  1. Mission · Intelligence that answers from the world you define. · ultramarine/on-dark · span 2
  2. The name · μ + membrane. A particle that passes through; a boundary that holds. · paper/text
  3. Principle 01 · Evidence before eloquence. · cadmium/ink
  4. Principle 02 · Say what is supported. Say what is not. · viridian/ink
  5. Moth · Preview 004 · local CLI · checked answers · ink/on-dark · span 2 · `/moth`
  6. Careers · Join the lab → · vermilion/ink · `/careers`
  7. Research · Representation · Dynamics · Causality · violet-fg/on-dark · span 2 · `/research`
  8. Contact · hello@mumbrane.com · madder/ink · mailto
  9. Principle 03 · Replay every answer against the build that made it. · cherenkov/ink
  10. News · Introducing Moth Preview 004 · paper-3/text · the post
  11. Independent · An independent research lab. · cobalt/on-dark
  12. Principle 04 · Publish the limits with the results. · paper-2/text
  Permanent locks: "Hosted console — in preparation" · "Moth Base — proposed" · "Public API —
  not yet available".
- **About** (paper): H2 "Why closed worlds" · Text: Most consequential decisions already have a
  rulebook — a policy, a contract, a definition of done. We build models that take that rulebook
  as the whole world, reason inside it, and show their work. When the rulebook is silent, the
  model says so. That is the discipline we want from intelligence before we ask it to be general.
  + the company plate painting.
- **The name** (paper-2): H2 "Muon + membrane" · Text: A muon is a particle that passes through
  almost anything — mountains, buildings, detectors. A membrane is a boundary that decides what
  passes. Mumbrane is both: reasoning that moves freely, inside a boundary you define.
- CTA row: Careers → · Contact → · News →

### §3.6 Careers (`/careers`)
- H1 "Work on intelligence you can *check.*" · Lede: We are not listing open roles right now,
  but we read every thoughtful note.
- **How we work**: Evidence before eloquence · Small, inspectable systems first · Publish the
  limits with the results · Design is part of the science.
- **Areas we care about** (not openings): formal semantics and controlled language · constraint
  reasoning and program analysis · physics-inspired models and energy-based methods · systems and
  runtime engineering · evaluation design · interface design for evidence.
- CTA: Write to us → `mailto:hello@mumbrane.com?subject=Careers` · Contact form
  (`/contact?interest=careers`). Note: "When we open roles, they will be listed here."

### §3.7 Contact (`/contact`) and Contact sales (`/contact/sales`)
- **Contact** — H1 "Talk to Mumbrane" · Lede (source): "Tell us what you are trying to
  understand, where the difficulty is, and what a useful conversation might unlock." · Email
  cards (source): Research and technical — research@mumbrane.com · General and press —
  hello@mumbrane.com · Note (source): "A focused note is enough. Links to papers, repositories,
  or prior work are welcome when they add useful context."
- **Contact form** — fields: Name · Email · Organization (optional) · Topic (select: General,
  Research, Sales, Business, Customer support, Legal, Security, Pricing, Careers, Press) ·
  Message (hint: "At least 20 characters. Please don't include sensitive personal data.") ·
  Submit "Send message". Privacy note: "We use what you send only to reply. See the privacy
  notice."
- **Contact sales** — H1 "Contact sales" · Lede: Tell us about the decisions you want a model to
  make from your own rules. We'll tell you honestly whether Moth fits today. · Fields: Name ·
  Work email · Company · Role (optional) · Company size · Area (Business, Customer support,
  Legal, Security, Other) · Timeframe (Exploring, This quarter, This year) · What should the
  model decide? · Submit "Contact sales". Side panel: "What to expect" — Preview 004 is a local
  evaluation package · no hosted service or public API yet · pricing is by conversation.
- **Errors**: "Enter your name." · "Enter an email address like name@example.com." · "Choose a
  topic." · "Tell us a little more — at least 20 characters." · "Keep it under 4,000
  characters." · Summary: "Please fix 2 fields." (count).
- **Preview success state**: H "Thanks — nearly there." · Text: "Online submissions are not
  connected yet, so this message has not been sent. You can send it by email in one step." ·
  Button "Send it by email instead" (prefilled mailto) · Secondary "Edit message".

### §3.8 Solutions (`/solutions`, `/solutions/[slug]`, `/solutions/use-cases`)
Frame every solution as **where closed-world reasoning fits**, illustrated with synthetic
example worlds. No customers, no results, no ROI.
- **Overview** — H1 "Decisions that follow *your* rules." · Lede: Many decisions already have a
  rulebook. Moth takes that rulebook as the whole world, checks each case against it, and shows
  the evidence — or says what is missing. · Four cards (Business, Customer support, Legal,
  Security) + Use cases · Fit checklist: "Moth fits when… the criteria can be written down ·
  answers must be explainable · 'not established' is a useful answer · the rules change and you
  need to rebuild deliberately." / "Moth is not… a chat assistant · a document reader · a
  source of outside-world facts."
- **Template for each solution page**: H1 · lede · "The rulebook" (what gets defined) · an
  illustrative world in an instrument window (tag "Illustrative") · outcomes as they would read
  in this domain · "Why evidence matters here" · limits box ("What Preview 004 does not do") ·
  CTA "Talk to us about <domain>" → `/contact?interest=<slug>` (the old site's URLs) + secondary
  "Contact sales" → `/contact/sales`.
  - **Business** — H1 "Decisions that follow your policies." Illustrative world: purchase
    readiness (the purchasing example) and approval eligibility.
  - **Customer support** — H1 "Answers grounded in your rules." Illustrative world: refund
    eligibility ("An eligible refund is a request that is within the return window and has a
    receipt."); "no supported proof" → hand off to a person with the missing fact named.
  - **Legal** — H1 "Check conditions against defined terms." Illustrative world: whether a
    clause set meets a defined condition. Required note: "Not legal advice. Illustrative only."
  - **Security** — H1 "Policy decisions you can audit." Illustrative world: whether an account
    meets the definition of privileged access; replay for audits. Plus a panel "Our own
    security" summarising the site's posture (strict CSP, no third parties, no tracking) and a
    link to Responsible disclosure.
- **Use cases** — H1 "Example worlds" · Lede: Preview 004 ships with four synthetic example
  worlds. The rest are sketches of where the same method could apply. · Filter chips: All ·
  Business · Customer support · Legal · Security. · Cards: **Delivered in Preview 004** —
  Purchasing, Libraries, Trails, Venues (badge "Synthetic example world"); **Sketches** — Refund
  eligibility, Approval routing, Clause conditions, Privileged access, Grant eligibility,
  Warranty coverage (badge "Illustrative sketch"). Each card: the definition in one sentence,
  one question, and the outcome.

### §3.9 Developers (`/developers`, `/developers/docs`, `/developers/models`)
- **API overview** — H1 "Build on checked answers." · Status banner: "Preview 004 is a local
  CLI. There is no public inference API yet." · Sections: The lifecycle (define → compile →
  activate → ask → inspect → replay) · Concepts (field, build, activation, question, result,
  evidence, replay) · Results as English or JSON (an **illustrative** JSON block, tagged
  "Illustrative — not the Preview 004 schema") · Supported questions (the two source examples) ·
  Outcomes · Limits · "When the hosted API arrives" (what developers can expect to be kept:
  versioned fields, explicit outcomes, replay — phrased as intentions, not dates).
- **Documentation** — H1 "Documentation" · Lede: Concepts and contracts for Moth Preview 004.
  The complete documentation — MODEL.md, QUICKSTART.md, LANGUAGE-CONTRACT.md and LIMITATIONS.md —
  ships with the local delivery. · Sections (anchored, with a sticky table of contents): Fields
  · Facts and definitions · Interpretation skills · Compilation and activation · Questions ·
  Outcomes · Evidence and replay · Language contract · Limits · Glossary. Text from
  releases.md/moth.md only.
- **Models** — H1 "Models" · Model card "Moth Inference Preview 004" with status chip "Preview ·
  local", profile integrated-field/1, "five delivered models across two profile families",
  platform, capabilities, language contract, outcomes, qualification (same content modules as
  `/moth`), limitations. Upcoming: "Moth Base — proposed" (tag), one sentence from source.

### §3.10 Pricing (`/pricing`)
- H1 "Pricing" · Lede: Moth is in preview. We price by conversation until the hosted service
  exists — no invented tiers.
- Three columns: **Console preview** — Free · "Explore the console design with synthetic example
  worlds in your browser." → Try the console · **Local evaluation** — "By arrangement" · "Moth
  Preview 004 delivered for evaluation on macOS ARM64, with documentation and qualification
  evidence." → Contact sales · **Hosted and enterprise** — "Not yet available" · "Tell us what
  you need; we'll say honestly what exists." → Contact sales
- FAQ: Is there a free trial? (the console preview is free; it is a simulation) · Is there an
  API? (not yet) · What does evaluation involve? (local delivery, documentation, qualification
  evidence) · How will pricing work later? ("We'll publish it here when the hosted service
  launches.")

### §3.11 Changelog (`/changelog`)
H1 "Changelog" · Lede (source): "Updates to Mumbrane models, research, and products." · Entries
(real dates only, newest first): 2026-09-22 — Moth Inference Preview 004 announced (local CLI preview) ·
2026-09-22 — Three field notes published · 2026-09-22 — Research perspective updated ·
2026-09-16 — Research perspective "Towards field-based intelligence" published. Add a "Website"
entry only when the owner gives the launch date (D-012).

### §3.12 Status (`/status`)
H1 "Status" · Lede: We'll publish live status when there is a hosted service to monitor. ·
Components, each marked **"Not yet monitored"** (never "Operational"): Website · Console
preview · Hosted API (not launched) · Moth Preview 004 (local delivery — not applicable). The
90-day bars render as an empty, labelled "No data yet" pattern. Note: "We will not show uptime
numbers we do not measure."

### §3.13 Legal (`/legal/[slug]`)
- **Draft banner** (on every page marked draft): "Draft — pending owner and legal review. This
  page is not yet in force."
- `terms` — from source (terms.md), sections as the source; not draft (it is the live text).
- `privacy` — from source (privacy.md) + one added sentence accurate for this build: "This site
  does not use analytics, advertising, or tracking cookies. The console preview stores your theme
  choice in your browser, and nothing else." Mark the added sentence for owner review (draft
  banner variant: "Updated — pending owner review").
- `cookies` — Draft. "This site does not use cookies for analytics, advertising, or tracking, and
  its own code sets none. The console preview stores one preference (your theme) in your browser's
  local storage; you can clear it at any time from Settings." (Owner: if the host adds cookies,
  e.g. a CDN bot-protection cookie, list them here.)
- `privacy-choices` — Draft. "We don't sell or share personal information, we don't use
  targeted advertising, and we honor Global Privacy Control signals. There is nothing to switch
  off here because nothing is switched on." If the browser sends GPC, show "Your browser's
  Global Privacy Control signal is on — noted." (detected client-side via
  `navigator.globalPrivacyControl`; nothing stored).
- `enterprise-terms` — Draft placeholder: "Enterprise terms are provided with each agreement.
  Contact sales for a copy." → Contact sales.
- `responsible-disclosure` — Draft: SECURITY §9.2 content.

---

## §4 Claims policy (a security property — enforced by `claims.test.ts` and QUALITY §6)

**Allowed**
- Anything stated in the harvested source, in its original sense, with its caveats.
- Numbers **only** from `releases.md` (the qualification and measured tables and the language
  limits), shown with their caveats on the same screen.
- Descriptions of intent and research direction, phrased as intent ("we aim", "we study",
  "proposed").
- Illustrative examples and simulations, **labelled** where they appear.

**Forbidden**
- Customers, partners, logos, testimonials, case studies, user counts, revenue, funding.
- Benchmarks or comparisons with LLMs or competitors; "better/faster/more accurate than".
- "Production-ready", "enterprise-grade", certifications (SOC 2, ISO, HIPAA), SLAs, uptime.
- Prices, discounts, free-tier limits (beyond "the console preview is free").
- Job openings, office locations, team size, founding date — unless the owner supplies them.
- API endpoints, SDK names, CLI commands, schemas presented as real (the delivery has them; we
  do not publish them).
- "No hallucinations", "always correct", "guaranteed", "proves truth".

**Labels** (component `Label`/tag chip, consistent wording):
`Preview` (a real but pre-release thing) · `Illustrative` (an example we wrote) · `Simulation`
(the console's in-browser evaluator) · `Proposed` (future work) · `Draft` (legal text pending
review) · `Synthetic example world` (the four delivered worlds) · `Conceptual illustration`
(figures of hypotheses).

**Traceability**: `src/content/claims.ts` lists every number rendered anywhere with its source
file and line text; `claims.test.ts` asserts each value appears verbatim in
`src/content/source/releases.md` and that no other numeric claim pattern (e.g. `\d+(\.\d+)?\s?%`,
"x faster", "uptime") appears in content modules.

---

## §5 Placeholders & owner questions

- Missing facts are **omitted**, not faked. Where a slot must exist (legal entity name in terms,
  response-time targets, enterprise terms), render the `Placeholder` component: a dashed-border
  inline chip reading "Pending owner confirmation", with the underlying question exposed to
  assistive tech through `aria-describedby` (no tooltip). Every placeholder is listed in
  BUILD_STATE "Open questions".
- Standing owner questions (copy into BUILD_STATE at /setup): canonical domain (mumbrane.com vs
  the mumbrane.ai URLs in the current markdown) · legal entity name and address for terms/privacy ·
  "Modals"/"Enterprise teams" reading (D-010) · security contact address (D-006) · HSTS preload
  (D-005) · response-time targets for disclosures · real job openings, if any · launch date for
  the changelog · whether the console preview should say "Try for free" or "Try the preview" ·
  review of the drafted legal pages.

---

## §6 SEO & metadata

- `pageMetadata()` for every route: title template "%s — Mumbrane" (home: "Mumbrane —
  Intelligence for closed worlds"), description ≤ 160 characters, canonical on
  `https://mumbrane.com` (from `publicEnv.siteUrl`), OG/Twitter (`summary_large_image`) with the
  route family's OG image.
- Descriptions: Home — "Mumbrane builds constraint-based models that reason from the facts and
  definitions you supply, and show the evidence behind every result." · Moth — "Configurable
  classification over a compiled field of facts, definitions, and supported English
  interpretation skills." (source) · Research — "Mumbrane's research into field-based
  intelligence, energy-guided reasoning, and the causal limits of inference." (source) · News —
  "Product developments, engineering decisions, and practical examples from Mumbrane Labs."
  (source) · others: one sentence from the page's lede, ≤ 160 characters.
- JSON-LD (via `JsonLd` only): `Organization` (name "Mumbrane", url, logo `/icons/icon-512.png`,
  `sameAs` the three social URLs) and `WebSite` on `/`; `Article` on research/news posts
  (headline, datePublished, dateModified, author `{ "@type": "Organization", "name": "Mumbrane
  Labs" }`, image = the plate's 1600w WebP).
- OG images (P13, `pnpm og` → `tests/e2e/og.spec.ts` over `/lab/og/[family]`): families — default, moth, research (per article), news (per
  post), company, solutions, developers, legal. 1200 × 630, paper ground, lockup, serif title,
  painting or field crop, mono meta line.
- `robots.txt`: allow all; disallow `/console` and `/lab`; include the sitemap URL. `/md/*` stays
  allowed (agents may read it) but is not listed in the sitemap. `sitemap.xml`: every indexable
  route + article slugs with `lastModified`.
- `llms.txt` (static route): "# Mumbrane" + one-paragraph summary (§1) + sections "Core pages"
  and "Publications" linking to `/md/...` alternates with one-line descriptions (mirrors the
  current site's llms.txt structure, on the mumbrane.com domain).
- `/md/[...path]` serves markdown alternates: every article, plus `/md/index`, `/md/moth`,
  `/md/research`, `/md/news`, `/md/contact`, `/md/changelog`, `/md/legal/terms`,
  `/md/legal/privacy`. Frontmatter: title, description, canonical (HTML URL), published/updated
  where relevant.
