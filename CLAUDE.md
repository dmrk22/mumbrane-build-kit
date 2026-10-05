# Mumbrane — web build

**mumbrane.com**: website + console preview for Mumbrane, a closed-world intelligence lab whose
first model is **Moth** (answers only from facts and definitions you supply, and shows its
evidence). Frontend build; the Neon Postgres backend is not wired yet — leave seams, don't connect it.

Plan docs live in `plan/` (BUILD_PLAN, DESIGN, PAGES, CONTENT, CONSOLE, SECURITY, QUALITY,
DECISIONS). They are references, not locks — edit, reorganise or update them when the owner asks.
Track progress in `plan/BUILD_STATE.md`.

## Working style
- Act, don't ask. Commit, push, branch, open PRs, reorganise files and folders freely.
- Subagents are fine when they help.
- Ask first only for: force-push / history rewrites, deleting large amounts of work, changing
  the logo, legal text, or public claims.

## Product rules (keep these)
1. **Security**: strict nonce CSP from `src/proxy.ts` (no `'unsafe-inline'`/`'unsafe-eval'` in prod);
   no runtime third-party origins (CDNs, remote fonts, analytics); no `dangerouslySetInnerHTML`
   / `innerHTML` / `eval` (sole exception `src/lib/security/json-ld.tsx`); no `style` prop in `.tsx`
   (CSP blocks it) — use classes, `data-*`, SVG attrs, or CSSOM after mount; validate external input
   with Zod; never print or commit `.env*` secrets.
2. **Logo is locked**: only `brand/logo/` files via `<Mark/>`, `<Lockup/>`, `<Wordmark/>`. Colour,
   uniform scale, opacity, draw-on reveal only. `tests/unit/brand.test.ts` checks the bytes.
3. **Design**: tokens from `brand/palette/tokens.css` only — no raw colours, no Tailwind default
   palette, type scale only. No stock/AI images; paintings come from the procedural paint engine.
   Check UI with `pnpm shots <route>` at 375/768/1440.
4. **Honest content**: no invented customers, metrics, prices, testimonials or endpoints. Label
   previews and placeholders. Copy lives in `src/content/**`.
5. **Accessible**: WCAG 2.2 AA, keyboard support, visible focus, honour `prefers-reduced-motion`.
6. **Deps**: pin exact versions; keep `.claude/allowed-deps.json` in sync (`pnpm budgets` reads it).

## Stack
Node 24 · pnpm · Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 7 · Tailwind 4 · GSAP 3
· Zod 4 · Biome 2 · Playwright + axe · raw WebGL2 · `node:test`.

## Layout
```
src/app/(site)/   marketing routes        src/app/console/   console preview (noindex)
src/components/   brand, chrome, ui, layout, motion, art, instrument, sections, console
src/content/      typed copy + zod schemas  src/lib/  pure logic   src/proxy.ts  CSP + headers
scripts/          node .ts scripts          tests/unit, tests/e2e
```

## Conventions
- Server Components by default; `'use client'` as low as possible.
- TS strict; no `any`. `src/lib/**` and `scripts/**` use relative imports ending in `.ts`.
- One public component per file, named export. Join classes with `cx()` from `src/lib/cx.ts`.

## Commands
`pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm lint` · `pnpm test:unit` · `pnpm test:e2e`
· `pnpm guard` · `pnpm budgets` · `pnpm shots <route>` · `pnpm verify:fast` · `pnpm verify`

Run `pnpm verify:fast` before committing. Conventional commits. Vercel deploys `main` on push.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
