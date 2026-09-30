# Design board — the visual target

`board.png` (1440 × 5556) is a static mock-up built during planning with the real tokens, fonts,
logo files and shader renders. It is the **target look**, not a pixel spec: plan/DESIGN.md and
plan/PAGES.md win where they differ (differences are listed in DESIGN §12).

| File | Contents |
|---|---|
| `board.png` | The whole board: home hero, principle, how Moth works, research plates, Company blocks, footer, palette and type specimens |
| `sections/01-hero.png` … `07-palette-type.png` | The same board cropped per section (full resolution) — open these when reviewing screenshots |
| `hero-still.png` | `membrane.frag` at `uTime 2.0`, 1440 × 900 — the reduced-motion still and the look of the poster |
| `plate-0.png` … `plate-3.png` | The four reference paintings at 1200 × 750: range (with interventions), sky, meadow, sea |

These images are references for review. The build regenerates its own assets (`pnpm art`,
`pnpm og`) and never copies these files into `public/`.
