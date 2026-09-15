/** Actions recorded in the immutable document audit log. */
export type DocumentAuditAction =
  | "extract"
  | "ingest"
  | "delete"
  | "restore"
  | "permanent_delete"
  | "template_create"
  | "template_update"
  | "template_delete";

/** A persisted document audit log row. */
export type DocumentAuditLog = {
  id: string;
  userId: string | null;
  workspaceId: string;
  action: DocumentAuditAction;
  documentIds: unknown;
  extractionId: string | null;
  templateSnapshot: unknown;
  instructionsSnapshot: string | null;
  rawAiOutput: string | null;
  finalOutput: string | null;
  model: string | null;
  provider: string | null;
  usage: unknown;
  /** Wall-clock duration of the audited operation, in milliseconds. */
  durationMs: number | null;
  status: string | null;
  error: string | null;
  createdAt: string;
};

/** All audit actions, in display order. */
export const DOCUMENT_AUDIT_ACTIONS = [
  "extract",
  "ingest",
  "delete",
  "restore",
  "permanent_delete",
  "template_create",
  "template_update",
  "template_delete",
] as const satisfies readonly DocumentAuditAction[];

/** Query params for paginated GET /api/document-audit-logs */
export type DocumentAuditLogsQuery = {
  page?: number;
  pageSize?: number;
  /** Comma-separated action filter, e.g. "extract,ingest" */
  action?: string;
};

/** Response from GET /api/document-audit-logs */
export type DocumentAuditLogsResponse = {
  logs: DocumentAuditLog[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

/** Coerce the jsonb documentIds column into a string array. */
export function asDocumentIds(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((id): id is string => typeof id === "string")
    : [];
}

/** AI token counts extracted from the jsonb usage column. */
export type AiTokenUsage = {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
};

/**
 * Extract AI token counts from the jsonb `usage` column: LLM usage
 * (`inputTokens`/`outputTokens`/`totalTokens`) for extract rows, or
 * `embeddingTokens` for ingest rows. Returns null when no token counts
 * are present.
 */
export function asAiTokens(value: unknown): AiTokenUsage | null {
  if (value == null || typeof value !== "object" || Array.isArray(value))
    return null;
  const usage = value as Record<string, unknown>;
  const num = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) ? v : null;
  const inputTokens = num(usage.inputTokens);
  const outputTokens = num(usage.outputTokens);
  const totalTokens =
    num(usage.totalTokens) ??
    (inputTokens != null || outputTokens != null
      ? (inputTokens ?? 0) + (outputTokens ?? 0)
      : num(usage.embeddingTokens));
  if (inputTokens == null && outputTokens == null && totalTokens == null)
    return null;
  return { inputTokens, outputTokens, totalTokens };
}
