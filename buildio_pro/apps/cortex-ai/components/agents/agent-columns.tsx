import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import type { Agent } from "@/api/agents/types";
import type { Column } from "@/components/data-table";

type ColumnActions = {
  status: "active" | "deleted";
  onOpen: (agent: Agent) => void;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (agent: Agent) => void;
  deletePending: boolean;
  permanentDeletePending: boolean;
};

const STATUS_LABELS: Record<Agent["status"], string> = {
  draft: "Draft",
  deployed: "Deployed",
  undeployed: "Undeployed",
};

export function getAgentColumns({
  status,
  onOpen,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  deletePending,
  permanentDeletePending,
}: ColumnActions): Column<Agent>[] {
  return [
    {
      header: "Name",
      accessor: (agent) => (
        <div>
          <div className="font-medium">{agent.name}</div>
          <div className="max-w-sm truncate text-xs text-muted-foreground">
            {agent.description || "No description"}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (agent) => (
        <Badge
          variant={
            agent.status === "deployed"
              ? "default"
              : agent.status === "draft"
                ? "secondary"
                : "outline"
          }
        >
          {STATUS_LABELS[agent.status]}
        </Badge>
      ),
      headClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
    },
    {
      header: "Updated",
      accessor: (agent) => (
        <span className="text-muted-foreground">
          {new Date(agent.updatedAt).toLocaleDateString()}
        </span>
      ),
      headClassName: "hidden sm:table-cell",
      cellClassName: "hidden sm:table-cell",
    },
    {
      header: "",
      accessor: (agent) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpen(agent)}>
            Open
          </Button>
          {status === "active" ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => onEdit(agent)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(agent)}
                disabled={deletePending}
              >
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRestore(agent.id)}
              >
                Restore
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPermanentDelete(agent)}
                disabled={permanentDeletePending}
              >
                Delete permanently
              </Button>
            </>
          )}
        </div>
      ),
      cellClassName: "text-right",
    },
  ];
}