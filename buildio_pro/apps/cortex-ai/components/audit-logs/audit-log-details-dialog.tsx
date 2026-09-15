"use client";

import { Badge } from "@workspace/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";

import {
  formatDateTime,
  formatMs,
  formatNumber,
} from "@/api/audit-logs/helpers";
import type { ChatAuditLog } from "@/api/audit-logs/types";
import {
  DetailRow,
  JsonBlock,
  TextBlock,
} from "@/components/audit-logs/detail-primitives";
import { RiskBadge } from "@/components/audit-logs/risk-badge";

type Props = {
  log: ChatAuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AuditLogDetailsDialog({ log, open, onOpenChange }: Props) {
  const toolCallCount = Array.isArray(log?.toolCalls)
    ? log.toolCalls.length
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chat audit log</DialogTitle>
          <DialogDescription>
            {log ? formatDateTime(log.createdAt) : ""}
          </DialogDescription>
        </DialogHeader>

        {log ? (
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <DetailRow label="Model" value={log.model ?? "—"} />
                <DetailRow label="Provider" value={log.provider ?? "—"} />
                <DetailRow
                  label="Finish reason"
                  value={log.finishReason ?? "—"}
                />
                <DetailRow
                  label="Raw finish reason"
                  value={log.rawFinishReason ?? "—"}
                />
                <DetailRow
                  label="Tokens (in / out / total)"
                  value={`${formatNumber(log.inputTokens)} / ${formatNumber(
                    log.outputTokens,
                  )} / ${formatNumber(log.totalTokens)}`}
                />
                <DetailRow
                  label="Cache (read / write)"
                  value={`${formatNumber(log.cacheReadTokens)} / ${formatNumber(
                    log.cacheWriteTokens,
                  )}`}
                />
                <DetailRow
                  label="Reasoning / text tokens"
                  value={`${formatNumber(
                    log.reasoningTokens,
                  )} / ${formatNumber(log.textTokens)}`}
                />
                <DetailRow
                  label="TTFT"
                  value={formatMs(log.timeToFirstOutputMs)}
                />
                <DetailRow
                  label="Step / response time"
                  value={`${formatMs(log.stepTimeMs)} / ${formatMs(
                    log.responseTimeMs,
                  )}`}
                />
                <DetailRow label="Tool calls" value={String(toolCallCount)} />
                <DetailRow label="Thread ID" value={log.threadId ?? "—"} />
                <DetailRow label="User ID" value={log.userId} />
              </div>

              {log.error ? (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Error
                  </span>
                  <Badge
                    variant="destructive"
                    className="h-auto w-fit py-1 whitespace-normal break-words"
                  >
                    {log.error}
                  </Badge>
                </div>
              ) : null}

              <Separator />

              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Guardrail
                  </span>
                  <RiskBadge
                    severity={log.guardrailSeverity}
                    flagged={log.guardrailFlagged}
                  />
                  {log.guardrailBlocked ? (
                    <Badge variant="destructive">blocked</Badge>
                  ) : null}
                  {!log.guardrailChecked ? (
                    <Badge variant="outline">not checked</Badge>
                  ) : null}
                </div>
                <DetailRow
                  label="Guardrail model"
                  value={log.guardrailModel ?? "—"}
                />
                <DetailRow
                  label="Categories"
                  value={
                    Array.isArray(log.guardrailCategories) &&
                    log.guardrailCategories.length > 0
                      ? log.guardrailCategories.join(", ")
                      : "—"
                  }
                />
                <DetailRow
                  label="Reason"
                  value={log.guardrailReason ?? "—"}
                />
              </div>

              <Separator />

              <TextBlock title="User query" value={log.userQuery} />
              <TextBlock title="Response" value={log.responseText} />

              <Separator />

              <JsonBlock title="Usage" value={log.usage} />
              <JsonBlock title="Performance" value={log.performance} />
              <JsonBlock title="Tool calls" value={log.toolCalls} />
              <JsonBlock title="Tool results" value={log.toolResults} />
              <JsonBlock title="Warnings" value={log.warnings} />
              <JsonBlock title="Raw request" value={log.rawRequest} />
              <JsonBlock title="Raw response" value={log.rawResponse} />
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
