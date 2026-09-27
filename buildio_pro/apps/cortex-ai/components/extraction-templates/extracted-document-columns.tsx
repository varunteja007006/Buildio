"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Loader2 } from "lucide-react";

import type {
  ExtractedDocumentRow,
  ExtractionStatus,
} from "@/api/extractions/types";
import type { Column } from "@/components/data-table";

const LABELS: Record<ExtractionStatus, string> = {
  pending: "Extracting…",
  processing: "Extracting…",
  completed: "Extracted",
  failed: "Extraction failed",
};

export function getExtractedDocumentColumns(): Column<ExtractedDocumentRow>[] {
  return [
    {
      header: "Document",
      accessor: (row) => (
        <div className="max-w-sm truncate font-medium">{row.filename}</div>
      ),
    },
    {
      header: "Template",
      accessor: (row) =>
        row.templateName ? (
          <Badge variant="secondary">{row.templateName}</Badge>
        ) : (
          <span className="text-muted-foreground">Deleted template</span>
        ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <span className="flex items-center gap-1.5 text-sm">
          {(row.status === "pending" || row.status === "processing") && (
            <Loader2 className="size-3 animate-spin" />
          )}
          {LABELS[row.status]}
        </span>
      ),
    },
    {
      header: "Approved",
      accessor: (row) =>
        row.approved ? (
          <Badge variant="secondary">Yes</Badge>
        ) : (
          <Badge variant="outline">No</Badge>
        ),
      headClassName: "hidden sm:table-cell",
      cellClassName: "hidden sm:table-cell",
    },
    {
      header: "Updated",
      accessor: (row) => (
        <span className="text-muted-foreground">
          {new Date(row.updatedAt).toLocaleDateString()}
        </span>
      ),
      headClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
    },
  ];
}