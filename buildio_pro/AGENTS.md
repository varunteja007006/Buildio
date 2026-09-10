# AGENTS.md

pnpm + Turborepo monorepo of Next.js 16 apps and shared packages. **All code lives in `buildio_pro/` — run every command from `buildio_pro/`.** The git repo root (`Buildio/`) holds only the workspace, `README.md`, and `LICENSE` — there is no `.github/` and no CI.

## Do not

- Do not run the dev server unless the user explicitly mentions it.
- Do not push without building all apps once (`pnpm build`) to confirm they work.
- **Do not create a new UI component in an app.** Check `packages/ui/src/components/` first and reuse it (or install the shadcn primitive). See "UI components" below.

## Commands (from `buildio_pro/`)

- Per-app dev/build/start wrappers: `pnpm dev:web`, `pnpm dev:expense-tracker`, `pnpm dev:poker-planner`, `pnpm dev:housie-game`, `pnpm dev:scribble`, `pnpm dev:cortex-ai` (same for `build:` and `start:`). Prefer these over `pnpm dev` (runs all 6 apps).
- Generic: `pnpm --filter <name> <script>`. Install deps with `pnpm add <pkg> --filter=<name>`.
- Typecheck: every app exposes `typecheck` (`tsc --noEmit`), e.g. `pnpm --filter=cortex-ai typecheck`. **Do not run `pnpm check-types`** — turbo.json defines a `check-types` task but no package has that script.
- Lint: every app has `"lint": "eslint ."`, so `pnpm lint` (turbo) works. `@workspace/ui` emits a few warnings but 0 errors. **`pnpm format` does NOT sort imports** — ESLint's `import/order` rule does; fix with `eslint <dir> --fix`.
- ESLint enforces `max-lines: 250` per file (ignoring comments/blanks) — split files before hitting it.
- No test framework or test scripts exist anywhere.
- `pnpm format` = `prettier --write "**/*.{ts,tsx,md}"`; `_generated/**` is prettier-ignored.
- `pnpm clean` runs `git clean -xdf node_modules` — destructive. Prefer `pnpm clean:workspaces` (`turbo run clean`) or a package's `clean`.

## Dependencies

- Version catalog in `pnpm-workspace.yaml`: use `catalog:` refs (`react`/`react-dom` via `catalog:react19`). Keep new deps in the catalog instead of hardcoding versions.
- Security `overrides` in `pnpm-workspace.yaml` are renovate-managed; don't remove them. `renovate.json` enforces a 10-day stability window before upgrades.

## UI components (reuse is king)

- **One shared registry: `packages/ui/src/components/`** (~130 files). It contains shadcn primitives plus custom compositions you won't find upstream — e.g. `combobox*`, `file-upload*`, `sortable*`, `data-table/`, `action-bar*`, `sidebar*`, `message`, `message-scroller`, `bubble`, `marker`, `attachment`, `empty`, `faceted`, `confetti`. Grep this dir before writing any UI.
- Import from the package, never relatively: `@workspace/ui/components/button`, `@workspace/ui/lib/utils`. Apps add a `@/*` alias via tsconfig.
- Add a missing shadcn component with the CLI (run from `buildio_pro/`); it lands in `packages/ui`, not the app: `pnpm dlx shadcn@latest add <name> -c apps/web`.
- **cortex-ai trap:** its `components.json` still points `ui` at `@/components/ui`, which does not exist. cortex-ai imports `@workspace/ui/components/*` like everyone else — never install with `-c apps/cortex-ai`; use `-c apps/web`.
- Tailwind must scan `packages/ui` or its classes won't be generated: shared apps `@import` the package globals, cortex-ai uses `@source "../../packages/ui/src"`.
- `@workspace/theme/<theme>.css` supplies app theme tokens.

## Apps

