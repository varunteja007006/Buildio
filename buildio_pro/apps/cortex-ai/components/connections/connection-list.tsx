"use client";

import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import type { Connection, ConnectionPage } from "@/api/connections/types";
import type { Column } from "@/components/data-table";
import { DataTable } from "@/components/data-table";

type ConnectionListProps = {
  data: ConnectionPage | undefined;
  connections: Connection[];
  columns: Column<Connection>[];
  isLoading: boolean;
  page: number;
  status: "active" | "deleted";
  onStatusChange: (status: "active" | "deleted") => void;
  onPageChange: (page: number) => void;
  onNew: () => void;
  onRowClick: (connection: Connection) => void;
};

export function ConnectionList({
  data,
  connections,
  columns,
  isLoading,
  page,
  status,
  onStatusChange,
  onPageChange,
  onNew,
  onRowClick,
}: ConnectionListProps) {
  const pageCount = data?.pageCount || 1;
  return (
    <div className="flex w-full flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Database connections</h1>
          <p className="text-sm text-muted-foreground">
            Connect external databases for your agents to query.
          </p>
        </div>
        <Button onClick={onNew} disabled={status === "deleted"}>
          <Plus data-icon="inline-start" /> New connection
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          variant={status === "active" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onStatusChange("active")}
        >
          Active
        </Button>
        <Button
          variant={status === "deleted" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onStatusChange("deleted")}
        >
          Deleted
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={connections}
        keyExtractor={(connection) => connection.id}
        loading={isLoading}
        onRowClick={onRowClick}
        emptyMessage={
          status === "active"
            ? "No database connections yet."
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
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft data-icon="inline-start" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            Next <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  );
}