import type { ChatAuditLog } from "@/api/audit-logs/types";

/** Aggregate usage metrics for the active workspace. */
export type DashboardStats = {
  threads: number;
  messages: number;
  documents: number;
  totalTokens: number;
  flaggedQueries: number;
  blockedQueries: number;
};

/** Response from GET /api/dashboard */
export type DashboardResponse = {
  stats: DashboardStats;
  recentLogs: ChatAuditLog[];
};
