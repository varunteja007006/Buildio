"use client";

import { Trash2, Undo2 } from "lucide-react";
import { useState } from "react";

import { useDeleteDocument, useRestoreDocument } from "@/api/documents/query";
import { ActionButton } from "@/components/documents/action-button";
import { DeleteDialog } from "@/components/documents/delete-dialog";

/** Delete (move to trash) action with confirmation, for an active document. */
export function DocumentDeleteButton({
  documentId,
  filename,
}: {
  documentId: string;
  filename: string;
}) {
  const [open, setOpen] = useState(false);
  const deleteDocument = useDeleteDocument();

  return (
    <>
      <ActionButton
        label="Delete document"
        icon={Trash2}
        variant="destructive"
        onClick={() => setOpen(true)}
        disabled={deleteDocument.isPending}
      />
      <DeleteDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete document?"
        description={`"${filename}" will be moved to trash. You can restore it later.`}
        isPending={deleteDocument.isPending}
        onConfirm={() =>
          deleteDocument.mutate(documentId, { onSuccess: () => setOpen(false) })
        }
      />
    </>
  );
}

/** Restore action, for a soft-deleted (trashed) document. */
export function DocumentRestoreButton({ documentId }: { documentId: string }) {
  const restoreDocument = useRestoreDocument();
  return (
    <ActionButton
      label="Restore document"
      icon={Undo2}
      onClick={() => restoreDocument.mutate(documentId)}
      disabled={restoreDocument.isPending}
    />
  );
}

/**
 * Per-document row actions for the data table: delete for active rows,
 * restore for trashed rows. Self-contained so it can live in a static
 * column definition.
 */
export function DocumentRowActions({ document }: { document: {
  id: string;
  filename: string;
  deletedAt: string | null;
} }) {
  return document.deletedAt ? (
    <DocumentRestoreButton documentId={document.id} />
  ) : (
    <DocumentDeleteButton documentId={document.id} filename={document.filename} />
  );
}
