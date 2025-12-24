# Buildio.pro Copilot Instructions

## Architecture Overview

This is a **pnpm workspace monorepo** (Node >=20) with multiple Next.js 15 apps and shared packages managed by Turborepo. Apps are independent deployments sharing common UI, config, and backend infrastructure.

### Apps Structure
- **expense-tracker**: Full-stack app with tRPC, better-auth, Drizzle (PostgreSQL), Redis
- **housie-game, poker-planner, scribble, secret-santa**: Realtime games using Convex backend
- **web**: Landing page at buildio.pro

### Shared Packages
- **@workspace/ui**: shadcn/ui components library with Radix primitives
- **@workspace/theme**: CSS theme variants (citrus, caffeine, neo-brutalism, etc.)
- **@workspace/games-convex-backend**: Shared Convex functions for multiplayer games
- **@workspace/eslint-config**, **@workspace/typescript-config**: Shared configs

## Developer Workflows

### Running Apps
```bash
# From monorepo root - filter by app name
pnpm dev:expense-tracker    # or :housie-game, :scribble, etc.
pnpm build:poker-planner
pnpm start:web

# All apps in parallel
pnpm dev
```

### Package Management
- Uses **pnpm catalog** for version management (see `pnpm-workspace.yaml`)
- Install packages: `pnpm add <pkg> --filter=<app-name>`
- Example: `pnpm add lodash --filter=expense-tracker`

### Database (expense-tracker only)
```bash
cd apps/expense-tracker
pnpm db:push      # Push schema changes
pnpm db:studio    # Open Drizzle Studio
pnpm db:generate  # Generate migrations
```

### Convex Backend (games apps)
- Shared backend in `packages/games-convex-backend/convex/`
- Run: `cd packages/games-convex-backend && pnpm dev`
- Follow rules in `convex_rules.txt` - use **new function syntax** with `args`, `returns`, `handler`

## Critical Conventions

### Import Patterns
```tsx
// UI components - always use @workspace alias
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

// Convex API - from shared backend
import { api } from "@workspace/games-convex-backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

// NEVER use relative imports for workspace packages
// ❌ import { Button } from "../../../packages/ui/src/components/button"
// ✅ import { Button } from "@workspace/ui/components/button"
```

### CSS/Theming
- Each app imports theme in `app/globals.css`:
```css
@import "tailwindcss";
@import "../node_modules/@workspace/ui/src/styles/globals.css";
@import "../node_modules/@workspace/theme/citrus.css"; /* or caffeine, base, etc. */
```
- Apps use Tailwind v4 with `@source` directive
- Color tokens use oklch format in CSS variables

### Next.js Config
- All apps **must transpile** workspace packages:
```js
transpilePackages: ["@workspace/ui", "@workspace/games-convex-backend"]
```

### Authentication (expense-tracker)
- Uses **better-auth** with Drizzle adapter
- Client: `@/lib/auth-client` (React hooks)
- Server: `@/lib/auth` (auth instance)
- tRPC context includes session from `auth.api.getSession()`

### tRPC Setup (expense-tracker)
- Routers in `lib/trpc/routers/`, exported from `index.ts` as `appRouter`
- Use `protectedProcedure` for auth-required endpoints
- Endpoint: `/api/trpc`
- Client setup: `TRPCAppProvider` wraps app with `TRPCProvider` + `QueryClientProvider`

### Convex Integration (games apps)
- Provider: `ConvexClientProvider` wraps app (see `scribble/components/convex-provider.tsx`)
- Requires `NEXT_PUBLIC_CONVEX_URL` env var
- Schema shared in `games-convex-backend/convex/schema.ts`
- Use `query()` and `mutation()` with new syntax - see `convex_rules.txt`

## Component Patterns

### Adding shadcn Components
```bash
# Run from monorepo root, specify target with -c
pnpm dlx shadcn@latest add button -c apps/expense-tracker
# Components install to packages/ui/src/components
```

### Client Components
- Mark with `"use client"` for hooks/interactivity
- Convex/tRPC hooks require client components
- Keep server components default, convert only when needed

### Layout Patterns
- Apps use `(protected)` and `(unprotected)` route groups
- Protected layouts check auth, unprotected have public footer/header
- Example: `expense-tracker/app/(protected)/dashboard/`

## Deployment

Railway configs at monorepo root (`*-railway.toml`):
```toml
[build]
buildCommand = "pnpm build:housie-game"
[deploy]
startCommand = "pnpm start:housie-game"
```

## Key Files

- [turbo.json](buildio_pro/turbo.json): Build pipeline, env vars, caching
- [pnpm-workspace.yaml](buildio_pro/pnpm-workspace.yaml): Workspace + catalog versions
- [packages/games-convex-backend/convex_rules.txt](buildio_pro/packages/games-convex-backend/convex_rules.txt): Convex function patterns
- [packages/ui/src/lib/utils.ts](buildio_pro/packages/ui/src/lib/utils.ts): cn() utility
- [apps/expense-tracker/lib/trpc/init.ts](buildio_pro/apps/expense-tracker/lib/trpc/init.ts): tRPC context/procedures

## Common Gotchas

1. **Workspace imports broken?** Check `transpilePackages` in `next.config.mjs`
2. **Convex not connecting?** Verify `NEXT_PUBLIC_CONVEX_URL` set, provider wraps app
3. **Theme not applying?** Check `globals.css` imports theme CSS correctly
4. **Type errors from packages?** Run `pnpm build` at root to build all packages
5. **Database errors?** Check `DATABASE_URL` in `.env`, run `pnpm db:push`
