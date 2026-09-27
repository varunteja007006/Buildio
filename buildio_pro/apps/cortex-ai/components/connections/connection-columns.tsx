import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Loader2 } from "lucide-react";

import type { Connection } from "@/api/connections/types";
import type { Column } from "@/components/data-table";

type ColumnActions = {
  status: "active" | "deleted";
  onEdit: (connection: Connection) => void;
  onCheck: (connection: Connection) => void;
  onDelete: (connection: Connection) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (connection: Connection) => void;
  checkingId: string | null;
  deletePending: boolean;
  permanentDeletePending: boolean;
};

function StatusBadge({ status }: { status: string }) {
  if (status === "connected")
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        Connected
      </Badge>
    );
  if (status === "failed") return <Badge variant="destructive">Failed</Badge>;
  return <Badge variant="outline">Unverified</Badge>;
}

export function getConnectionColumns({
  status,
  onEdit,
  onCheck,
  onDelete,
  onRestore,
  onPermanentDelete,
  checkingId,
  deletePending,
  permanentDeletePending,
}: ColumnActions): Column<Connection>[] {
  return [
    {
      header: "Name",
      accessor: (connection) => (
        <div>
          <div className="font-medium">{connection.name}</div>
          <div className="max-w-sm truncate text-xs text-muted-foreground">
            {connection.target}
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (connection) => (
        <Badge variant="secondary" className="capitalize">
          {connection.type}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessor: (connection) => <StatusBadge status={connection.status} />,
    },
    {
      header: "Last checked",
      accessor: (connection) => (
        <span className="text-muted-foreground">
          {connection.lastCheckedAt
            ? new Date(connection.lastCheckedAt).toLocaleString()
            : "Never"}
        </span>
      ),
      headClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
    },
    {
      header: "",
      accessor: (connection) => (
        <div className="flex justify-end gap-2">
          {status === "active" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCheck(connection)}
                disabled={checkingId !== null}
              >
                {checkingId === connection.id && (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                )}
                {checkingId === connection.id ? "Checking…" : "Check"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(connection)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(connection)}
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
                onClick={() => onRestore(connection.id)}
              >
                Restore
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPermanentDelete(connection)}
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
