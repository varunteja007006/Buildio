import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

import type { AuditLogsQuery, AuditLogsResponse } from "./types";

/** Fetch a paginated list of chat audit logs from the server */
export async function getAuditLogs(
  params: AuditLogsQuery = {},
): Promise<AuditLogsResponse> {
  const { data } = await apiClient.get<AuditLogsResponse>(
    endpoints.auditLogs.list,
    { params },
  );
  return data;
}
