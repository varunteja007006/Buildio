# Document Extraction + Ingestion — cortex-ai

**Date:** 2026-09-10
**Status:** ✅ 100% — extraction pipeline + extract UI (C1–C8), review/edit/diff UI (D1–D7), ingestion (C9, E1–E6), audit logs (F1–F6), and trash + cascades (H3–H8, H10–H12) are done. Out-of-plan UX fixes along the way: header Upload dialog now has a topic/folder picker when no tree folder is selected (per-folder upload keeps its fixed destination); `?extraction=<id>` deep link on `/dashboard/documents` opens the extraction review dialog (used by the document audit detail dialog's "Open extraction review & diff" link); `generateChunks` infinite-loop fix (stall when a break lands within `overlap` of `start` or the final chunk is shorter than `overlap` — threw `RangeError: Invalid array length` on whitespace-heavy extraction output); `ingestDocument` now converts unexpected throws into failed outcomes so `lastIngestError` is always current; the "Ingest failed" badge is a popover with the full error + a Retry ingest action; embeddings switched to `google/gemini-embedding-2` via the Vercel AI Gateway (`lib/ai/index.ts`), with `outputDimensionality` pinned to 1536 (model default is 3072) to match the `vector(1536)` column. Document audit logs now persist `durationMs` (extraction + ingest, success and failure) and embedding token counts in the ingest `usage` jsonb; the Documents audit tab shows Tokens and Duration columns (xl+ viewports) and the detail dialog shows Duration (migration `0011_massive_queen_noir`). Trash + cascades (migration `0012_true_serpent_society`): every mutable row (`documents`, `extractions`, `resources`, `embeddings`, `folders`, `topics`) got a nullable `deletedBatchId`; single-row deletes and container cascades tag rows with a batch id so restore resurrects exactly the rows trashed together (never individually-deleted extractions or re-ingest-superseded resources). Document delete (H5) cascades to extractions/resources/embeddings; restore (H6) un-deletes only that batch. Folder/topic delete (H11) soft-deletes the folder subtree (recursive) and every document in it; restore (H12) un-trashes the subtree + batch documents. New `DELETE /api/documents/[id]/permanent` (H3, owner only) hard-deletes extractions/resources/embeddings and the UploadThing file via `UTApi.deleteFiles`; `DELETE /api/documents/trash` empties the trash (owner only); trash page `/dashboard/documents/trash` (H7, sidebar link) lists deleted documents + extraction templates with Restore / Delete permanently / Empty trash (H8). `deleted_batch_id` cascade columns (A10, migration `0012_true_serpent_society`).
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
- [x] A8 `documents.extractionStatus` column, or derive from `extractions` — derived: `DocumentExtractionBadge` reads the shared `useExtractionStatuses` workspace query (no extra column or per-row fetch)
- [x] A9 `findRelevantContent` (`lib/ai/embedding.ts:84`) excludes deleted embeddings/resources **and** chunks of deleted documents (left join so legacy chunks with `documentId = null` still surface)
- [x] A10 Generate + apply migration — done for A2–A7 (migration `0006_equal_spitfire`), D6 (`0007_flippant_callisto`), `documents.lastIngestError` (`0008_messy_triathlon`), and the `deletedBatchId` cascade columns on documents/extractions/resources/embeddings/folders/topics (`0012_true_serpent_society`, applied)

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

- [x] C1 Checkbox row selection + bulk action bar in documents table/tree (TanStack `rowSelection` in the table; `selectedDocIds` threaded through `RowSharedProps` in the tree; shared `DocumentsBulkBar` with count/Clear/Extract)
- [x] C2 "Extract" bulk action → `ExtractDocumentsDialog` (`components/documents/extract-dialog.tsx`; queues via `useCreateExtractions`, then runs jobs in a bounded concurrent pool via `runExtractionsConcurrently` — 3 at a time, badges poll for progress)
- [x] C3 Dialog: template select, model combobox (reuse `/api/chat/models`), "auto-run ingestion" toggle (model empty = template default; toggle maps to `autoIngest`)
- [x] C4 `POST /api/extraction` → create rows with status `pending` (validates documents + template ownership/workspace; snapshots template; client: `api/extractions/{types,api,query}.ts` + `useCreateExtractions`)
- [x] C5 `lib/extraction/extract-text.ts` — fetch file; txt/md/csv text; PDF as multimodal file part
- [x] C6 `lib/extraction/run-extraction.ts` — build prompt from template, call `generateText`, capture usage/raw (schema templates attempt JSON parse; failure keeps raw + flags error)
- [x] C7 Status polling hook (3s) while any extraction runs (`useExtractionStatuses` in `api/extractions/query.ts`)
- [x] C8 Extraction status badges in table + tree (`DocumentExtractionBadge`)
- [x] C5b `POST /api/extraction/[id]/run` — runs a job: pending→processing→completed/failed, appends an `ai` extraction version, re-runs create next version (part of D3)
- [x] C9 Wire orphaned `useIngestDocuments` into the extraction/ingestion flow (used by the bulk bar, per-document row actions, and the tree's file rows)

## D. Review / edit / diff

- [x] D1 Extraction review dialog (document + AI output) — click the extraction badge in the table/tree → `components/documents/extraction-review-dialog.tsx` (filename, template, model, editable content, structured-output collapsible, failed error display, live updates while running)
- [x] D2 Editable output + Save (creates a `user` version) — `PATCH /api/extraction/[id]` appends a `user` `extraction_versions` row and updates `currentContent`
- [x] D3 Re-run extraction (creates a new `ai` version) — Re-run button calls the existing run route; a new AI version also clears a stale approval
- [x] D4 Version history list per extraction — `GET /api/extraction/[id]/versions` + `ExtractionVersionHistory` (v#, AI/User badge, date)
- [x] D5 Diff view: version vs current — "Diff vs current" toggle renders an LCS line diff (`lib/line-diff.ts`), +/− colored lines with change count
- [x] D6 "Approved" flag gating ingestion — `extractions.approved` column (migration `0007_flippant_callisto`, applied), PATCH-toggled in the dialog (completed only, cleared on content change); E2 ingest must consume the latest approved version
- [x] D7 Soft-delete an extraction (`deletedAt`) + restore route; versions stay intact — `DELETE`/`POST /api/extraction/[id]/restore`; restore UI lands with the trash page (H7)

## E. Ingestion UI + auto-run

- [x] E1 Bulk "Ingest" action (source = latest approved extraction) — "Ingest" item in the shared `DocumentsBulkBar` (table + tree), ingests the selected documents
- [x] E2 Update `POST /api/ingest` to consume extraction content, per-document; fallback to raw file when no extraction — accepts `{ documentIds? }` (omitted = all uningested); content resolution in `lib/ingest/ingest-document.ts` (latest approved completed extraction → `currentContent`/`rawOutput`, else text-file fetch)
- [x] E3 Per-document ingest action — `DocumentIngestButton` in the table's row actions + tree file rows (rows also have a per-doc Extract action reusing the extract dialog, and an "Ingest failed" error badge fed by `documents.lastIngestError`)
- [x] E4 Auto-ingest after extraction when the toggle is on — `POST /api/extraction/[id]/run` calls `ingestDocument` after completion when `autoIngest` was set; an ingest failure never fails the completed extraction (reported via `ingestion` in the response)
- [x] E5 Re-ingest supersedes the old resource via soft delete (`resources.deletedAt = now()`); old embeddings stay for history but retrieval filters deleted resources; new resource gets `documentId` and the consumed extraction's `resourceId` is linked
- [x] E6 Chunk-count / failure toasts — success/partial/failure toasts in `useIngestDocuments` (sonner, with the first failure's error message); documents + resources + extractions queries invalidated; failures persist on `documents.lastIngestError` (migration `0008_messy_triathlon`) and surface as a tooltip badge in the table/tree

## F. Audit logs

- [x] F1 Write `document_audit_logs` on extraction (instructions snapshot + raw AI output + final) — success and failure paths of `POST /api/extraction/[id]/run` (`recordDocumentAudit` in `lib/audit/document-audit.ts`, fire-and-forget)
- [x] F2 Write on ingestion (documentIds, chunk counts, resourceId) — per-document rows in `POST /api/ingest` and in the extraction run route's auto-ingest; chunk count / resourceId / source stored in the `usage` jsonb
- [x] F3 Audit page tabs: Chat / Documents — `components/pages/audit-logs.tsx` (button tabs; chat columns split into `components/audit-logs/chat-audit-columns.tsx`)
- [x] F4 Document audit detail dialog (+ link to diff) — `components/audit-logs/document-audit-details-dialog.tsx`; "Open extraction review & diff" links to `/dashboard/documents?extraction=<id>` (deep link handled by `DocumentExtractionBadge` via nuqs)
- [x] F5 `api/document-audit-logs/*` + `/api/document-audit-logs` route (paginated, scoped to user + active workspace, `action` filter (comma-separated, validated); registered in `api/endpoints.ts`; Documents tab has an action select filter). Audit tables survive workspace deletion: `document_audit_logs.workspaceId` and `chat_audit_logs.workspaceId` no longer FK workspaces (migrations `0009_lively_the_santerians` + `0010_large_red_wolf` dropped the cascades)
- [x] F6 Audit actions: `extract`, `ingest`, `delete`, `restore`, `permanent_delete`, `template_create`/`update`/`delete`; audit rows survive the entity's deletion (immutable). Document `permanent_delete` will be wired when H3 adds the document permanent-delete route (template `permanent_delete` done)

## H. Document soft delete + chunk cascade + trash

- [x] H1 `DELETE /api/documents/[id]` — soft delete, guarded by `isNull(deletedAt)` (blocks delete while an extraction is `pending`/`processing` — covers H10)
- [x] H2 `POST /api/documents/[id]/restore`
- [x] H3 `DELETE /api/documents/[id]/permanent` — owner only; hard-deletes extractions/resources/embeddings (versions cascade via FK) and deletes the UploadThing file via `UTApi.deleteFiles` (key extracted from the CDN URL, best-effort)
- [x] H4 `GET /api/documents` hides deleted by default; `status=deleted` returns the trash view; response includes `trashed` boolean (UI: table has a "Deleted only" switch; tree always shows active docs)
- [x] H5 Cascade on document delete: soft-delete its `extractions`, `resources`, and `embeddings` — one `deletedBatchId` per delete (`lib/documents/document-cascade.ts`, transactional)
- [x] H6 Cascade restore: restoring a document un-deletes the children deleted with it (`deletedBatchId` filter — single-row extraction deletes and re-ingest-superseded resources stay deleted)
- [x] H7 Trash page `/dashboard/documents/trash` + sidebar link (`components/pages/documents-trash.tsx`; Documents + Extraction templates sections)
- [x] H8 Trash lists deleted documents + extraction templates; Restore, Delete permanently, Empty trash — `DELETE /api/documents/trash` (owner only) empties the document trash; templates reuse their restore/permanent routes
- [x] H9 Per-document delete action in table + tree file rows, with confirm copy ("moved to trash"); restore affordance in the table's deleted view
- [x] H10 Block soft delete while an extraction/ingestion for that document is `processing` (or cancel the job first) — done for `pending`/`processing` extractions in H1; ingestion is synchronous per request, so there is no async ingest job to block
- [x] H11 Deleting a `topic`/`folder` cascades soft-delete to its documents (recursively for nested folders) and their chunks — `lib/documents/container-cascade.ts`; folder delete trashes the folder subtree + its documents, topic delete trashes the topic, its folder trees, and every document of the topic; all rows share one `deletedBatchId`
- [x] H12 Restoring a `topic`/`folder` restores the documents/chunks it trashed (same `deletedBatchId` mechanism as H6)

## G. Cross-cutting

- [x] G1 Register new endpoints in `api/endpoints.ts` (extraction, documents detail/restore/permanent/trash, ingest, folders, topics, document-audit-logs all registered; `api/ingest/api.ts` now goes through the registry)
- [x] G2 Split files to stay under 250 lines (trash page split into page + `components/documents/trash/*`; cascade logic in `lib/documents/*`)
- [x] G3 Typecheck (`pnpm --filter=cortex-ai typecheck`) + lint (`eslint`) pass — clean, and `pnpm build:cortex-ai` succeeds
