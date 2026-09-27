"use client";

import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

import {
  useAgentTemplates,
  useCreateAgentTemplate,
  useDeleteAgentTemplate,
  usePermanentlyDeleteAgentTemplate,
  useRestoreAgentTemplate,
  useUpdateAgentTemplate,
} from "@/api/agent-templates/query";
import type {
  AgentInstructionTemplate,
  AgentTemplateInput,
} from "@/api/agent-templates/types";
import { getAgentTemplateColumns } from "@/components/agent-templates/agent-template-columns";
import {
  AgentTemplateDialog,
  agentTemplateFormFromTemplate,
  emptyAgentTemplateForm,
  type AgentTemplateFormState,
} from "@/components/agent-templates/agent-template-dialog";
import { DataTable } from "@/components/data-table";
import { DeleteDialog } from "@/components/documents/delete-dialog";

const PAGE_SIZE = 10;

type ConfirmAction =
  | { kind: "delete"; template: AgentInstructionTemplate }
  | { kind: "permanent"; template: AgentInstructionTemplate };

export function AgentTemplatesSection() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"active" | "deleted">("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AgentInstructionTemplate | null>(null);
  const [form, setForm] = useState<AgentTemplateFormState>(
    emptyAgentTemplateForm,
  );
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

  const { data, isLoading } = useAgentTemplates(page, PAGE_SIZE, status);
  const create = useCreateAgentTemplate();
  const update = useUpdateAgentTemplate();
  const remove = useDeleteAgentTemplate();
  const restore = useRestoreAgentTemplate();
  const permanent = usePermanentlyDeleteAgentTemplate();

  const templates = data?.templates ?? [];
  const pageCount = data?.pageCount || 1;

  const openCreate = () => {
    setError(null);
    setForm(emptyAgentTemplateForm);
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (template: AgentInstructionTemplate) => {
    setError(null);
    setForm(agentTemplateFormFromTemplate(template));
    setEditing(template);
    setDialogOpen(true);
  };
  const closeDialog = () => {
    if (!create.isPending && !update.isPending) setDialogOpen(false);
  };
  const save = async () => {
    const input: AgentTemplateInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      body: form.body.trim(),
    };
    if (!input.name || !input.body) {
      setError("Name and instructions are required.");
      return;
    }
    try {
      if (editing) await update.mutateAsync({ id: editing.id, input });
      else await create.mutateAsync(input);
      setDialogOpen(false);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save template.",
      );
    }
  };

  const columns = getAgentTemplateColumns({
    status,
    onEdit: openEdit,
    onDelete: (template) => setConfirm({ kind: "delete", template }),
    onRestore: (id) => restore.mutate(id),
    onPermanentDelete: (template) =>
      setConfirm({ kind: "permanent", template }),
    deletePending: remove.isPending,
    permanentDeletePending: permanent.isPending,
  });

  const confirmAction = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === "delete")
        await remove.mutateAsync(confirm.template.id);
      else await permanent.mutateAsync(confirm.template.id);
      setConfirm(null);
    } catch {
      // Error surfaced by mutation state; keep dialog open for retry.
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button onClick={openCreate} disabled={status === "deleted"}>
          <Plus data-icon="inline-start" /> New template
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
        data={templates}
        keyExtractor={(template) => template.id}
        loading={isLoading}
        emptyMessage={
          status === "active"
            ? "No instruction templates yet."
            : "Trash is empty."
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
      <AgentTemplateDialog
        open={dialogOpen}
        editing={editing}
        form={form}
        error={error}
        pending={create.isPending || update.isPending}
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
            ? "Delete template permanently?"
            : "Move template to trash?"
        }
        description={
          confirm?.kind === "permanent"
            ? `This permanently deletes "${confirm.template.name}". This cannot be undone.`
            : confirm
              ? `"${confirm.template.name}" moves to trash and can be restored from the Deleted tab.`
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