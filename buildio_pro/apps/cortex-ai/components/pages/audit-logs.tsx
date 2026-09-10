"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import {
  formatDateTime,
  formatMs,
  formatNumber,
  truncate,
} from "@/api/audit-logs/helpers";
import { useAuditLogs } from "@/api/audit-logs/query";
import type { ChatAuditLog } from "@/api/audit-logs/types";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { AuditLogDetailsDialog } from "@/components/audit-logs/audit-log-details-dialog";
import { RiskBadge } from "@/components/audit-logs/risk-badge";
import { DataTable, type Column } from "@/components/data-table";

const PAGE_SIZE = 20;

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

export function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ChatAuditLog | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useAuditLogs({ page, pageSize: PAGE_SIZE });
  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.pageCount ?? 1;

  const columns: Column<ChatAuditLog>[] = [
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelected(log);
            setOpen(true);
          }}
        >
          View
        </Button>
      ),
      cellClassName: "text-right",
    },
  ];

  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Documents", href: "/dashboard/documents" },
          { label: "Audit Logs" },
        ]}
      />
      <div className="flex w-full flex-1 flex-col gap-3">
        <DataTable
          columns={columns}
          data={logs}
          keyExtractor={(log) => log.id}
          loading={isLoading}
          emptyMessage="No chat activity recorded yet."
        />

        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-xs text-muted-foreground">
            {total > 0
              ? `Page ${page} of ${pageCount} · ${total} total`
              : "0 results"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft data-icon="inline-start" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </div>

      <AuditLogDetailsDialog
        log={selected}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
