"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { ArrowLeft, Loader2, Save, Table2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  useConnection,
  useConnectionTables,
  useUpdateConnectorContext,
} from "@/api/connections/query";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { StatusBadge } from "@/components/connections/connection-columns";

type AgentConnectorDetailPageProps = { connectionId: string };

export function AgentConnectorDetailPage({
  connectionId,
}: AgentConnectorDetailPageProps) {
  const detail = useConnection(connectionId);
  const connection = detail.data?.connection ?? null;
  const [description, setDescription] = useState("");
  const updateContext = useUpdateConnectorContext();
  useEffect(
    () => setDescription(connection?.description ?? ""),
    [connection?.description],
  );
  const supportsTables =
    connection?.type === "postgres" || connection?.type === "mongodb";
  const tables = useConnectionTables(connectionId, Boolean(supportsTables));
  const heading = supportsTables
    ? connection?.type === "mongodb"
      ? "Collections"
      : "Tables"
    : "Tables";

  if (detail.isLoading)
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );

  if (detail.isError || !connection)
    return (
      <p className="text-sm text-destructive">
        {detail.error instanceof Error
          ? detail.error.message
          : "Connection not found."}
      </p>
    );

  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Agent", href: "/dashboard/agent/builder" },
          { label: "Connectors", href: "/dashboard/agent/connectors" },
          { label: connection.name },
        ]}
      />
      <div className="flex w-full flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/agent/connectors" aria-label="Back">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 truncate text-xl font-semibold">
              {connection.name}
              <Badge variant="secondary" className="capitalize">
                {connection.type}
              </Badge>
              <StatusBadge status={connection.status} />
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {connection.target}
            </p>
          </div>
        </div>
        <section className="flex max-w-2xl flex-col gap-2">
          <div>
            <h2 className="text-sm font-medium">About this connector</h2>
            <p className="text-sm text-muted-foreground">
              Explain what this data source contains and how an AI agent should
              interpret it.
            </p>
          </div>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={4000}
            rows={5}
            placeholder="For example: This database contains sales orders. Use completed orders for revenue reporting; refunds are stored separately."
            aria-label="Connector explanation"
          />
          <Button
            className="self-start"
            disabled={
              updateContext.isPending ||
              description === (connection.description ?? "")
            }
            onClick={() =>
              updateContext.mutate(
                { id: connectionId, description },
                {
                  onSuccess: () => toast.success("Connector explanation saved"),
                  onError: (error) =>
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Unable to save explanation",
                    ),
                },
              )
            }
          >
            {updateContext.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save />
            )}
            Save explanation
          </Button>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">{heading}</h2>
          {tables.isLoading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : tables.isError ? (
            <p className="text-sm text-destructive">
              {tables.error instanceof Error
                ? tables.error.message
                : "Unable to load tables."}
            </p>
          ) : (tables.data?.tables.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No tables found.</p>
          ) : (
            <ul className="flex max-w-2xl flex-col gap-1 rounded-lg border p-2">
              {tables.data?.tables.map((table) => (
                <li
                  key={`${table.schema}.${table.name}`}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <Table2 className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium">{table.name}</span>
                  {table.schema !== "public" && (
                    <span className="ml-auto truncate text-xs text-muted-foreground">
                      {table.schema}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
