"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import type { ConnectorMetadata } from "@/api/connections/types";

export type DescriptionSummary = {
  connectorType: string;
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

export type DescriptionActivity = {
  tool: string;
  schema?: string;
  table?: string;
  columns?: string[];
  status: string;
  rowCount?: number;
  tableCount?: number;
  columnCount?: number;
};

type Input = {
  connectionId: string;
  metadata: ConnectorMetadata | null;
  metadataTables: Set<string>;
  includeSamples: boolean;
  sampleColumns: Record<string, string[]>;
  clearSampleConsent: () => void;
  onGenerated: (description: string) => void;
};

function tableKey(schema: string, table: string) {
  return `${schema}\0${table}`;
}

function parseSampleSummary(
  event: Record<string, unknown>,
  database: string | null,
) {
  if (!Array.isArray(event.samples)) return null;
  return {
    connectorType: "postgres",
    database,
    metadata: { tableCount: 0, columnCount: 0, tables: [] },
    samples: event.samples as DescriptionSummary["samples"],
    samplesIncludedInAiRequest: event.samplesIncludedInAiRequest === true,
  } satisfies DescriptionSummary;
}

function handleEvent(
  event: Record<string, unknown>,
  input: Input,
  setActivities: React.Dispatch<React.SetStateAction<DescriptionActivity[]>>,
  setSummary: React.Dispatch<React.SetStateAction<DescriptionSummary | null>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setGeneratedDraft: React.Dispatch<React.SetStateAction<string>>,
) {
  if (event.type === "activity")
    setActivities((current) => [
      ...current,
      event as unknown as DescriptionActivity,
    ]);
  if (event.type === "complete") {
    setGeneratedDraft(String(event.description ?? ""));
    setSummary(event.summary as DescriptionSummary);
    toast.success("AI description generated. Review before applying.");
  }
  if (event.type === "error") {
    setError(String(event.error));
    const summary = parseSampleSummary(event, input.metadata?.database ?? null);
    if (summary) setSummary(summary);
  }
}

export function useConnectorDescriptionGeneration(input: Input) {
  const [generating, setGenerating] = useState(false);
  const [activities, setActivities] = useState<DescriptionActivity[]>([]);
  const [summary, setSummary] = useState<DescriptionSummary | null>(null);
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [controller, setController] = useState<AbortController | null>(null);
  const reset = useCallback(() => {
    setError(null);
    setSummary(null);
    setActivities([]);
    setGeneratedDraft("");
    setController(null);
  }, []);

  async function generate() {
    const { metadata, metadataTables, includeSamples, sampleColumns } = input;
    if (!metadata || metadataTables.size === 0) return;
    const abort = new AbortController();
    setController((current) => {
      current?.abort();
      return abort;
    });
    setGenerating(true);
    setError(null);
    setActivities([]);
    setSummary(null);
    setGeneratedDraft("");
    const samples = includeSamples
      ? metadata.tables
          .filter(
            (table) =>
              sampleColumns[tableKey(table.schema, table.name)]?.length,
          )
          .map((table) => ({
            schema: table.schema,
            table: table.name,
            columns: sampleColumns[tableKey(table.schema, table.name)],
          }))
      : [];
    input.clearSampleConsent();

    try {
      const response = await fetch(
        `/api/connections/${input.connectionId}/description/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            metadataTables: metadata.tables
              .filter((table) =>
                metadataTables.has(tableKey(table.schema, table.name)),
              )
              .map(({ schema, name }) => ({ schema, table: name })),
            includeSamples,
            samples,
          }),
          signal: abort.signal,
        },
      );
      if (!response.ok || !response.body)
        throw new Error(
          (await response.json().catch(() => null))?.error ??
            "Unable to generate description",
        );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line)
            handleEvent(
              JSON.parse(line),
              input,
              setActivities,
              setSummary,
              setError,
              setGeneratedDraft,
            );
        }
      }
      if (buffer.trim())
        handleEvent(
          JSON.parse(buffer),
          input,
          setActivities,
          setSummary,
          setError,
          setGeneratedDraft,
        );
    } catch (reason) {
      if (!abort.signal.aborted)
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to generate description",
        );
    } finally {
      setGenerating(false);
      setController(null);
    }
  }

  return {
    generating,
    activities,
    summary,
    generatedDraft,
    setGeneratedDraft,
    error,
    setError,
    reset,
    abort: () => controller?.abort(),
    generate,
  };
}
