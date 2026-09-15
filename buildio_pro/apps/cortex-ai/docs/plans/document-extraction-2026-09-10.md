# Document Extraction + Ingestion — cortex-ai

**Date:** 2026-09-10
**Status:** 48% — template CRUD + data model + `POST /api/extraction` + document soft delete/restore/trash filter done; extraction runner, review UI, and trash page not started
**Target route:** `/dashboard/documents`

## Goal

Make `/dashboard/documents` support the full pipeline:

`upload → extract (LLM + template) → review/edit → ingest (chunk + embed) → audit`

Extraction is a new step. Ingestion already exists on the server (`POST /api/ingest`) but has no UI trigger.

## Decisions (locked)

- **PDFs:** send the file to a **multimodal gateway model** via the AI SDK (`generateText` with a file part). No `pdf-parse` dependency.
- **Template output:** always store **raw AI text**; optionally define a **JSON schema** on a template for structured fields. If parsing fails, keep raw output and flag it.
- **Audit:** new `document_audit_logs` table (do **not** overload `chat_audit_logs`).
- **Versions:** immutable `extraction_versions`; "current" = latest. Ingestion consumes the latest approved version.
- **Soft delete everywhere:** every mutable entity gets a `deletedAt` timestamp; `DELETE` sets `deletedAt = now()` (never a hard delete), `GET` filters `isNull(deletedAt)`, and restore/permanent routes exist. Mirror the existing folders/topics pattern (`folders.ts:34`, `folders/[id]/route.ts:117`, `restore/route.ts`). Deleting a container cascades: topic/folder → documents → extractions/resources/embeddings, all soft, tagged with a `deletedBatchId` so restore can undo exactly that batch. `extraction_versions` is append-only, so it is never deleted. `document_audit_logs` is immutable — never deleted.

## Known constraints

- `app/api/ingest/route.ts:68` currently rejects PDFs ("PDF/text extraction not yet implemented") — replaced by this plan.
- `api/ingest/query.ts:11` `useIngestDocuments()` exists but has **zero call sites**.
- `documents/ingest-docs/page.tsx` and `documents/scan-docs/page.tsx` are placeholder stubs, unlinked in the sidebar.
- Route handlers are synchronous — long docs need a status column + client polling (mirror expense-tracker statements).
- ESLint `max-lines: 250` per file (ignoring comments/blanks).

---

## A. Data model (Drizzle schema + migration)

- [x] A1 `extraction_templates` — workspaceId, name, description, instructions, outputSchema (jsonb, nullable), defaultModel (nullable), createdBy, `deletedAt`, timestamps. Unique partial index on (workspaceId, name) `WHERE deleted_at IS NULL` (mirrors topics slug index, `topics.ts:37`)
- [x] A2 `extractions` — documentId, templateId, templateSnapshot (jsonb), model, provider, status, rawOutput, currentContent, structuredOutput (jsonb), error, usage (jsonb), autoIngest, resourceId, `deletedAt`, timestamps
- [x] A3 `extraction_versions` — extractionId, version (int), source (`ai` | `user`), content, structuredOutput (jsonb), createdBy, createdAt (append-only, no `deletedAt`)
- [x] A4 `document_audit_logs` — userId, workspaceId, action, documentIds (jsonb), extractionId, templateSnapshot (jsonb), instructionsSnapshot, rawAiOutput, finalOutput, model, provider, usage (jsonb), status, error, createdAt (immutable, no `deletedAt`)
- [x] A5 `documents.deletedAt` — document soft delete
- [x] A6 `resources.documentId` (nullable FK → documents) so every chunk traces back to its document (`resources.deletedAt` already existed)
- [x] A7 `embeddings.deletedAt` — explicit soft delete for chunks (retrieval also guards via resource document)
- [ ] A8 `documents.extractionStatus` column, or derive from `extractions`
- [x] A9 `findRelevantContent` (`lib/ai/embedding.ts:84`) excludes deleted embeddings/resources **and** chunks of deleted documents (left join so legacy chunks with `documentId = null` still surface)
- [ ] A10 Generate + apply migration — done for A2–A7 (migration `0006_equal_spitfire`, applied); remaining: indexes/queries as C/D/F/H features land

## B. Extraction templates

- [x] B1 `GET`/`POST /api/extraction-templates` (GET excludes soft-deleted)
- [x] B2 `PATCH`/`DELETE /api/extraction-templates/[id]` — DELETE sets `deletedAt = now()`, guarded by `isNull(deletedAt)`
- [x] B3 `POST /api/extraction-templates/[id]/restore` (mirror folders)
- [x] B4 `DELETE /api/extraction-templates/[id]/permanent` (hard delete; workspace `owner` role only, see `workspace-members.ts:27`)
- [x] B5 `api/extraction-templates/{api,query,types}.ts`
- [x] B6 Templates page `/dashboard/documents/extraction-templates`
- [x] B7 Create/edit dialog (name, instructions, output format, default model)
- [x] B8 Template list + soft-delete confirm + "Show deleted" / restore affordance (deleted view and restore exist; confirmation remains)
- [x] B9 Sidebar link under Documents
- [x] B10 Seed 2–3 starter templates (invoice, receipt, generic summary) — skipped, no seeding needed

