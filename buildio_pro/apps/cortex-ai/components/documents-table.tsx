"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Loader2, RefreshCw, Scan, Brain } from "lucide-react";

import { formatDate, truncateHash } from "@/api/documents/helpers";
import { useDocuments, useScanDocuments } from "@/api/documents/query";
import type { Document } from "@/api/documents/types";
import { useIngestDocuments } from "@/api/ingest/query";
import { DataTable, type Column } from "@/components/data-table";

const columns: Column<Document>[] = [
  {
    header: "Filename",
    accessor: (doc) => (
      <span className="font-medium">{doc.filename}</span>
    ),
  },
  {
    header: "Path",
    headClassName: "hidden md:table-cell",
    cellClassName: "hidden max-w-[240px] truncate text-muted-foreground md:table-cell",
    accessor: (doc) => doc.filepath,
  },
  {
    header: "Hash",
    headClassName: "hidden sm:table-cell",
    cellClassName:
      "hidden font-mono text-xs text-muted-foreground sm:table-cell",
    accessor: (doc) => truncateHash(doc.fileHash),
  },
  {
    header: "Status",
    accessor: (doc) =>
      doc.ingested ? (
        <Badge variant="default">Ingested</Badge>
      ) : (
        <Badge variant="secondary">Pending</Badge>
      ),
  },
  {
    header: "Created",
    headClassName: "hidden lg:table-cell",
    cellClassName: "hidden text-muted-foreground lg:table-cell",
    accessor: (doc) => formatDate(doc.createdAt),
  },
];

export function DocumentsTable() {
  const {
    data: documentsResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useDocuments();

  const documents = documentsResponse?.documents ?? [];
  const scanMutation = useScanDocuments();
  const ingestMutation = useIngestDocuments();

  const pendingDocs =
    documents.filter((doc) => !doc.ingested).length;

  const handleScan = () => {
    scanMutation.mutate(undefined, {
      onSuccess: (data: import("@/api/documents/types").ScanResponse) => {
        if (!data.success) {
          // The error toast/feedback can be handled at a higher level
          console.error("Scan failed:", data.error);
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tracked Documents</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${documents.length} document${documents.length === 1 ? "" : "s"} tracked`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {scanMutation.isSuccess && scanMutation.data?.success && (
            <span className="text-sm text-muted-foreground">
              Scan complete — found {scanMutation.data.scanned} file(s)
            </span>
          )}
          {scanMutation.isError && (
            <span className="text-sm text-destructive">
              {scanMutation.error?.message ?? "Scan failed"}
            </span>
          )}
          {ingestMutation.isSuccess && ingestMutation.data?.success && (
            <span className="text-sm text-muted-foreground">
              Ingested {ingestMutation.data.ingested} file(s)
              {ingestMutation.data.failed &&
                ingestMutation.data.failed > 0 &&
                `, ${ingestMutation.data.failed} failed`}
            </span>
          )}
          {ingestMutation.isError && (
            <span className="text-sm text-destructive">
              {ingestMutation.error?.message ?? "Ingest failed"}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
          >
            <RefreshCw
              className={`mr-1 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={handleScan}
            disabled={scanMutation.isPending}
            size="sm"
          >
            {scanMutation.isPending ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Scanning…
              </>
            ) : (
              <>
                <Scan className="mr-1 h-4 w-4" />
                Scan Docs
              </>
            )}
          </Button>
          <Button
            onClick={() => ingestMutation.mutate()}
            disabled={ingestMutation.isPending || pendingDocs === 0}
            size="sm"
          >
            {ingestMutation.isPending ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Ingesting…
              </>
            ) : (
              <>
                <Brain className="mr-1 h-4 w-4" />
                Ingest{ingestMutation.isSuccess ? "ed" : " All"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={documents}
        keyExtractor={(doc) => doc.id}
        loading={isLoading}
        emptyMessage={
          <>
            No documents tracked yet. Click <strong>Scan Docs</strong> to scan
            the <code>docs/</code> folder.
          </>
        }
      />
    </div>
  );
}
