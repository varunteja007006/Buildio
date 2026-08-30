# AGENTS.md

pnpm + Turborepo monorepo of Next.js 16 apps and shared packages. **All code lives in `buildio_pro/`** — run every command from `buildio_pro/`. The git repo root (`Buildio/`) only holds the workspace, `README.md`, `LICENSE`, and `.github/`.

## Do not

- Do not run the dev server unless user explicitly mentions.
- Do not push the code without building all the applications once to check if they are all working or not.

## Commands (from `buildio_pro/`)

- Per-app dev/build/start wrappers: `pnpm dev:web`, `pnpm dev:expense-tracker`, `pnpm dev:poker-planner`, `pnpm dev:housie-game`, `pnpm dev:scribble`, `pnpm dev:cortex-ai` (same for `build:` and `start:`). Prefer these over `pnpm dev` (runs all 6 apps).
- Generic: `pnpm --filter <name> <script>`. Install deps with `pnpm add <pkg> --filter=<name>`.
- Typecheck: apps expose `typecheck` (`tsc --noEmit`), e.g. `pnpm --filter=cortex-ai typecheck`. **Do not run `pnpm check-types`** — turbo.json defines a `check-types` task but no package has that script.
- `pnpm lint` is broken for most apps: `web`, `expense-tracker`, `poker-planner`, `scribble`, `housie-game` still use `next lint`, which was removed in Next 16 (installed: 16.3.3) and errors out. Only `cortex-ai` and `@workspace/ui` have working lint (`eslint .`). Lint an app directly with `eslint .` in its directory.
- No test framework or test scripts exist anywhere. No CI workflows.
- `pnpm format` = prettier only (`--write`). Import sorting is NOT done by prettier — it's enforced by ESLint's `import/order` rule (via `eslint-plugin-import-x`) in `@workspace/eslint-config/base.js`, configured with pathGroups matching the old trivago groups (`react`/`next` first, then third-party, `@workspace/*`, `@/*`, then relative). Fix with `eslint <dir> --fix`.
- `pnpm clean` runs `git clean -xdf node_modules` — destructive; prefer `turbo run clean` per package.

## Dependencies

- Version catalog in `pnpm-workspace.yaml`: use `catalog:` refs (`react`/`react-dom` via `catalog:react19`). Keep new deps in the catalog instead of hardcoding versions.
- Security `overrides` in `pnpm-workspace.yaml` are renovate-managed; don't remove them. `renovate.json` enforces a 10-day stability window before upgrades.

## Apps

