"use client";

import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

import {
  useCreateToolbox,
  useDeleteToolbox,
  usePermanentlyDeleteToolbox,
  useRestoreToolbox,
  useSetToolboxTools,
  useToolboxes,
  useUpdateToolbox,
} from "@/api/toolboxes/query";
import type { Toolbox, ToolboxInput } from "@/api/toolboxes/types";
import { DataTable } from "@/components/data-table";
import { DeleteDialog } from "@/components/documents/delete-dialog";
import { getToolboxColumns } from "@/components/toolboxes/toolbox-columns";
import {
  emptyToolboxForm,
  ToolboxDialog,
  toolboxFormFromToolbox,
  type ToolboxFormState,
} from "@/components/toolboxes/toolbox-dialog";

const PAGE_SIZE = 10;

type ConfirmAction =
  | { kind: "delete"; toolbox: Toolbox }
  | { kind: "permanent"; toolbox: Toolbox };

export function ToolboxesSection() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"active" | "deleted">("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Toolbox | null>(null);
  const [form, setForm] = useState<ToolboxFormState>(emptyToolboxForm);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

  const { data, isLoading } = useToolboxes(page, PAGE_SIZE, status);
  const create = useCreateToolbox();
  const update = useUpdateToolbox();
  const setTools = useSetToolboxTools();
  const remove = useDeleteToolbox();
  const restore = useRestoreToolbox();
  const permanent = usePermanentlyDeleteToolbox();

  const toolboxes = data?.toolboxes ?? [];
  const pageCount = data?.pageCount || 1;

  const openCreate = () => {
    setError(null);
    setForm(emptyToolboxForm);
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (toolbox: Toolbox) => {
    setError(null);
    setForm(toolboxFormFromToolbox(toolbox));
    setEditing(toolbox);
    setDialogOpen(true);
  };
  const closeDialog = () => {
    if (!create.isPending && !update.isPending) setDialogOpen(false);
  };
  const save = async () => {
    const input: ToolboxInput = {
      name: form.name.trim(),
      description: form.description.trim(),
    };
    if (!input.name) {
      setError("Name is required.");
      return;
    }
    try {
      const result = editing
        ? await update.mutateAsync({ id: editing.id, input })
        : await create.mutateAsync(input);
      const toolboxId = editing?.id ?? result.toolbox.id;
      await setTools.mutateAsync({ id: toolboxId, toolKeys: form.toolKeys });
      setDialogOpen(false);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save toolbox.",
      );
    }
  };

  const columns = getToolboxColumns({
    status,
    onEdit: openEdit,
    onDelete: (toolbox) => setConfirm({ kind: "delete", toolbox }),
    onRestore: (id) => restore.mutate(id),
    onPermanentDelete: (toolbox) => setConfirm({ kind: "permanent", toolbox }),
    deletePending: remove.isPending,
    permanentDeletePending: permanent.isPending,
  });

  const confirmAction = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === "delete")
        await remove.mutateAsync(confirm.toolbox.id);
      else await permanent.mutateAsync(confirm.toolbox.id);
      setConfirm(null);
    } catch {
      // Error surfaced by mutation state; keep dialog open for retry.
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button onClick={openCreate} disabled={status === "deleted"}>
          <Plus data-icon="inline-start" /> New toolbox
        </Button>
        <div className="flex gap-2">
          <Button
            variant={status === "active" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              setStatus("active");
              setPage(1);
            }}
          >
            Active
          </Button>
          <Button
            variant={status === "deleted" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              setStatus("deleted");
              setPage(1);
            }}
          >
            Deleted
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={toolboxes}
        keyExtractor={(toolbox) => toolbox.id}
        loading={isLoading}
        emptyMessage={
          status === "active" ? "No toolboxes yet." : "Trash is empty."
        }
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
      <ToolboxDialog
        open={dialogOpen}
        editing={editing}
        form={form}
        error={error}
        pending={create.isPending || update.isPending || setTools.isPending}
        onChange={(update) => setForm((current) => ({ ...current, ...update }))}
        onSave={save}
        onClose={closeDialog}
      />
      <DeleteDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title={
          confirm?.kind === "permanent"
            ? "Delete toolbox permanently?"
            : "Move toolbox to trash?"
        }
        description={
          confirm?.kind === "permanent"
            ? `This permanently deletes "${confirm.toolbox.name}". This cannot be undone.`
            : confirm
              ? `"${confirm.toolbox.name}" moves to trash and can be restored from the Deleted tab.`
              : ""
        }
        isPending={
          confirm?.kind === "permanent" ? permanent.isPending : remove.isPending
        }
        onConfirm={confirmAction}
      />
    </>
  );
}