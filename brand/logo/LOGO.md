# Mumbrane logo — locked

The mark is a Möbius strip: a band with a single half-twist, drawn as two edge curves (the
continuous **band** and the inner **rim**) joined by thin **struts**. It was vectorised 1:1 from
the owner's PNG (`reference.png`) — same angles, same structure, same proportions — and then
locked. The owner's instruction: *use it as it is; do not change any angle or any of the
structure.*

## Files
| File | viewBox | Contents | Use |
|---|---|---|---|
| `mumbrane-mark.svg` | 0 0 1000 392.79 | 27 paths: 25 struts (`g.mb-struts`, one of them the faint hidden strut of the original), `path.mb-band`, `path.mb-rim` (`g.mb-edges`). Display weight: edges 4.90, struts 1.57 | Mark rendered ≥ 200 px wide |
| `mumbrane-mark-compact.svg` | 0 0 1000 392.79 | Identical paths; compact weight: edges 11.19, struts 3.16 | Mark rendered < 200 px wide (header, rail, icons) |
| `mumbrane-wordmark.svg` | 0 0 5340.4 700 | "MUMBRANE" in Host Grotesk SemiBold (600), tracking −7.8/1000 em, outlined; 8 letter paths with `data-letter` / `data-char`; cap height = 700 units | Footer giant wordmark; lockup |
| `mumbrane-lockup.svg` | 0 0 1410.41 222.79 | Compact mark (`g.mb-mark`, scale 0.567185) + wordmark (`g.mb-wordmark`, translate 639.5 58.51, scale 0.142857 → cap height 100) | Header, footer, OG images |
| `reference.png` | — | The owner's original artwork (source of truth for the geometry) | Comparison only |
| `LOCK.json` | — | sha256 of every file and a digest of each file's path data | Tests |

All SVGs draw with `currentColor` (strokes for the mark, fills for the wordmark), round caps and
joins. Icons (`brand/icons/`) put the compact mark in `on-dark` (#f6f3ec) on an ultramarine
(#1a30b3) rounded tile: `icon.svg`, `favicon.ico` (16/32/48), `apple-touch-icon.png` (180),
`icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (safe-zone padded). `brand/og-default.png`
is the default 1200 × 630 social card.

## Rules
- **Never** redraw, retrace, re-letter, re-space, rotate, skew, mirror, 3D-transform, outline,
  stroke the wordmark, add shadows/glows/gradients, crop, rearrange the lockup, or change the
  proportions or the stroke weights.
- **Colour**: one colour at a time, from the surface: `text`/`ink` on light grounds, `on-dark` on
  ink and ultramarine, `ink` on cadmium. No multicolour mark, no pigment-coloured mark except the
  generated icon tile.
- **Clear space**: the wordmark's cap height around the lockup; half the mark's height around
  the mark alone.
- **Minimum sizes**: lockup 16 px tall; mark 24 px wide (compact weight; below 48 px tall the
  site uses `vector-effect: non-scaling-stroke` so the struts never disappear).
- **Motion**: only the stroke draw-on (struts → band → rim), uniform scale, opacity, and the
  documented header wordmark collapse (plan/DESIGN.md §7.1).
- **In text** the name is "Mumbrane"; the capitals of the wordmark are a drawing.

## How the lock works
`tests/unit/brand.test.ts` recomputes the sha256 of each file and
`sha256(all d="…" attribute values in document order, joined with "\n")` per SVG and compares
them with `LOCK.json`. The site renders the logo only through components generated from these
files (`scripts/brand.ts` → `src/components/brand/mark-geometry.ts`), so the test covers what
ships. Claude Code's hooks and permissions block edits to this folder.

## Replacing the logo (owner only)
1. Replace the SVG files (keep the file names, `currentColor`, and the group classes
   `mb-struts`, `mb-edges`, `mb-band`, `mb-rim`, `mb-mark`, `mb-wordmark`, `data-letter`).
2. Regenerate `LOCK.json` yourself (Claude is not allowed to):
   ```
   node -e "const fs=require('fs'),c=require('crypto');const h=b=>c.createHash('sha256').update(b).digest('hex');const L=JSON.parse(fs.readFileSync('brand/logo/LOCK.json'));for(const f of Object.keys(L.files)){L.files[f]=h(fs.readFileSync('brand/logo/'+f));if(L.geometry[f]){const s=fs.readFileSync('brand/logo/'+f,'utf8');const d=[...s.matchAll(/\sd=\"([^\"]*)\"/g)].map(m=>m[1]);L.geometry[f]={paths:d.length,sha256_of_d:h(d.join('\n'))}}}fs.writeFileSync('brand/logo/LOCK.json',JSON.stringify(L,null,2)+'\n')"
   ```
3. Run `pnpm brand && pnpm test:unit` and commit.
