"use client";

import { DeleteDialog } from "@/components/documents/delete-dialog";
import { RenameDialog } from "@/components/documents/rename-dialog";

export type ActionTarget =
  | { kind: "topic"; id: string; name: string }
  | { kind: "folder"; id: string; name: string };

interface DocumentsDialogsProps {
  renameTarget: ActionTarget | null;
  onRenameClose: () => void;
  renamePending: boolean;
  renameError: string | null;
  onRenameSubmit: (name: string) => void;
  deleteTarget: ActionTarget | null;
  onDeleteClose: () => void;
  deletePending: boolean;
  onDeleteConfirm: () => void;
}

export function DocumentsDialogs({
  renameTarget,
  onRenameClose,
  renamePending,
  renameError,
  onRenameSubmit,
  deleteTarget,
  onDeleteClose,
  deletePending,
  onDeleteConfirm,
}: DocumentsDialogsProps) {
  return (
    <>
      <RenameDialog
        key={
          renameTarget
            ? `${renameTarget.kind}-${renameTarget.id}`
            : "rename-closed"
        }
        open={renameTarget !== null}
        onOpenChange={(open) => !open && onRenameClose()}
        title={
          renameTarget?.kind === "topic" ? "Rename topic" : "Rename folder"
        }
        initialName={renameTarget?.name ?? ""}
        isPending={renamePending}
        error={renameError}
        onSubmit={onRenameSubmit}
      />

      <DeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && onDeleteClose()}
        title={
          deleteTarget?.kind === "topic" ? "Delete topic?" : "Delete folder?"
        }
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed. You can restore it later.`
            : ""
        }
        isPending={deletePending}
        onConfirm={onDeleteConfirm}
      />
    </>
  );
}
