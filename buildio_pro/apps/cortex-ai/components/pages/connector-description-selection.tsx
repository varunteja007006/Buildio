"use client";

import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import type { ConnectorMetadata } from "@/api/connections/types";

const SENSITIVE =
  /password|secret|token|credential|api.?key|email|phone|mobile|address|birth|ssn|social.?security|card.?number|account.?number/i;

type Props = {
  metadata: ConnectorMetadata;
  metadataTables: Set<string>;
  setMetadataTables: React.Dispatch<React.SetStateAction<Set<string>>>;
  includeSamples: boolean;
  setIncludeSamples: (include: boolean) => void;
  sampleColumns: Record<string, string[]>;
  setSampleColumns: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >;
  disabled: boolean;
  consentVersion: number;
};

function tableKey(schema: string, table: string) {
  return `${schema}\0${table}`;
}

export function ConnectorDescriptionSelection({
  metadata,
  metadataTables,
  setMetadataTables,
  includeSamples,
  setIncludeSamples,
  sampleColumns,
  setSampleColumns,
  disabled,
  consentVersion,
}: Props) {
  const sampleableTables = metadata.tables.filter((table) =>
    table.columns.some((column) => !SENSITIVE.test(column.name)),
  );

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="rounded-md border p-3 text-sm">
        <p>
          <strong>Connector:</strong> PostgreSQL
        </p>
        <p>
          <strong>Database:</strong> {metadata.database}
        </p>
        <p>
          AI receives selected tables&apos; names, column names/types, comments,
          primary keys, and foreign-key relationships. No rows unless separately
          enabled.
        </p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">
          Metadata tables ({metadataTables.size}/{metadata.tables.length})
        </h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() =>
            setMetadataTables(
              metadataTables.size === metadata.tables.length
                ? new Set()
                : new Set(
                    metadata.tables.map(({ schema, name }) =>
                      tableKey(schema, name),
                    ),
                  ),
            )
          }
        >
          {metadataTables.size === metadata.tables.length
            ? "Clear"
            : "Select all"}
        </Button>
      </div>
      <div className="max-h-48 overflow-y-auto rounded-md border p-2">
        {metadata.tables.map((table) => {
          const key = tableKey(table.schema, table.name);
          return (
            <label
              key={key}
              className="flex items-start gap-2 rounded p-2 text-sm hover:bg-muted"
            >
              <Checkbox
                disabled={disabled}
                checked={metadataTables.has(key)}
                onCheckedChange={(checked) =>
                  setMetadataTables((current) => {
                    const next = new Set(current);
                    if (checked) next.add(key);
                    else {
                      next.delete(key);
                      setSampleColumns((samples) => {
                        const nextSamples = { ...samples };
                        delete nextSamples[key];
                        return nextSamples;
                      });
                    }
                    return next;
                  })
                }
              />
              <span className="min-w-0 flex-1">
                <span className="font-medium">
                  {table.schema}.{table.name}
                </span>
                <span className="ml-2 text-muted-foreground">
                  {table.columns.length} columns
                </span>
                <span className="block text-xs text-muted-foreground">
                  {table.columns
                    .map(({ name, type }) => `${name} (${type})`)
                    .join(", ")}
                </span>
                {table.comment ? (
                  <span className="block text-xs text-muted-foreground">
                    {table.comment}
                  </span>
                ) : null}
                {table.relationships.length ? (
                  <span className="block text-xs text-muted-foreground">
                    Relationships:{" "}
                    {table.relationships
                      .map(
                        (relationship) =>
                          `${relationship.column} → ${relationship.referencedSchema}.${relationship.referencedTable}.${relationship.referencedColumn}`,
                      )
                      .join(", ")}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      <div className="rounded-md border p-3">
        <label className="flex items-start gap-2 text-sm font-medium">
          <Checkbox
            key={`samples-${consentVersion}`}
            checked={includeSamples}
            disabled={disabled || !sampleableTables.length}
            onCheckedChange={(checked) => setIncludeSamples(checked === true)}
          />
          Include row samples (optional; off by default)
        </label>
        <p className="mt-2 flex gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="size-4 shrink-0" />
          Selected values go to AI provider for this generation. Maximum 5 rows
          per table and 5 tables. Likely sensitive columns excluded; values are
          not logged or saved.
        </p>
        {includeSamples ? (
          <div className="mt-2 max-h-64 overflow-y-auto border-t pt-2">
            {sampleableTables.map((table) => {
              const key = tableKey(table.schema, table.name);
              const eligible = metadataTables.has(key);
              const safeColumns = table.columns
                .filter(({ name }) => !SENSITIVE.test(name))
                .slice(0, 20);
              const selected = sampleColumns[key] ?? [];
              return (
                <fieldset
                  key={key}
                  className="border-b py-2 last:border-0"
                  disabled={disabled || !eligible}
                >
                  <legend className="flex items-center gap-2 text-sm font-medium">
                    <Checkbox
                      key={`${key}-${consentVersion}`}
                      disabled={disabled || !eligible}
                      checked={selected.length > 0}
                      onCheckedChange={(checked) =>
                        setSampleColumns((current) => {
                          const next = { ...current };
                          if (checked) {
                            if (
                              Object.values(current).filter(
                                (columns) => columns.length > 0,
                              ).length >= 5
                            ) {
                              toast.error("Maximum 5 sample tables");
                              return current;
                            }
                            next[key] = safeColumns.map(({ name }) => name);
                          } else delete next[key];
                          return next;
                        })
                      }
                    />
                    {table.schema}.{table.name}
                    {!eligible ? (
                      <span className="text-xs text-muted-foreground">
                        select metadata above
                      </span>
                    ) : null}
                  </legend>
                  {selected.length ? (
                    <div className="ml-6 mt-1 grid grid-cols-2 gap-x-2">
                      {safeColumns.map((column) => (
                        <label
                          key={column.name}
                          className="flex items-center gap-2 py-0.5 text-xs"
                        >
                          <Checkbox
                            key={`${key}-${column.name}-${consentVersion}`}
                            disabled={disabled}
                            checked={selected.includes(column.name)}
                            onCheckedChange={(checked) =>
                              setSampleColumns((current) => ({
                                ...current,
                                [key]: checked
                                  ? [...selected, column.name]
                                  : selected.filter(
                                      (name) => name !== column.name,
                                    ),
                              }))
                            }
                          />
                          {column.name} ({column.type})
                        </label>
                      ))}
                    </div>
                  ) : null}
                </fieldset>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