- **`apps/web`** — landing page (buildio.pro). Imports `@workspace/ui/globals.css` in `app/layout.tsx`.
- **`apps/expense-tracker`** — full-stack: tRPC + better-auth + Drizzle/Postgres + Valkey. Drizzle `db:push|generate|migrate|studio` scripts require `DATABASE_URL`. DB schema in `lib/db/schema/*.schema.ts`, **shared zod schemas in `lib/db/zod-schema/` (reuse these — see tRPC section), tRPC routers in `lib/trpc/routers/*.router.ts` (all protected)**.
- **`apps/cortex-ai`** — AI RAG chat app (AI SDK + Drizzle + better-auth + uploadthing). Diverges from other apps:
  - Uses the same stable `drizzle-orm` (`^0.45.2`) / `drizzle-kit` (`^0.31.10`) as expense-tracker. Keep all apps on the stable `latest` tag — do not pin rc/beta builds (a `1.0.0-rc.x` + `0.31.x` mix breaks drizzle-kit's runtime version check via pnpm hoisting).
  - Uses the shared `@workspace/ui` components (its `components.json` is stale — see "UI components").
  - Auth middleware in `proxy.ts` protects `/dashboard` and `/chat`. `reactCompiler: true` in `next.config.ts`.
  - Requires more env than others (`AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN`, `UPLOADTHING_TOKEN`, Google OAuth, etc. — see `.env.example`).
  - **CRUD deletes: ask soft vs hard before implementing.** For every new delete, ask the user whether it should be soft (recoverable) or hard. Soft delete = `deletedAt` timestamp column, all reads filter `isNull(deletedAt)`, `DELETE` stamps `deletedAt = now()`, plus `POST /[id]/restore` and `DELETE /[id]/permanent` routes — mirror `app/api/folders/[id]/{route,restore/route,permanent/route}.ts`. **If soft, the entity must be reachable from a trash UI.** None exists yet (the delete dialog copy at `components/documents/documents-dialogs.tsx:60` promises "You can restore it later", but no surface lists deleted rows) — build the trash view/affordance as part of the feature, not just the routes. Append-only/immutable tables (`extraction_versions`, `document_audit_logs`) are never deleted.
- **`apps/poker-planner`, `apps/housie-game`, `apps/scribble`** — realtime games backed by the shared Convex backend.

## Convex (shared games backend)

- The backend lives in `packages/games-convex-backend/convex/`. The workspace-root `convex/` dir holds only generated AI guidelines (`convex/_generated/ai/guidelines.md`), not backend code.
- Run `pnpm dev` inside that package (`convex dev`) to watch + regenerate `_generated/` (which is committed). Production deploy: `npx convex deploy` (Railway build does this before `pnpm build:<app>`).
- Requires `CONVEX_DEPLOYMENT` / `NEXT_PUBLIC_CONVEX_URL` (see its `.env.example`). Uses `@convex-dev/presence` (configured in `convex.config.ts`).
- **Always use the new function syntax** `query({ args, returns, handler })` — rules in `packages/games-convex-backend/convex_rules.txt`. Old `query("name", handler)` form is forbidden.
- Apps import it as `import { api } from "@workspace/games-convex-backend/convex/_generated/api"`.

## Conventions

- **Never import workspace packages with relative paths.** Always `@workspace/ui/components/button`, `@workspace/ui/lib/utils`, `@workspace/theme/...`. Apps add `@/*` path alias via tsconfig.
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
- **Zod schemas are single-source, not duplicated per file.** `lib/db/zod-schema/*.zod.schema.ts` exports per-table `create/update/select*Schema` (drizzle-zod-generated) via the `zodSchema` barrel (`zodSchema.createEventSchema`). Reuse them in both the router and the client form instead of redefining the shape in each:
  - Router input: `.input(zodSchema.updateXSchema)` (see `user-profile.router.ts`) or compose fields from generated shapes with `zodSchema.createXSchema.shape.name` (see `event.router.ts`, `budget.router.ts`).
  - Client form: `const schema = zodSchema.updateXSchema;` and pass to `useAppForm` validators (see `components/organisms/user/user-profile-form-component.tsx`).
  - If drizzle-zod's generated schema lacks the validation you need (`.url()`, min/max), hand-write the shape as a plain `z.object` in the zod-schema file — e.g. `updateUserProfileSchema` — and share that. Do NOT re-declare a `z.object` inside a component.
  - Importing `zodSchema` into a client component pulls `drizzle-orm` into the client bundle — it's browser-safe (no node builtins) but adds weight; still prefer reuse over duplication.

## Plans (per-app docs)

- When a plan for an app is discussed, **ask the user whether to save it first** — do not write a plan file unprompted.
- If yes: save to `apps/<app>/docs/plans/<title>-<YYYY-MM-DD>.md`.
- Maintain `apps/<app>/docs/plans/plan.md` as a table `filename | short desc | status`.
- Done plans move to `apps/<app>/docs/plans/done/` and are marked `✅`; anything not done shows a `%` done.
- No `docs/plans/` dirs exist yet — create them on the first saved plan.

## Deploy & reference

- Railway: `*-railway.toml` at `buildio_pro/` root (build = `pnpm build:<app>`, start = `pnpm start:<app>`; convex apps run `npx convex deploy` during build).

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