- **`apps/web`** — landing page (buildio.pro). Imports `@workspace/ui/globals.css` in `app/layout.tsx`.
- **`apps/expense-tracker`** — full-stack: tRPC + better-auth + Drizzle/Postgres + Valkey. Drizzle `db:push|generate|migrate|studio` scripts require `DATABASE_URL`. Schema in `lib/db/schema/*.schema.ts`, zod in `lib/db/zod-schema/`, tRPC routers in `lib/trpc/routers/*.router.ts` (all protected). Local docs (`apps/expense-tracker/docs/`, `todo.md`) are untracked but current.
- **`apps/cortex-ai`** — AI RAG chat app (AI SDK + Drizzle + better-auth + uploadthing). Diverges from other apps:
  - Uses the same stable `drizzle-orm` (`^0.45.2`) / `drizzle-kit` (`^0.31.10`) as expense-tracker. Keep all apps on the stable `latest` tag — do not pin rc/beta builds (a `1.0.0-rc.x` + `0.31.x` mix breaks drizzle-kit's runtime version check via pnpm hoisting).
  - Has its **own** shadcn components in `@/components/ui` (its `components.json` points `ui` at the local app, not `@workspace/ui`) — adding a component with `-c apps/cortex-ai` goes there, not `packages/ui`.
  - Auth middleware in `proxy.ts` protects `/dashboard` and `/chat`. `reactCompiler: true` in `next.config.ts`.
  - Requires more env than others (`AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN`, `UPLOADTHING_TOKEN`, Google OAuth, etc. — see `.env.example`).
- **`apps/poker-planner`, `apps/housie-game`, `apps/scribble`** — realtime games backed by the shared Convex backend.

## Convex (shared games backend)

- Lives in `packages/games-convex-backend/convex/`. Run `pnpm dev` inside that package (`convex dev`) to watch + regenerate `_generated/` (which is committed). Production deploy: `npx convex deploy` (Railway build does this before `pnpm build:<app>`).
- Requires `CONVEX_DEPLOYMENT` / `NEXT_PUBLIC_CONVEX_URL` (see its `.env.example`). Uses `@convex-dev/presence` (configured in `convex.config.ts`).
- **Always use the new function syntax** `query({ args, returns, handler })` — rules in `convex_rules.txt`. Old `query("name", handler)` form is forbidden.
- Apps import it as `import { api } from "@workspace/games-convex-backend/convex/_generated/api"`.

## Conventions

- **Never import workspace packages with relative paths.** Always `@workspace/ui/components/button`, `@workspace/ui/lib/utils`, `@workspace/theme/...`. Apps add `@/*` path alias via tsconfig.
- shadcn components for the shared apps install into `packages/ui/src/components/*.tsx` via `pnpm dlx shadcn@latest add <name> -c apps/<app>` (run from `buildio_pro/`).
- Theme wiring (Tailwind v4) in an app's `app/globals.css`: `@import "tailwindcss"` + `@import "../node_modules/@workspace/ui/src/styles/globals.css"` + one `@import "../node_modules/@workspace/theme/<theme>.css"`. cortex-ai instead uses `shadcn/tailwind.css` + `@source "../../packages/ui/src"`.
- Every app's `next.config` must `transpilePackages: ["@workspace/ui"]` (games apps also `@workspace/games-convex-backend`).
- Env: `.env` is gitignored — copy the app's `.env.example`. `turbo.json` `globalEnv` lists every required variable.

## Client-side data & page structure

- **`page.tsx` = one-line re-export only**: `import { SamplePage } from "@/components/pages/sample"` then `export default SamplePage`. Page-level UI lives in `components/pages/`. (Not yet applied repo-wide — use it for new pages.)
- **HTTP apps (reference: `apps/cortex-ai/api/`)** — client API layer lives in `<app>/api/`, one folder per feature:
  - `api/endpoints.ts` — every endpoint, grouped by feature; dynamic ids as builders: `thread: (id: string) => \`/chat/threads/${id}\``.
  - `api/client.ts` — one axios instance per backend server, each with its own `baseURL` (add a named export per backend if there are two).
  - `api/<feature>/api.ts` — thin typed fetchers: `export const getX = (): Promise<X> => apiClient.get(endpoints.f.x).then((res) => res.data);`
  - `api/<feature>/query.ts` — TanStack Query hooks (`useQuery`/`useInfiniteQuery`/`useMutation`) + a query-key factory. Requires the React Query provider (`providers/query-provider.tsx` in cortex-ai).
  - `api/<feature>/helpers.ts` — transformations/constants; `api/<feature>/types.ts` — input/response types.
- **tRPC apps (reference: `apps/expense-tracker`)** — no `api/` folder; queries/mutations are typed out of the box:
  - Server: `lib/trpc/routers/<feature>.router.ts` (all `protectedProcedure`), merged into `appRouter` in `lib/trpc/routers/index.ts` (type `AppRouter`).
  - Client: `lib/trpc-client.tsx` exports `TRPCAppProvider` + `useTRPC`; wrap new routes in the provider.
  - Data hooks: `hooks/use-<feature>-queries.ts` — `const trpc = useTRPC();` then `useQuery(trpc.feature.proc.queryOptions(...))` / `useMutation(trpc.feature.proc.mutationOptions(...))`. Invalidate via a local query-key factory + `queryClient.invalidateQueries(...)`.

## Deploy & reference

- Railway: `*-railway.toml` at `buildio_pro/` root (build = `pnpm build:<app>`, start = `pnpm start:<app>`; convex apps run `npx convex deploy` during build).
