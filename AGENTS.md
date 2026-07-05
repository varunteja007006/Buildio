# Agent Notes

## Repo layout (non-obvious)
- Git root is `/home/varun/Documents/Github/Buildio`, but the actual pnpm/turbo workspace is `buildio_pro/`.
- Run workspace commands from `buildio_pro/` (or use `pnpm --dir buildio_pro ...` from repo root).
- Tracked apps are: `web`, `expense-tracker`, `housie-game`, `poker-planner`, `scribble`.

## High-signal commands
- Install deps: `pnpm --dir buildio_pro install` (Node `>=20`, pnpm `11.4.0`).
- Dev all apps/packages: `pnpm --dir buildio_pro dev`.
- Dev one app: `pnpm --dir buildio_pro dev:web` / `dev:expense-tracker` / `dev:housie-game` / `dev:poker-planner` / `dev:scribble`.
- `secret-santa` has no root shortcut; run it with filters (for example `pnpm --dir buildio_pro --filter=secret-santa dev`) only if you intend to work on local/ignored content.
- Lint workspace: `pnpm --dir buildio_pro lint`.
- There is no root `test` or `typecheck` script; run per app/package (for example `pnpm --dir buildio_pro --filter=expense-tracker typecheck`).

## Verification defaults
- For app changes: run `lint` and `typecheck` on the touched app via `--filter`.
- For shared UI/config changes: run at least `pnpm --dir buildio_pro --filter=@workspace/ui lint` and one consuming app's `typecheck`.
- If touching Convex functions, also run `pnpm --dir buildio_pro --filter=@workspace/games-convex-backend dev` (or `setup`) to regenerate/check `convex/_generated` outputs.

## Architecture map
- `buildio_pro/apps/web`: simple Next.js landing app.
- `buildio_pro/apps/expense-tracker`: Next.js + better-auth + tRPC (`app/api/trpc/[trpc]/route.ts`) + Drizzle/Postgres (`drizzle.config.ts`).
- `buildio_pro/apps/poker-planner` and `buildio_pro/apps/scribble`: Next.js clients backed by shared Convex package.
- `buildio_pro/apps/housie-game`: Next.js game app (currently only transpiles `@workspace/ui`).
- `buildio_pro/packages/games-convex-backend`: shared Convex schema/functions used by game apps.
- `buildio_pro/packages/ui`: shared shadcn/Radix component library consumed by all apps.

## Repo-specific conventions
- Import shared code through workspace aliases (`@workspace/ui/...`, `@workspace/games-convex-backend/...`), not long relative paths.
- App-local alias is `@/*` (configured per app `tsconfig.json`).
- Formatting uses Prettier + `@trivago/prettier-plugin-sort-imports`; keep import groups aligned with `.prettierrc`.
- `_generated/**/*` is prettier-ignored; treat generated files (for example `convex/_generated/*`) as generated artifacts.

## Env and deploy gotchas
- Turbo build depends on `.env` and forwards `DATABASE_URL`/`DATABASE_NAME` (`buildio_pro/turbo.json`).
- `expense-tracker` requires `DATABASE_URL` at module load (`lib/db/index.ts`) and for Drizzle CLI (`drizzle.config.ts`).
- Convex client providers in `scribble`/`poker-planner` use `process.env.NEXT_PUBLIC_CONVEX_URL!`; missing env crashes early.
- Railway configs (`buildio_pro/*-railway.toml`) deploy Convex before building `poker-planner`/`scribble`; preserve that order.
