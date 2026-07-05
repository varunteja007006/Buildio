# Buildio Pro Workspace

pnpm + Turborepo monorepo with multiple Next.js apps and shared packages.

## Requirements

- Node `>=20`
- pnpm `11.4.0`

## Install

```bash
pnpm install
```

## Common commands

```bash
# run every app/package dev task
pnpm dev

# run one app
pnpm dev:web
pnpm dev:expense-tracker
pnpm dev:housie-game
pnpm dev:poker-planner
pnpm dev:scribble

# quality checks
pnpm lint
pnpm --filter=expense-tracker typecheck

# builds
pnpm build
pnpm build:web
pnpm build:expense-tracker
```

## Workspace layout

### Apps
- `apps/web`: landing app
- `apps/expense-tracker`: tRPC + better-auth + Drizzle/Postgres app
- `apps/poker-planner`: game client using shared Convex backend
- `apps/scribble`: game client using shared Convex backend
- `apps/housie-game`: Next.js game app

`apps/secret-santa` exists locally but is gitignored (`.gitignore`).

### Packages
- `packages/ui`: shared shadcn/Radix component library
- `packages/theme`: shared theme CSS files
- `packages/games-convex-backend`: shared Convex schema/functions for game apps
- `packages/eslint-config`, `packages/typescript-config`: shared tooling config

## High-signal notes

- Import shared UI/components through `@workspace/ui/...`.
- App-local alias is `@/*`.
- Import ordering is enforced by Prettier + `@trivago/prettier-plugin-sort-imports`.
- Convex generated files live under `packages/games-convex-backend/convex/_generated`.

## Focused workflows

### Expense tracker database (Drizzle)

```bash
pnpm --filter=expense-tracker db:generate
pnpm --filter=expense-tracker db:migrate
pnpm --filter=expense-tracker db:studio
```

Requires `DATABASE_URL`.

### Convex backend for games

```bash
pnpm --filter=@workspace/games-convex-backend dev
# or one-time setup
pnpm --filter=@workspace/games-convex-backend setup
```

### Adding shared UI components

```bash
pnpm dlx shadcn@latest add button -c apps/expense-tracker
```

Components are generated into `packages/ui/src/components`.
