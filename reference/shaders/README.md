# Reference shaders (tested) — read before P4 and P5

These GLSL ES 3.00 fragment shaders were written and render-tested during planning (headless
Chromium, SwiftShader). They are the **reference**: port them to `src/shaders/*.ts` without
changing the maths; tune only palettes (toward tokens) and seeds. This folder is protected —
never edit it; copy from it.

| File | What it draws | Used by |
|---|---|---|
| `membrane.frag` | The hero field: a ribbon of field lines with a half-twist (a Möbius band seen edge-on) drifting over ultramarine, crossed by muon tracks that leave ripples; one track in five is vermilion | Home hero (live, `MembraneCanvas`), poster fallback (rendered at build) |
| `scene.frag` | A flat-colour procedural landscape: `uScene` 0 range · 1 sky · 2 meadow · 3 sea | Build-time paintings (pass 1, half resolution) |
| `paint.frag` | Repaints any source image as oil: flow-aligned bristle strokes (two sizes), impasto, canvas weave, varnish; optional scan slices and pixel-sorted blocks | Build-time paintings (pass 2, full resolution) |
| `presets.json` | Tested uniform values for the hero and the four scenes, plus the scaling rule | P4, P5 |

Visual references for the presets: `brand/board/hero-still.png` (membrane at `uTime 2.0`) and
`brand/board/plate-0..3.png` (range, sky, meadow, sea at 1200 px).

## Host contract (all three)
- WebGL2 context; a single fullscreen triangle (`[-1,-1, 3,-1, -1,3]`) with attribute `aPos`
  at location 0; vertex shader `#version 300 es in vec2 aPos; void main(){ gl_Position =
  vec4(aPos, 0., 1.); }`.
- `uRes` = drawing-buffer size in pixels of the pass being rendered.
- Deterministic: output depends only on uniforms (no `Math.random`, no clock unless `uTime`).
- Colours are sRGB channel values 0..1 (hex / 255), written straight to the framebuffer.

## membrane.frag
Uniforms: `uRes`, `uTime` (s), `uSeed` (1.37), `uPointer` (0..1, y up; `(-1,-1)` = none),
`uDpr` (the capped DPR used for the backing store — line widths scale with it), `uBgA`
(ultramarine), `uBgB` (ultramarine-deep), `uLine` (cherenkov), `uSpark` (vermilion), `uWarm`
(cadmium).
- Cost: 6 tracks × 3 fixed-point iterations + 4-octave fbm per pixel. Expect ≈ 1–2 ms/frame at
  1440p on an M1-class GPU; measure (DESIGN §7.2 budget ≤ 4 ms).
- Live host: `uTime` advances in real seconds; clamp frame delta to 50 ms after tab switches;
  freeze at 2.0 for reduced motion (render one frame, stop the loop).
- The canvas is `alpha: false`, `antialias: false` (the shader antialiases its own lines with
  `fwidth`), `preserveDrawingBuffer: false` (true only in the build-time renderer).

## scene.frag → paint.frag (paintings, build time only)
1. Render `scene.frag` into an RGBA8 texture at **half** the output size, LINEAR filtering,
   CLAMP_TO_EDGE (`target: "scene"`, `scale: 0.5` in presets).
2. Render `paint.frag` at full size with `uSrc` bound to that texture. `uStroke` is the coarse
   stroke size in output pixels (fine strokes are 0.45×). `uSlices`/`uSliceBand` (y0, y1 from the
   bottom 0..1, line spacing px, displacement px) and `uBlocks`/`uBlockA|B|C` enable the
   interventions; `uPaper` is the canvas ground.
3. **Scaling rule**: presets are tuned for 1440 px wide output. For width W multiply `uStroke`
   and `uSliceBand.z/.w` by W / 1440 (2400 px → stroke 50).
4. Scene-specific palettes are in `presets.json`; new paintings change `uSeed` (and optionally
   palette values that stay within the token families).

## Reference renderer (`reference/harness/`)
`harness.html` runs a list of passes (optionally into FBO targets) and `render.mjs` drives it
through Playwright's Chromium:

```
node reference/harness/render.mjs range .cache/test-range.png --width 2400
node reference/harness/render.mjs membrane-hero .cache/poster.png --width 2560 --height 1440
```

Software GL flags (`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`) are
used by default for determinism across machines; `PAINT_GPU=1` uses the GPU instead. Tested:
`range` at 1200 × 750 renders in ≈ 0.7 s, `membrane-hero` at 960 × 600 in ≈ 0.1 s (SwiftShader).
`scripts/paint.ts` (P5) must reproduce this behaviour: same harness logic (inlined into a temp
file in `.cache/`), same flags, same scaling rule, plus hashing to skip unchanged outputs.
