# mumbrane-web

The website and console preview for **Mumbrane**, a closed-world intelligence lab, and its first
model, **Moth**. This is a frontend-only Next.js build: nothing is connected to a backend yet.

## Commands

```
pnpm install --frozen-lockfile
pnpm dev            # http://localhost:3000
pnpm build && pnpm start
pnpm verify:fast    # typecheck + lint + security guard + unit tests
pnpm verify         # everything, including the production build and end-to-end tests
pnpm shots /        # screenshots at 375, 768 and 1440 px into .shots/
```

Requires Node.js 24 and pnpm 12 (see `.nvmrc` and `packageManager`).

## How it is built

The build is driven by Claude Code from the plan in `plan/`. See [START-HERE.md](START-HERE.md)
for the workflow, and [SECURITY.md](SECURITY.md) to report a vulnerability.
