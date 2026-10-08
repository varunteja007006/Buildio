import { Badge } from "@workspace/ui/components/badge";

type Activity = {
  tool: string;
  schema?: string;
  table?: string;
  columns?: string[];
  status: string;
  rowCount?: number;
  tableCount?: number;
  columnCount?: number;
  tables?: { schema: string; table: string }[];
};

type Summary = {
  database: string | null;
  metadata: {
    tableCount: number;
    columnCount: number;
    tables: { schema: string; table: string; columns: string[] }[];
  };
  samples: {
    schema: string;
    table: string;
    columns: string[];
    rowCount: number;
  }[];
  samplesIncludedInAiRequest?: boolean;
};

export function ConnectorDescriptionActivity({
  activities,
  summary,
}: {
  activities: Activity[];
  summary: Summary | null;
}) {
  if (!activities.length && !summary) return null;
  return (
    <div className="mb-4 space-y-3 border-t pt-3">
      {activities.length ? (
        <section className="space-y-2">
          <h3 className="text-sm font-medium">AI activity</h3>
          {activities.map((activity, index) => (
            <div
              key={`${activity.tool}-${activity.table ?? "schema"}-${index}`}
              className="text-xs text-muted-foreground"
            >
              <Badge variant="outline" className="mr-2">
                {activity.status}
              </Badge>
              {activity.tool}
              {activity.table ? ` — ${activity.schema}.${activity.table}` : ""}
              {activity.columns?.length
                ? ` (${activity.columns.join(", ")})`
                : ""}
              {activity.rowCount !== undefined
                ? ` — ${activity.rowCount} rows`
                : ""}
              {activity.tableCount !== undefined
                ? ` — ${activity.tableCount} tables, ${activity.columnCount} columns`
                : ""}
              {activity.tables?.length
                ? ` — ${activity.tables.map(({ schema, table }) => `${schema}.${table}`).join(", ")}`
                : ""}
            </div>
          ))}
        </section>
      ) : null}
      {summary ? (
        <section className="rounded-md border p-3">
          <h3 className="text-sm font-medium">Access summary</h3>
          <p className="text-xs text-muted-foreground">
            AI received schema for {summary.metadata.tableCount} tables and{" "}
            {summary.metadata.columnCount} columns in {summary.database}.{" "}
            {summary.samplesIncludedInAiRequest
              ? `Sample values were included in the AI request for ${summary.samples.length} tables.`
              : `Sample rows were read from ${summary.samples.length} tables but were not included in an AI request.`}
          </p>
          {summary.metadata.tables.map((table) => (
            <p
              key={`${table.schema}.${table.table}`}
              className="text-xs text-muted-foreground"
            >
              Schema sent: {table.schema}.{table.table} —{" "}
              {table.columns.join(", ")}
            </p>
          ))}
          {summary.samples.map((sample) => (
            <p
              key={`${sample.schema}.${sample.table}`}
              className="text-xs text-muted-foreground"
            >
              Sample: {sample.schema}.{sample.table}: {sample.rowCount} rows;{" "}
              {sample.columns.join(", ")}
            </p>
          ))}
        </section>
      ) : null}
    </div>
  );
}
