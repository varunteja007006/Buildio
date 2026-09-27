# External Database Connections Plan - cortex-ai

**Date:** 2026-09-15
**Status:** In progress — Postgres flow shipped (schema, encrypted secrets, probe,
API, wizard UI at `/dashboard/agent/connectors`); row click navigates to a
connector detail page at `/dashboard/agent/connectors/[id]` listing the
database's tables (`GET /api/connections/:id/tables`, Postgres only, with a
`GET /api/connections/:id` detail endpoint for direct links). MongoDB/MySQL/SQLite
probes and the SQLite file-upload flow are still pending and surface as
"Coming soon" in the type picker.
**Scope:** Connector feature: user-provided credentials for external Postgres, MongoDB, MySQL databases and SQLite file uploads, with a pre-save connection check

## Goal

Let users register external databases from a connections screen. The app treats
every target as external: the user supplies host/credentials (or uploads a SQLite
file), the server validates the connection with a live check, and only then is the
connection saved. Saved connections are the foundation for later features
(schema browsing, ingestion from external sources).

## Current baseline

- `docker-compose.yml` already runs local connector test targets:
  - Postgres: `connector-postgres` on `localhost:5434` (`connector_test`/`connector_test`)
  - MongoDB: `mongo` on `localhost:27017` (`cortex_ai`/`cortex_ai`)
  - MySQL: `mysql` on `localhost:3306` (`cortex_ai`/`cortex_ai`)
  - SQLite: no server; a seeded `sample.db` sits on the `sqlite_data` volume for
    testing the upload flow
- MinIO runs on `localhost:9002` (API) with bucket `${S3_BUCKET:-cortex-ai}` for
  SQLite file storage.
- App data layer: HTTP API modules under `api/<feature>/` registered in
  `api/endpoints.ts`, routes under `app/api/`, Drizzle schema in `lib/db/schema/`,
  auth via better-auth with workspace-scoped reads/writes.

## Decisions

- **Connection types:** `postgres`, `mongodb`, `mysql`, `sqlite`. SQLite is always
  file-upload based (embedded DB, no network server).
- **Secrets at rest:** credentials are encrypted with AES-256-GCM using a new
  `ENCRYPTION_KEY` env var before they hit Postgres. API responses never return
  passwords or full connection strings; the client sees masked hints
  (e.g. `user@host:port/db`). Editing credentials overwrites the ciphertext.
- **Connect check before save:** a stateless `POST /api/connections/test` endpoint
  probes the target with a hard timeout (3s connect / 5s total) and returns
  `{ ok, latencyMs, error? }`. The create/update form calls it first; the save
  endpoint re-checks server-side and rejects saving an unreachable connection.
- **SQLite flow:** upload `.sqlite`/`.db`/`.sqlite3` file to MinIO (S3 client, same
  pattern as expense-tracker `lib/storage/s3.ts`), then validate server-side by
  opening it with `better-sqlite3` and running a read-only
  `SELECT name FROM sqlite_master WHERE type='table'`. Size cap 50 MB.
- **SSRF posture:** connection targets are user-supplied by design, so an allowlist
  is wrong. Instead: no redirects followed, strict timeouts, and a configurable
  `CONNECTOR_BLOCKED_HOSTS` guard (default: link-local/metadata IPs) that can be
  relaxed in dev where the compose targets are private IPs.
- **Lifecycle:** soft delete (`deletedAt`), trash view with restore and
  owner-authorized permanent delete, partial unique index on
  `(workspace_id, name) WHERE deleted_at IS NULL`.
- **Scope:** every read/write filters by the authenticated user's active workspace
  and verifies membership; connection ids alone never authorize access.

## Data model

New table `connections` in `lib/db/schema/connections.ts`:

- `id` (uuid pk), `workspaceId` (fk, indexed), `name` (text, unique per workspace)
- `type` (enum: postgres | mongodb | mysql | sqlite)
- `host`, `port`, `username`, `passwordEncrypted`, `database` (nullable; unused for sqlite)
- `sqliteFileKey` (nullable; MinIO object key), `sqliteFileName`, `sqliteFileSizeBytes`
- `status` (enum: unverified | connected | failed), `lastCheckedAt`, `lastError`
- `deletedAt` (nullable), `createdAt`, `updatedAt`
- Partial unique index `(workspace_id, name) WHERE deleted_at IS NULL`
- Driver deps: `mongodb` (driver), `mysql2`, `better-sqlite3`; Postgres reuses the
  existing `pg`/Drizzle stack with a throwaway `pg.Client` per probe.

## API surface

Registered under `api/connections/` (`api.ts`, `types.ts`, `query.ts`) and in
`api/endpoints.ts`:

- `GET /api/connections` — paginated list (`page`, `pageSize` capped, `total`,
  `pageCount`, `status=active|deleted`)
- `POST /api/connections/test` — body: type + credentials; returns probe result,
  never persists
- `POST /api/connections` — create; re-probes before insert
- `PATCH /api/connections/:id` — update (credentials optional; secrets only
  rewritten when provided) + re-probe
- `DELETE /api/connections/:id` — soft delete
- `POST /api/connections/:id/restore`, `DELETE /api/connections/:id/permanent`
- `POST /api/connections/:id/check` — manual re-check updating `status`,
  `lastCheckedAt`, `lastError`

Shared zod schemas live in `lib/db/zod-schema/` equivalents for cortex-ai
(`lib/` validation module per feature) and are reused by routes and forms.

## UI

Page `app/(authenticated)/dashboard/agent/connectors/` (existing sidebar route)
split to stay under the 250-line limit:

- `page.tsx` — server shell
- `connections-table.tsx` — columns: name, type badge, target (masked), status,
  last checked, actions
- `connection-dialog.tsx` — add/edit form: type select drives fields; SQLite type
  swaps to file upload; "Test connection" button hits `/test` and shows
  latency/error inline; save disabled until check passes
- Trash/restore affordances in the table's deleted view, matching extraction
  templates' pattern

Query layer: typed endpoint builders in `api/connections/query.ts`, query-key
factory, mutation success handlers invalidating the connections list.

## Implementation phases

1. [x] Schema + migration: `connections` table, `db:generate`, `db:migrate`
2. [x] Secrets module: AES-256-GCM encrypt/decrypt, `ENCRYPTION_KEY` in
       `.env.example`, `environment.d.ts`, `turbo.json` `globalEnv`
3. [ ] Probe module: per-driver connect check with timeouts; SQLite MinIO download
       + `better-sqlite3` validation — Postgres probe done (`pg` Client with 3s
       connect / 5s total timeout); other drivers pending
4. [x] API module: test/create/list/update/delete/restore/permanent/check routes,
       workspace scoping, pagination metadata — non-Postgres types rejected until
       their probes land
5. [x] Client layer: `api/connections/` module + endpoints registration
6. [x] UI: connections page, table, dialog with test-before-save, trash view —
       2-step wizard (type picker → connection details → check → save)
7. [x] Tables browsing: `lib/connectors/schema.ts` + `GET
       /api/connections/:id/tables` (Postgres, information_schema), a `GET
       /api/connections/:id` detail endpoint, and a connector detail page at
       `/dashboard/agent/connectors/[id]` opened by row click (non-Postgres rows
       show a "coming soon" toast)
8. [ ] Verify against compose targets (all four types), lint + typecheck

## Out of scope (later plans)

- Column/detail browsing of connected databases and ingestion from connectors
  into resources/embeddings (tables list view shipped on the connector detail
  page; column/detail browsing and safe query tools are planned in
  `database-connector-semantic-context-2026-09-27.md`)
- OAuth-style managed connectors or connection pooling
