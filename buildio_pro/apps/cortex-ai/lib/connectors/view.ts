import type { connections } from "@/lib/db/schema/connections";

type ConnectionRow = typeof connections.$inferSelect;

export type ConnectionView = {
  id: string;
  workspaceId: string;
  name: string;
  type: string;
  host: string | null;
  port: number | null;
  username: string | null;
  database: string | null;
  target: string;
  status: string;
  lastCheckedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toConnectionView(row: ConnectionRow): ConnectionView {
  const target =
    row.type === "sqlite"
      ? (row.sqliteFileName ?? "SQLite file")
      : `${row.username ?? "user"}@${row.host}:${row.port ?? 0}/${row.database ?? ""}`;
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    name: row.name,
    type: row.type,
    host: row.host,
    port: row.port,
    username: row.username,
    database: row.database,
    target,
    status: row.status,
    lastCheckedAt: row.lastCheckedAt ? row.lastCheckedAt.toISOString() : null,
    lastError: row.lastError,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
