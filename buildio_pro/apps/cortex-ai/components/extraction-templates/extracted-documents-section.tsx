"use client";

import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

import { useExtractedDocuments } from "@/api/extractions/query";
import { DataTable } from "@/components/data-table";
import { ExtractionReviewDialog } from "@/components/documents/extraction-review-dialog";
import { getExtractedDocumentColumns } from "@/components/extraction-templates/extracted-document-columns";

const PAGE_SIZE = 10;

export function ExtractedDocumentsSection() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useExtractedDocuments(page, PAGE_SIZE);
  const rows = data?.extractions ?? [];
  const pageCount = data?.pageCount || 1;
  const [extractionParam, setExtractionParam] = useQueryState(
    "extraction",
    parseAsString,
  );

  return (
    <>
      <DataTable
        columns={getExtractedDocumentColumns()}
        data={rows}
        keyExtractor={(row) => row.id}
        loading={isLoading}
        emptyMessage="No extracted documents yet. Run a template from the Documents page."
        onRowClick={(row) => void setExtractionParam(row.id)}
      />
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-xs text-muted-foreground">
          {data?.total
            ? `Page ${page} of ${pageCount} · ${data.total} total`
            : "0 results"}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
          >
            <ChevronLeft data-icon="inline-start" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => setPage((value) => value + 1)}
          >
            Next <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
      {extractionParam && (
        <ExtractionReviewDialog
          extractionId={extractionParam}
          open
          onOpenChange={(next) => {
            if (!next) void setExtractionParam(null);
          }}
        />
      )}
    </>
  );
}