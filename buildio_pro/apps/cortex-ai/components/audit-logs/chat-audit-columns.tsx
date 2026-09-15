"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import {
  formatDateTime,
  formatMs,
  formatNumber,
  truncate,
} from "@/api/audit-logs/helpers";
import type { ChatAuditLog } from "@/api/audit-logs/types";
import { RiskBadge } from "@/components/audit-logs/risk-badge";
import type { Column } from "@/components/data-table";

function finishVariant(
  reason: string | null,
): "default" | "secondary" | "destructive" | "outline" {
  switch (reason) {
    case "stop":
      return "default";
    case "tool-calls":
      return "secondary";
    case "error":
    case "content-filter":
      return "destructive";
    default:
      return "outline";
  }
}

export function getChatAuditColumns(
  onView: (log: ChatAuditLog) => void,
): Column<ChatAuditLog>[] {
  return [
    {
      header: "Time",
      accessor: (log) => (
        <span className="text-muted-foreground">
          {formatDateTime(log.createdAt)}
        </span>
      ),
      cellClassName: "whitespace-nowrap",
    },
    {
      header: "User query",
      accessor: (log) => (
        <span className="block max-w-xs truncate" title={log.userQuery ?? ""}>
          {truncate(log.userQuery, 60)}
        </span>
      ),
    },
    {
      header: "Model",
      accessor: (log) => (
        <div className="flex flex-col">
          <span className="font-medium">{log.model ?? "—"}</span>
          {log.provider ? (
            <span className="text-xs text-muted-foreground">
              {log.provider}
            </span>
          ) : null}
        </div>
      ),
      headClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
    },
    {
      header: "Finish",
      accessor: (log) => (
        <Badge variant={finishVariant(log.finishReason)}>
          {log.finishReason ?? "unknown"}
        </Badge>
      ),
    },
    {
      header: "Risk",
      accessor: (log) => (
        <div className="flex items-center gap-1.5">
          <RiskBadge
            severity={log.guardrailSeverity}
            flagged={log.guardrailFlagged}
          />
          {log.guardrailBlocked ? (
            <Badge variant="destructive">blocked</Badge>
          ) : null}
        </div>
      ),
    },
    {
      header: "Tokens (in/out/total)",
      accessor: (log) =>
        `${formatNumber(log.inputTokens)} / ${formatNumber(
          log.outputTokens,
        )} / ${formatNumber(log.totalTokens)}`,
      headClassName: "hidden lg:table-cell",
      cellClassName: "hidden lg:table-cell whitespace-nowrap",
    },
    {
      header: "Latency (ttft/total)",
      accessor: (log) =>
        `${formatMs(log.timeToFirstOutputMs)} / ${formatMs(
          log.responseTimeMs,
        )}`,
      headClassName: "hidden lg:table-cell",
      cellClassName: "hidden lg:table-cell whitespace-nowrap",
    },
    {
      header: "Tools",
      accessor: (log) =>
        String(Array.isArray(log.toolCalls) ? log.toolCalls.length : 0),
      headClassName: "hidden sm:table-cell",
      cellClassName: "hidden sm:table-cell",
    },
    {
      header: "",
      accessor: (log) => (
        <Button variant="outline" size="sm" onClick={() => onView(log)}>
          View
        </Button>
      ),
      cellClassName: "text-right",
    },
  ];
}
