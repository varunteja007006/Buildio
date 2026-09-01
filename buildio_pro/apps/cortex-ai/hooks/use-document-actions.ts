"use client";

import { useDeleteFolder, useRenameFolder } from "@/api/folders/query";
import { useDeleteTopic, useRenameTopic } from "@/api/topics/query";
import type { ActionTarget } from "@/components/documents/documents-dialogs";

interface UseDocumentActionsOptions {
  renameTarget: ActionTarget | null;
  deleteTarget: ActionTarget | null;
  onRenameClose: () => void;
  onDeleteClose: () => void;
}

export function useDocumentActions({
  renameTarget,
  deleteTarget,
  onRenameClose,
  onDeleteClose,
}: UseDocumentActionsOptions) {
  const renameTopic = useRenameTopic();
  const deleteTopic = useDeleteTopic();
  const renameFolder = useRenameFolder();
  const deleteFolder = useDeleteFolder();

  const renamePending =
    renameTarget?.kind === "topic"
      ? renameTopic.isPending
      : renameTarget?.kind === "folder"
        ? renameFolder.isPending
        : false;

  const renameError =
    renameTarget?.kind === "topic"
      ? (renameTopic.error?.message ?? null)
      : renameTarget?.kind === "folder"
        ? (renameFolder.error?.message ?? null)
        : null;

  const handleRenameSubmit = (name: string) => {
    if (!renameTarget) return;
    if (renameTarget.kind === "topic") {
      renameTopic.mutate(
        { id: renameTarget.id, input: { name } },
        { onSuccess: onRenameClose },
      );
    } else {
      renameFolder.mutate(
        { id: renameTarget.id, input: { name } },
        { onSuccess: onRenameClose },
      );
    }
  };

  const deletePending =
    deleteTarget?.kind === "topic"
      ? deleteTopic.isPending
      : deleteTarget?.kind === "folder"
        ? deleteFolder.isPending
        : false;

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "topic") {
      deleteTopic.mutate(deleteTarget.id, { onSuccess: onDeleteClose });
    } else {
      deleteFolder.mutate(deleteTarget.id, { onSuccess: onDeleteClose });
    }
  };

  return {
    renamePending,
    renameError,
    handleRenameSubmit,
    deletePending,
    handleDeleteConfirm,
  };
}
