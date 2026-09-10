/** A persisted chat audit log row. */
export type ChatAuditLog = {
  id: string;
  userId: string;
  workspaceId: string;
  threadId: string | null;
  model: string | null;
  provider: string | null;
  finishReason: string | null;
  rawFinishReason: string | null;
  userQuery: string | null;
  responseText: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  cacheReadTokens: number | null;
  cacheWriteTokens: number | null;
  reasoningTokens: number | null;
  textTokens: number | null;
  timeToFirstOutputMs: number | null;
  stepTimeMs: number | null;
  responseTimeMs: number | null;
  performance: unknown;
  usage: unknown;
  toolCalls: unknown;
  toolResults: unknown;
  warnings: unknown;
  rawRequest: unknown;
  rawResponse: unknown;
  guardrailChecked: boolean;
  guardrailFlagged: boolean;
  guardrailBlocked: boolean;
  guardrailSeverity: string | null;
  guardrailCategories: unknown;
  guardrailReason: string | null;
  guardrailModel: string | null;
  error: string | null;
  createdAt: string;
};

/** Query params for paginated GET /api/audit-logs */
export type AuditLogsQuery = {
  page?: number;
  pageSize?: number;
};

/** Response from GET /api/audit-logs */
export type AuditLogsResponse = {
  logs: ChatAuditLog[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};
