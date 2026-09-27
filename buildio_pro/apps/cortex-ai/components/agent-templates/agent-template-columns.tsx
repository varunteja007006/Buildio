import { Button } from "@workspace/ui/components/button";

import type { AgentInstructionTemplate } from "@/api/agent-templates/types";
import type { Column } from "@/components/data-table";

type ColumnActions = {
  status: "active" | "deleted";
  onEdit: (template: AgentInstructionTemplate) => void;
  onDelete: (template: AgentInstructionTemplate) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (template: AgentInstructionTemplate) => void;
  deletePending: boolean;
  permanentDeletePending: boolean;
};

export function getAgentTemplateColumns({
  status,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  deletePending,
  permanentDeletePending,
}: ColumnActions): Column<AgentInstructionTemplate>[] {
  return [
    {
      header: "Name",
      accessor: (template) => (
        <div>
          <div className="font-medium">{template.name}</div>
          <div className="max-w-sm truncate text-xs text-muted-foreground">
            {template.description || "No description"}
          </div>
        </div>
      ),
    },
    {
      header: "Preview",
      accessor: (template) => (
        <span className="line-clamp-2 max-w-md text-xs text-muted-foreground">
          {template.body}
        </span>
      ),
      headClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
    },
    {
      header: "",
      accessor: (template) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(template)}>
            {status === "active" ? "Edit" : "View"}
          </Button>
          {status === "active" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(template)}
              disabled={deletePending}
            >
              Delete
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRestore(template.id)}
              >
                Restore
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPermanentDelete(template)}
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