import { db } from "@/lib/db";
import { documentAuditLogs } from "@/lib/db/schema/document-audit-logs";

/**
 * Actions recorded in `document_audit_logs`. The table is immutable —
 * rows are never updated or deleted, so they survive the deletion of the
 * documents/extractions/templates they describe.
 */
export type DocumentAuditAction =
  | "extract"
  | "ingest"
  | "delete"
  | "restore"
  | "permanent_delete"
  | "template_create"
  | "template_update"
  | "template_delete";

export type DocumentAuditInput = {
  userId: string;
  workspaceId: string;
  action: DocumentAuditAction;
  documentIds?: string[] | null;
  extractionId?: string | null;
  templateSnapshot?: unknown;
  instructionsSnapshot?: string | null;
  rawAiOutput?: string | null;
  finalOutput?: string | null;
  model?: string | null;
  provider?: string | null;
  usage?: unknown;
  /** Wall-clock duration of the audited operation, in milliseconds. */
  durationMs?: number | null;
  status?: string | null;
  error?: string | null;
};

/**
 * Record a document audit event. Fire-and-forget: call with
 * `void recordDocumentAudit({...}).catch(console.error)` — an audit
 * failure must never fail the operation being audited.
 */
export async function recordDocumentAudit(
  input: DocumentAuditInput,
): Promise<void> {
  await db.insert(documentAuditLogs).values({
    userId: input.userId,
    workspaceId: input.workspaceId,
    action: input.action,
    documentIds: input.documentIds ?? null,
    extractionId: input.extractionId ?? null,
    templateSnapshot: input.templateSnapshot ?? null,
    instructionsSnapshot: input.instructionsSnapshot ?? null,
    rawAiOutput: input.rawAiOutput ?? null,
    finalOutput: input.finalOutput ?? null,
    model: input.model ?? null,
    provider: input.provider ?? null,
    usage: input.usage ?? null,
    durationMs: input.durationMs ?? null,
    status: input.status ?? null,
    error: input.error ?? null,
  });
}
