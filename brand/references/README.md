# Owner's visual references — internal only

Screenshots the owner shared to set the direction (downscaled to JPEG). They show **other
people's** websites and artwork. Study them; never copy them.

- Never copy these files (or crops of them) into `public/`, `src/`, OG images, or anything that
  ships. Never trace, sample colours from, or re-create their logos, text, layouts or artworks.
- The site's own imagery comes only from the procedural engine (`reference/shaders/`,
  plan/DESIGN.md §8) and the Mumbrane logo files.

| File | What it shows | What to take from it |
|---|---|---|
| `typesafe-instrument-windows.jpg` | typesafe.ai — overlapping monochrome "terminal" windows with title bars, black label chips, mono text and a dotted texture | The **instrument window** idiom (DESIGN §9.6): title bar, mono labels, black tag chips, ledger rows, dot-screen footer. Used sparingly, never as wallpaper; no pixel fonts, no pink dot field |
| `gic-hero-scene.jpg` | generalintelligencecompany.com — an immersive painted park scene behind a glass caption card | Immersive painted hero with one glass caption card (Research hero, PAGES §3.1); smooth scroll feel. Strictly **no pixel art**, no people, no cookie banner |
| `painting-card-glitch.jpg` | A plein-air mountain painting card with pixel-sorted blocks, scan-line slices, guilloche paper, crop marks and a spectral strip | The **plate** anatomy (DESIGN §8.3) and the Replay-style interventions implemented in `paint.frag` |
| `painting-card-video-frame.jpg` | The same card presented on a pale ground with corner crop marks | Presentation: a painting as a framed object on paper, crop marks outside the corners |
| `painting-line-screen.jpg` | A painting rendered as a vertical line screen under a serif headline | Serif-headline-over-art composition; a possible OG/plate treatment. Keep line screens subtle |
| `painting-poster-wing.jpg` | An old-master painting (wing and sky) as a poster with small mono header text and an ornament | Editorial poster framing: mono meta line on top of art, restraint in text over images. Do not use classical paintings (rights) — our paintings are procedural |

The owner's logo artwork is in `brand/logo/reference.png` (locked).
