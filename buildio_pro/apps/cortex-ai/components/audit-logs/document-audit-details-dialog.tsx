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
import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { formatDateTime, formatDuration } from "@/api/audit-logs/helpers";
import {
  asDocumentIds,
  type DocumentAuditLog,
} from "@/api/document-audit-logs/types";
import {
  DetailRow,
  JsonBlock,
  TextBlock,
} from "@/components/audit-logs/detail-primitives";
import {
  ACTION_LABELS,
} from "@/components/audit-logs/document-audit-columns";

type Props = {
  log: DocumentAuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DocumentAuditDetailsDialog({ log, open, onOpenChange }: Props) {
  const documentIds = log ? asDocumentIds(log.documentIds) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Document audit log</DialogTitle>
          <DialogDescription>
            {log ? formatDateTime(log.createdAt) : ""}
          </DialogDescription>
        </DialogHeader>

        {log ? (
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <DetailRow
                  label="Action"
                  value={ACTION_LABELS[log.action] ?? log.action}
                />
                <DetailRow label="Status" value={log.status ?? "—"} />
                <DetailRow label="Model" value={log.model ?? "—"} />
                <DetailRow label="Provider" value={log.provider ?? "—"} />
                <DetailRow
                  label="Duration"
                  value={formatDuration(log.durationMs)}
                />
                <DetailRow label="User ID" value={log.userId ?? "—"} />
                <DetailRow label="Extraction ID" value={log.extractionId ?? "—"} />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Documents
                </span>
                {documentIds.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {documentIds.map((id) => (
                      <code
                        key={id}
                        className="rounded-md border bg-muted/40 px-2 py-1 font-mono text-xs break-all"
                      >
                        {id}
                      </code>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
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

              {log.extractionId ? (
                <Link
                  href={`/dashboard/documents?extraction=${log.extractionId}`}
                  className="inline-flex w-fit items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
                >
                  <ExternalLink className="size-4" />
                  Open extraction review &amp; diff
                </Link>
              ) : null}

              <Separator />

              <JsonBlock title="Template snapshot" value={log.templateSnapshot} />
              <TextBlock
                title="Instructions snapshot"
                value={log.instructionsSnapshot}
              />
              <TextBlock title="Raw AI output" value={log.rawAiOutput} />
              <TextBlock title="Final output" value={log.finalOutput} />
              <JsonBlock title="Usage" value={log.usage} />
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
