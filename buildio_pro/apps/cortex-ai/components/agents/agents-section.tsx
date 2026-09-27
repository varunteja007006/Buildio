"use client";

import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAgentTemplates } from "@/api/agent-templates/query";
import {
  useAgent,
  useAgents,
  useCreateAgent,
  useDeleteAgent,
  usePermanentlyDeleteAgent,
  useRestoreAgent,
  useSetAgentTools,
  useSetAgentTopics,
  useUpdateAgent,
} from "@/api/agents/query";
import type { Agent, AgentInput } from "@/api/agents/types";
import { getAgentColumns } from "@/components/agents/agent-columns";
import {
  AgentDialog,
  agentFormFromDetail,
  emptyAgentForm,
  type AgentFormState,
} from "@/components/agents/agent-dialog";
import { DataTable } from "@/components/data-table";
import { DeleteDialog } from "@/components/documents/delete-dialog";

const PAGE_SIZE = 10;

type ConfirmAction =
  | { kind: "delete"; agent: Agent }
  | { kind: "permanent"; agent: Agent };

export function AgentsSection({
  onOpenAgent,
}: {
  onOpenAgent: (id: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"active" | "deleted">("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AgentFormState>(emptyAgentForm);
  const [error, setError] = useState<string | null>(null);
  const [droppedNote, setDroppedNote] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

  const { data, isLoading } = useAgents(page, PAGE_SIZE, status);
  const { data: templatesData } = useAgentTemplates(1, 100);
  const { data: detail } = useAgent(editingId ?? "");
  const create = useCreateAgent();
  const update = useUpdateAgent();
  const setTopics = useSetAgentTopics();
  const setTools = useSetAgentTools();
  const remove = useDeleteAgent();
  const restore = useRestoreAgent();
  const permanent = usePermanentlyDeleteAgent();

  const agents = data?.agents ?? [];
  const pageCount = data?.pageCount || 1;
  const templates = (templatesData?.templates ?? []).map((template) => ({
    id: template.id,
    name: template.name,
    body: template.body,
  }));

  // Hydrate the edit form once the agent detail (topics/tools) loads.
  const hydratedRef = useRef("");
  useEffect(() => {
    if (!editingId || !dialogOpen || !detail) return;
    if (hydratedRef.current === editingId) return;
    hydratedRef.current = editingId;
    setForm(agentFormFromDetail(detail));
  }, [detail, editingId, dialogOpen]);

  const openCreate = () => {
    setError(null);
    setDroppedNote(null);
    setForm(emptyAgentForm);
    setEditingId(null);
    hydratedRef.current = "";
    setDialogOpen(true);
  };

  const openEdit = (agent: Agent) => {
    setError(null);
    setDroppedNote(null);
    setForm(emptyAgentForm);
    setEditingId(agent.id);
    hydratedRef.current = "";
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (create.isPending || update.isPending) return;
    setDialogOpen(false);
    setEditingId(null);
  };

  const save = async () => {
    const input: AgentInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      instructions: form.instructions.trim(),
    };
    if (!input.name) {
      setError("Name is required.");
      return;
    }
    try {
      const result = editingId
        ? await update.mutateAsync({ id: editingId, input })
        : await create.mutateAsync(input);
      const agentId = editingId ?? result.agent.id;
      await setTopics.mutateAsync({ id: agentId, topicIds: form.topicIds });
      await setTools.mutateAsync({
        id: agentId,
        input: { toolKeys: form.toolKeys, toolboxIds: form.toolboxIds },
      });
      setDialogOpen(false);
      setEditingId(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save agent.");
    }
  };

  const columns = getAgentColumns({
    status,
    onOpen: (agent) => onOpenAgent(agent.id),
    onEdit: openEdit,
    onDelete: (agent) => setConfirm({ kind: "delete", agent }),
    onRestore: (id) => restore.mutate(id),
    onPermanentDelete: (agent) => setConfirm({ kind: "permanent", agent }),
    deletePending: remove.isPending,
    permanentDeletePending: permanent.isPending,
  });

  const confirmAction = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === "delete") await remove.mutateAsync(confirm.agent.id);
      else await permanent.mutateAsync(confirm.agent.id);
      setConfirm(null);
    } catch {
      // Error surfaced by mutation state; keep dialog open for retry.
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button onClick={openCreate} disabled={status === "deleted"}>
          <Plus data-icon="inline-start" /> New agent
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
        data={agents}
        keyExtractor={(agent) => agent.id}
        loading={isLoading}
        emptyMessage={status === "active" ? "No agents yet." : "Trash is empty."}
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
      <AgentDialog
        open={dialogOpen}
        editingName={editingId ? (detail?.agent.name ?? null) : null}
        templates={templates}
        form={form}
        error={error}
        pending={
          create.isPending ||
          update.isPending ||
          setTopics.isPending ||
          setTools.isPending
        }
        onChange={(update) =>
          setForm((current) => ({ ...current, ...update }))
        }
        onApplyTemplate={(templateId) => {
          const template = templates.find((entry) => entry.id === templateId);
          if (template)
            setForm((current) => ({ ...current, instructions: template.body }));
        }}
        onToolsDropped={(dropped) => setDroppedNote(dropped.join(", "))}
        onSave={save}
        onClose={closeDialog}
      />
      {droppedNote ? (
        <p className="text-xs text-muted-foreground">
          Removed from individual selection (included in toolbox):{" "}
          {droppedNote}
        </p>
      ) : null}
      <DeleteDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title={
          confirm?.kind === "permanent"
            ? "Delete agent permanently?"
            : "Move agent to trash?"
        }
        description={
          confirm?.kind === "permanent"
            ? `This permanently deletes "${confirm.agent.name}". This cannot be undone.`
            : confirm
              ? `"${confirm.agent.name}" moves to trash and can be restored from the Deleted tab.`
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