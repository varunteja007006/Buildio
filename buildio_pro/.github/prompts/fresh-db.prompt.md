---
description: Wipe the cortex-ai Postgres database and re-apply all Drizzle migrations from scratch
---

# Fresh database for cortex-ai

Perform a full reset of the cortex-ai primary Postgres database: wipe all data and
schema, then replay every Drizzle migration so the result matches a brand-new
environment.

## Context

- App: `apps/cortex-ai` (Next.js + Drizzle + Postgres with pgvector).
- Connection string comes from `apps/cortex-ai/.env` → `DATABASE_URL`
  (local dev runs in Docker container `cortex_ai_postgres`, port 5432).
- Migrations live in `apps/cortex-ai/lib/db/migrations/` and are applied with
  `pnpm db:migrate` from `apps/cortex-ai`.
- The `vector` extension is created by migration `0000` itself, so no manual
  extension setup is needed.

## Safety

This is DESTRUCTIVE and irreversible. Before running anything:

1. Read `DATABASE_URL` from `apps/cortex-ai/.env` and show it to the user.
2. Ask for explicit confirmation unless the user already said "fresh db" / "reset"
   in the request that triggered this prompt.

## Steps

1. Drop everything and recreate the empty schema (run via `psql "$DATABASE_URL"`):

   ```sql
   DROP SCHEMA public CASCADE;
   DROP SCHEMA IF EXISTS drizzle CASCADE;
   CREATE SCHEMA public;
   ```

2. Apply all migrations from scratch:

   ```bash
   cd apps/cortex-ai
   set -a; . ./.env; set +a
   pnpm db:migrate
   ```

   (`drizzle-kit migrate` does not load `.env` itself, hence the export.)

3. Verify the result with `psql` and report the numbers:

   ```sql
   SELECT extname FROM pg_extension WHERE extname = 'vector';  -- must return vector
   SELECT count(*) FROM pg_tables WHERE schemaname = 'public'; -- expect 28
   SELECT count(*) FROM drizzle.__drizzle_migrations;          -- expect 18
   ```

   Note: `count(*) FROM "user"` is wrong in psql — bare `user` is a keyword.
   Quote it: `FROM "user"`.

4. If any step fails, stop and report the error. Do not attempt manual fixes to
   generated migration files without asking.

## Variations

- If the user asks for only a data wipe (keep schema + journal), use
  `TRUNCATE TABLE ... RESTART IDENTITY CASCADE` on all `public` tables except
  `drizzle.__drizzle_migrations` instead of dropping schemas.
- If the user asks for a different app (e.g. `expense-tracker`), adapt the env
  file and migrate command from that app instead.
