# Buildio.pro Copilot Instructions

## Workspace basics

- Git root is `Buildio/`, but the pnpm/turbo workspace is `buildio_pro/`.
- Use Node `>=20` and `pnpm@11.4.0`.
- Run workspace commands from `buildio_pro/` (or use `pnpm --dir buildio_pro ...` from git root).

## Current architecture

### Apps
- `web`: landing app.
- `expense-tracker`: Next.js + better-auth + tRPC + Drizzle/Postgres.
- `poker-planner`, `scribble`: Next.js realtime apps using shared Convex backend.
- `housie-game`: Next.js game app.

`apps/secret-santa` exists locally but is gitignored; there is no root shortcut script for it.

### Shared packages
- `@workspace/ui`: shared UI component library (`packages/ui/src/components`).
- `@workspace/theme`: shared theme CSS.
- `@workspace/games-convex-backend`: shared Convex schema/functions.
- `@workspace/eslint-config`, `@workspace/typescript-config`: shared tooling config.

## Commands you should prefer

```bash
# install
pnpm --dir buildio_pro install

# dev
pnpm --dir buildio_pro dev
pnpm --dir buildio_pro dev:expense-tracker

# lint + typecheck (there is no root typecheck/test script)
pnpm --dir buildio_pro lint
pnpm --dir buildio_pro --filter=expense-tracker typecheck

# convex backend
pnpm --dir buildio_pro --filter=@workspace/games-convex-backend dev
```

## Implementation conventions

### Imports and aliases
- Use workspace aliases (`@workspace/ui/...`, `@workspace/games-convex-backend/...`), not long relative imports.
- App-local imports use `@/*`.
- Prettier enforces import sorting through `@trivago/prettier-plugin-sort-imports`.

### Expense tracker specifics
- tRPC endpoint is `app/api/trpc/[trpc]/route.ts`, using router from `lib/trpc/routers/index.ts`.
- Auth endpoint is `app/api/auth/[...all]/route.ts` via better-auth.
- Drizzle config is `apps/expense-tracker/drizzle.config.ts`.
- `DATABASE_URL` is required at module load in `apps/expense-tracker/lib/db/index.ts`.

### Convex specifics
- Shared schema/functions live under `packages/games-convex-backend/convex`.
- Follow `packages/games-convex-backend/convex_rules.txt`.
- `poker-planner` and `scribble` instantiate `ConvexReactClient` with `process.env.NEXT_PUBLIC_CONVEX_URL!`; missing env crashes early.
- Treat `convex/_generated/*` as generated artifacts.

## Verification defaults

- App changes: run `lint` and `typecheck` for the touched app via `--filter`.
- Shared UI/config changes: run `pnpm --dir buildio_pro --filter=@workspace/ui lint` and typecheck at least one consuming app.
- Convex changes: run `pnpm --dir buildio_pro --filter=@workspace/games-convex-backend dev` (or `setup`) so generated outputs stay in sync.

## Deploy gotcha

- `buildio_pro/poker-planner-railway.toml` and `buildio_pro/scribble-railway.toml` deploy Convex before building the app; keep that order intact.
