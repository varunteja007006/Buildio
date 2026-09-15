"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { useExtractionStatuses } from "@/api/extractions/query";
import type { ExtractionStatus } from "@/api/extractions/types";
import { ExtractionReviewDialog } from "@/components/documents/extraction-review-dialog";

const LABELS: Record<ExtractionStatus, string> = {
  pending: "Extracting…",
  processing: "Extracting…",
  completed: "Extracted",
  failed: "Extraction failed",
};

const VARIANTS: Record<
  ExtractionStatus,
  "secondary" | "outline" | "destructive"
> = {
  pending: "secondary",
  processing: "secondary",
  completed: "outline",
  failed: "destructive",
};

/**
 * Extraction status badge for a document — click to open the review dialog.
 * Shares the workspace-wide extraction status query (which polls while jobs
 * run), so no extra network requests are made per row.
 */
export function DocumentExtractionBadge({ documentId }: { documentId: string }) {
  const { data } = useExtractionStatuses();
  const [open, setOpen] = useState(false);
  const row = data?.extractions.find((e) => e.documentId === documentId);
  if (!row) return null;

  const running = row.status === "pending" || row.status === "processing";

  return (
    <>
      <button
        type="button"
        className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        onClick={() => setOpen(true)}
        aria-label="Review extraction"
      >
        <Badge variant={VARIANTS[row.status]} className="gap-1 text-xs">
          {running && <Loader2 className="size-3 animate-spin" />}
          {LABELS[row.status]}
        </Badge>
      </button>
      {open && (
        <ExtractionReviewDialog
          extractionId={row.id}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}
