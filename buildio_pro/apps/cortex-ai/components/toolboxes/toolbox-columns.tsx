import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import type { Toolbox } from "@/api/toolboxes/types";
import type { Column } from "@/components/data-table";

type ColumnActions = {
  status: "active" | "deleted";
  onEdit: (toolbox: Toolbox) => void;
  onDelete: (toolbox: Toolbox) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (toolbox: Toolbox) => void;
  deletePending: boolean;
  permanentDeletePending: boolean;
};

export function getToolboxColumns({
  status,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  deletePending,
  permanentDeletePending,
}: ColumnActions): Column<Toolbox>[] {
  return [
    {
      header: "Name",
      accessor: (toolbox) => (
        <div>
          <div className="font-medium">{toolbox.name}</div>
          <div className="max-w-sm truncate text-xs text-muted-foreground">
            {toolbox.description || "No description"}
          </div>
        </div>
      ),
    },
    {
      header: "Tools",
      accessor: (toolbox) => (
        <div className="flex flex-wrap gap-1">
          {(toolbox.toolKeys ?? []).map((key) => (
            <Badge key={key} variant="secondary">
              {key}
            </Badge>
          ))}
          {(toolbox.toolKeys ?? []).length === 0 ? (
            <span className="text-muted-foreground">Empty</span>
          ) : null}
        </div>
      ),
    },
    {
      header: "",
      accessor: (toolbox) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(toolbox)}>
            {status === "active" ? "Edit" : "View"}
          </Button>
          {status === "active" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(toolbox)}
              disabled={deletePending}
            >
              Delete
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRestore(toolbox.id)}
              >
                Restore
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPermanentDelete(toolbox)}
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