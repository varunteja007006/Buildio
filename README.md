# Buildio.pro

Monorepo for `buildio.pro` apps and shared packages.

- Workspace root: `buildio_pro/`
- Package manager: `pnpm@11.4.0`
- Node: `>=20`

## Quick start

```bash
pnpm --dir buildio_pro install
pnpm --dir buildio_pro dev
```

## Main apps

- `web`: landing page
- `expense-tracker`: Next.js + tRPC + better-auth + Drizzle/Postgres
- `poker-planner`, `scribble`: Next.js clients using shared Convex backend
- `housie-game`: Next.js game app

For app/package scripts and workspace details, see `buildio_pro/README.md`.
