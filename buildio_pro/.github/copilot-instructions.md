<!-- .github/copilot-instructions.md: guidance for AI coding agents -->
# Quick orientation (for AI coding agents)

This repository is a Next.js (app-router) frontend + Convex backend located under `web/`.
Keep instructions short and concrete: point to files and commands, and follow existing patterns.

## Big picture
- Frontend: `web/` — Next 15 + React 19 + TypeScript using the app/ router. See `web/app/layout.tsx` for global provider composition.
- Backend: Convex functions + schema in `web/convex/` (schema: `convex/schema.ts`). `npm run backend` runs `npx convex dev`.
- Auth: uses `@convex-dev/auth` integrations. Server provider is in `web/app/layout.tsx` (`ConvexAuthNextjsServerProvider`) and client provider in `web/lib/providers/convex-provider.tsx`.

## How to run (local dev, PowerShell examples)
- Open one terminal for Next dev (frontend):
  - cd web; pnpm dev  # or `npm run dev`
- Open a second terminal for Convex dev (backend):
  - cd web; pnpm backend  # or `npm run backend` (runs `npx convex dev`)
- Build for production: `cd web; pnpm build` then `pnpm start`.

## Important envs & config
- NEXT_PUBLIC_CONVEX_URL — required by `web/lib/providers/convex-provider.tsx` at runtime for the Convex client.
- IMAGE_HOSTNAME — optionally referenced by `web/next.config.ts` for Next Image remotePatterns.

## Conventions & patterns (project-specific)
- Providers live in `web/lib/providers/` and are composed in `web/app/layout.tsx`.
- UI is componentized: `web/components/` -> atoms, common, features, templates. Prefer adding small, focused components near feature folders.
- Hooks and local-state: `web/hooks/` (zustand + custom hooks). Check `use-store.ts` and similar for existing store patterns.
- Server-side code, types, and DB model: `web/convex/` — add Convex functions and follow existing validators and schema usage. For new tables, update `convex/schema.ts`.
- Client vs Server components: follow the React "use client" pattern used in existing files (e.g., `web/lib/providers/convex-provider.tsx` uses `"use client"`).

## Tooling, linting, and formatting
- Lint: `cd web; pnpm lint` or `npm run lint` (uses Next's ESLint config).
- Strict checks: `cd web; pnpm run eslint:check` will fail on warnings.
- Formatting: `cd web; pnpm run format` and check with `format:check`.

## Where to look for examples
- Convex DB shape and enums: `web/convex/schema.ts` (large, canonical source of truth).
- Provider composition & auth wiring: `web/app/layout.tsx` and `web/lib/providers/convex-provider.tsx`.
- Feature layout example: `web/components/features/admin-panel/admin-panel-layout.tsx` (layout wrapper used in RootLayout).
- Brand and small constants: `web/lib/config/brand.ts` (used for Metadata).

## PR guidance & docs
- Contributing guide: `docs/development/contributing.md` — follow for PR and commit expectations.
- There are no test scripts in `web/package.json`. Do not assume automated tests are present; run lint/format locally before PR.

## Quick tips for AI edits
- If you add Convex tables, update `web/convex/schema.ts` and follow existing index patterns.
- For client components that use Convex, ensure `NEXT_PUBLIC_CONVEX_URL` is referenced and wrapped by `ConvexClientProvider`.
- Preserve provider composition order in `web/app/layout.tsx` (theme -> convex -> auth -> feature layout) unless intentionally changing app-wide behavior.

If anything here is unclear or you'd like more examples (e.g., Convex function shape, an example PR), tell me which area to expand and I will iterate.