## C. Run extraction

- [ ] C1 Checkbox row selection + bulk action bar in documents table/tree
- [ ] C2 "Extract" bulk action → `ExtractDocumentsDialog`
- [ ] C3 Dialog: template select, model combobox (reuse `/api/chat/models`), "auto-run ingestion" toggle
- [x] C4 `POST /api/extraction` → create rows with status `pending` (validates documents + template ownership/workspace; snapshots template; client: `api/extractions/{types,api,query}.ts` + `useCreateExtractions`)
- [ ] C5 `lib/extraction/extract-text.ts` — fetch file; txt/md/csv text; PDF as multimodal file part
- [ ] C6 `lib/extraction/run-extraction.ts` — build prompt from template, call `generateText`, capture usage/raw
- [ ] C7 Status polling hook (3s) while any extraction runs
- [ ] C8 Extraction status badges in table + tree
- [ ] C9 Wire orphaned `useIngestDocuments` into the extraction/ingestion flow

## D. Review / edit / diff

- [ ] D1 Extraction review dialog (document + AI output)
- [ ] D2 Editable output + Save (creates a `user` version)
- [ ] D3 Re-run extraction (creates a new `ai` version)
- [ ] D4 Version history list per extraction
- [ ] D5 Diff view: AI version vs current
- [ ] D6 "Approved" flag gating ingestion
- [ ] D7 Soft-delete an extraction (`deletedAt`) + restore route; versions stay intact for audit

## E. Ingestion UI + auto-run

- [ ] E1 Bulk "Ingest" action (source = latest approved extraction)
- [ ] E2 Update `POST /api/ingest` to consume extraction content, per-document; fallback to raw file when no extraction
- [ ] E3 Per-document ingest action
- [ ] E4 Auto-ingest after extraction when the toggle is on
- [ ] E5 Re-ingest supersedes the old resource via soft delete (`resources.deletedAt = now()`); old embeddings stay for history but retrieval filters deleted resources
- [ ] E6 Chunk-count / failure toasts

## F. Audit logs

- [ ] F1 Write `document_audit_logs` on extraction (instructions snapshot + raw AI output + final)
- [ ] F2 Write on ingestion (documentIds, chunk counts, resourceId)
- [ ] F3 Audit page tabs: Chat / Documents
- [ ] F4 Document audit detail dialog (+ link to diff)
- [ ] F5 `api/document-audit-logs/*` + `/api/document-audit-logs` route
- [ ] F6 Audit actions: `extract`, `ingest`, `delete`, `restore`, `permanent_delete`, `template_create`/`update`/`delete`; audit rows survive the entity's deletion (immutable)

## H. Document soft delete + chunk cascade + trash

- [x] H1 `DELETE /api/documents/[id]` — soft delete, guarded by `isNull(deletedAt)` (blocks delete while an extraction is `pending`/`processing` — covers H10)
- [x] H2 `POST /api/documents/[id]/restore`
- [ ] H3 `DELETE /api/documents/[id]/permanent` — owner only; also delete the UploadThing file via `UTApi.deleteFiles`
- [x] H4 `GET /api/documents` hides deleted by default; `status=deleted` returns the trash view; response includes `trashed` boolean (UI: table has a "Deleted only" switch; tree always shows active docs)
- [ ] H5 Cascade on document delete: soft-delete its `extractions`, `resources`, and `embeddings`
- [ ] H6 Cascade restore: restoring a document un-deletes the children deleted with it (tag cascade with a `deletedBatchId`/equivalent so single-row deletes are not resurrected)
- [ ] H7 Trash page `/dashboard/documents/trash` + sidebar link (required: soft delete must be reachable from a trash UI)
- [ ] H8 Trash lists deleted documents + extraction templates; Restore, Delete permanently, Empty trash
- [x] H9 Per-document delete action in table + tree file rows, with confirm copy ("moved to trash"); restore affordance in the table's deleted view
- [ ] H10 Block soft delete while an extraction/ingestion for that document is `processing` (or cancel the job first) — done for `pending`/`processing` extractions in H1; ingestion has no async job yet
- [ ] H11 Deleting a `topic`/`folder` cascades soft-delete to its documents (recursively for nested folders) and their chunks — today folder/topic delete leaves documents pointing at soft-deleted containers
- [ ] H12 Restoring a `topic`/`folder` restores the documents/chunks it trashed (same `deletedBatchId` mechanism as H6)

## G. Cross-cutting

- [ ] G1 Register new endpoints in `api/endpoints.ts` (extraction + documents detail/restore done; ingest and others pending)
- [ ] G2 Split files to stay under 250 lines
- [ ] G3 Typecheck (`pnpm --filter=cortex-ai typecheck`) + lint (`eslint`) pass
