"use client";

import type { inferRouterOutputs } from "@trpc/server";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { FileText, Loader2 } from "lucide-react";

import type { AppRouter } from "@/lib/trpc";

import {
  documentTypeIcons,
  documentTypeLabels,
  formatDate,
  formatFileSize,
  statusVariants,
} from "./constants";
import { StatementFilenameCell } from "./statement-filename-cell";
import { StatementRowActions } from "./statement-row-actions";

export type StatementRow =
  inferRouterOutputs<AppRouter>["statement"]["listStatements"]["data"][number];

interface StatementsTableProps {
  statements: StatementRow[];
  isLoading: boolean;
  onView: (statement: StatementRow) => void;
  onExtract: (statement: StatementRow) => void;
}

export function StatementsTable({
  statements,
  isLoading,
  onView,
  onExtract,
}: StatementsTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Filename</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                Loading statements...
              </TableCell>
            </TableRow>
          ) : statements.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No statements uploaded yet
              </TableCell>
            </TableRow>
          ) : (
            statements.map((statement) => {
              const Icon =
                documentTypeIcons[statement.documentType] ?? FileText;
              return (
                <TableRow key={statement.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-muted-foreground" />
                      <span className="font-medium">
                        {documentTypeLabels[statement.documentType] ??
                          statement.documentType}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatementFilenameCell
                      uploadId={statement.id}
                      filename={statement.originalFilename}
                    />
                  </TableCell>
                  <TableCell>{formatFileSize(statement.fileSize)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            statusVariants[statement.status] ?? "outline"
                          }
                          className="capitalize"
                        >
                          {statement.status}
                        </Badge>
                        {typeof statement.extractionVersion === "number" &&
                          statement.extractionVersion > 0 && (
                            <Badge variant="outline">
                              v{statement.extractionVersion}
                            </Badge>
                          )}
                        {statement.status === "processing" && (
                          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                        )}
                        {typeof statement.processedTransactionsCount ===
                          "number" &&
                          statement.processedTransactionsCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {statement.processedTransactionsCount}{" "}
                              {statement.processedTransactionsCount === 1
                                ? "transaction"
                                : "transactions"}
                            </span>
                          )}
                      </div>
                      {typeof statement.supersededTransactionsCount ===
                        "number" &&
                        statement.supersededTransactionsCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {statement.supersededTransactionsCount} superseded{" "}
                            {statement.supersededTransactionsCount === 1
                              ? "transaction"
                              : "transactions"}{" "}
                            from older extractions
                          </span>
                        )}
                      {statement.status === "failed" &&
                        statement.processingError && (
                          <span className="max-w-56 truncate text-xs text-destructive">
                            {statement.processingError}
                          </span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(statement.uploadedAt)}</TableCell>
                  <TableCell className="text-right">
                    <StatementRowActions
                      statement={statement}
                      onView={onView}
                      onExtract={onExtract}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
