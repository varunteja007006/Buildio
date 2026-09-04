"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import {
  ArchiveX,
  Download,
  Eye,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  useStatementDelete,
  useStatementDeleteSuperseded,
  useStatementDownload,
} from "@/hooks";

import type { StatementRow } from "./statements-table";

export function StatementRowActions({
  statement,
  onView,
  onExtract,
}: {
  statement: StatementRow;
  onView: (statement: StatementRow) => void;
  onExtract: (statement: StatementRow) => void;
}) {
  const purgeMutation = useStatementDeleteSuperseded();
  const deleteMutation = useStatementDelete();
  const downloadMutation = useStatementDownload();

  const handleDownload = () => {
    downloadMutation.mutate(statement.id, {
      onSuccess: ({ downloadUrl }) => {
        window.open(downloadUrl, "_blank", "noopener,noreferrer");
      },
    });
  };

  return (
    <div className="flex justify-end gap-2">
      {typeof statement.processedTransactionsCount === "number" &&
        statement.processedTransactionsCount > 0 && (
          <Button
            variant="outline"
            size="icon"
            title="View extracted transactions"
            onClick={() => onView(statement)}
          >
            <Eye className="size-4" />
          </Button>
        )}

      <Button
        variant="outline"
        size="icon"
        title="Extract transactions with AI"
        disabled={statement.status === "processing" || statement.status === "pending"}
        onClick={() => onExtract(statement)}
      >
        <Sparkles className="size-4" />
      </Button>

      {typeof statement.supersededTransactionsCount === "number" &&
        statement.supersededTransactionsCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                title="Delete superseded transactions from older extractions"
              >
                <ArchiveX className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete old extraction versions?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete{" "}
                  {statement.supersededTransactionsCount} superseded{" "}
                  {statement.supersededTransactionsCount === 1
                    ? "transaction"
                    : "transactions"}{" "}
                  from previous extractions of {statement.originalFilename}. The
                  current extraction is kept. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  disabled={purgeMutation.isPending}
                  onClick={() =>
                    purgeMutation.mutate({
                      uploadId: statement.id,
                    })
                  }
                >
                  Delete old versions
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

      <Button
        variant="outline"
        size="icon"
        disabled={downloadMutation.isPending}
        onClick={handleDownload}
      >
        <Download className="size-4" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Trash2 className="size-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the uploaded statement file. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteMutation.mutate({
                  uploadId: statement.id,
                })
              }
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
