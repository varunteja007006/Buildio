"use client";

import type { Connection } from "@/api/connections/types";
import { DeleteDialog } from "@/components/documents/delete-dialog";

export type ConnectionConfirmAction =
  | { kind: "delete"; connection: Connection }
  | { kind: "permanent"; connection: Connection };

type ConnectionDeleteDialogProps = {
  confirm: ConnectionConfirmAction | null;
  onClose: () => void;
  deletePending: boolean;
  permanentDeletePending: boolean;
  onConfirm: (action: ConnectionConfirmAction) => void;
};

export function ConnectionDeleteDialog({
  confirm,
  onClose,
  deletePending,
  permanentDeletePending,
  onConfirm,
}: ConnectionDeleteDialogProps) {
  const permanent = confirm?.kind === "permanent";
  return (
    <DeleteDialog
      open={confirm !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={
        permanent
          ? "Delete connection permanently?"
          : "Move connection to trash?"
      }
      description={
        permanent
          ? `This permanently deletes "${confirm?.connection.name}". This cannot be undone.`
          : confirm
            ? `"${confirm.connection.name}" moves to trash and can be restored from the Deleted tab.`
            : ""
      }
      isPending={permanent ? permanentDeletePending : deletePending}
      onConfirm={() => confirm && onConfirm(confirm)}
    />
  );
}