"use client";

import { useQuery } from "@tanstack/react-query";

import { getDocumentAuditLogs } from "./api";
import type { DocumentAuditLogsQuery } from "./types";

/** Query key factory for the document audit log domain */
export const documentAuditLogKeys = {
  all: ["document-audit-logs"] as const,
  list: (params: DocumentAuditLogsQuery = {}) =>
    ["document-audit-logs", "list", params] as const,
};

/** Fetch a paginated list of document audit logs */
export function useDocumentAuditLogs(params: DocumentAuditLogsQuery = {}) {
  return useQuery({
    queryKey: documentAuditLogKeys.list(params),
    queryFn: () => getDocumentAuditLogs(params),
  });
}
