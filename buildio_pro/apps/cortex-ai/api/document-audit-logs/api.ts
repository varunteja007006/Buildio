import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

import type { DocumentAuditLogsQuery, DocumentAuditLogsResponse } from "./types";

/** Fetch a paginated list of document audit logs from the server */
export async function getDocumentAuditLogs(
  params: DocumentAuditLogsQuery = {},
): Promise<DocumentAuditLogsResponse> {
  const { data } = await apiClient.get<DocumentAuditLogsResponse>(
    endpoints.documentAuditLogs.list,
    { params },
  );
  return data;
}
