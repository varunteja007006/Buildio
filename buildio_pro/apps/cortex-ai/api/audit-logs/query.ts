"use client";

import { useQuery } from "@tanstack/react-query";

import { getAuditLogs } from "./api";
import type { AuditLogsQuery } from "./types";

/** Query key factory for audit log domain */
export const auditLogKeys = {
  all: ["audit-logs"] as const,
  list: (params: AuditLogsQuery = {}) =>
    ["audit-logs", "list", params] as const,
};

/** Fetch a paginated list of chat audit logs */
export function useAuditLogs(params: AuditLogsQuery = {}) {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => getAuditLogs(params),
  });
}
