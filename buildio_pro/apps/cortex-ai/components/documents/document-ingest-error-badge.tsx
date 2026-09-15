"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { AlertTriangle, Loader2, RotateCw } from "lucide-react";
import { useState } from "react";

import { useIngestDocuments } from "@/api/ingest/query";

/**
 * Persistent ingestion-failure indicator. Click to open a popover with the
 * full error (stored server-side on the document row) and a one-click
 * Retry ingest action.
 */
export function DocumentIngestErrorBadge({
  documentId,
  filename,
  error,
}: {
  documentId: string;
  filename: string;
  error: string;
}) {
  const [open, setOpen] = useState(false);
  const ingestDocuments = useIngestDocuments();

  const retry = () => {
    ingestDocuments.mutate(
      { documentIds: [documentId] },
      { onSettled: () => setOpen(false) },
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Badge
          variant="outline"
          className="cursor-pointer gap-1 border-destructive/40 text-xs text-destructive"
        >
          <AlertTriangle className="size-3" />
          Ingest failed
        </Badge>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <AlertTriangle className="size-4 text-destructive" />
            Ingestion failed
          </div>
          <p className="truncate text-xs text-muted-foreground" title={filename}>
            {filename}
          </p>
          <p className="rounded-md border bg-muted/40 p-2 text-xs break-words whitespace-pre-wrap">
            {error}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-fit"
            disabled={ingestDocuments.isPending}
            onClick={retry}
          >
            {ingestDocuments.isPending ? (
              <Loader2 data-icon="inline-start" className="size-4 animate-spin" />
            ) : (
              <RotateCw data-icon="inline-start" className="size-4" />
            )}
            Retry ingest
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
