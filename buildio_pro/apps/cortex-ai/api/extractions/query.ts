"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import {
  createExtractions,
  deleteExtraction,
  getExtraction,
  getExtractionVersions,
  getExtractions,
  restoreExtraction,
  runExtraction,
  updateExtraction,
} from "./api";
import type {
  CreateExtractionsInput,
  ExtractionStatusRow,
  UpdateExtractionInput,
} from "./types";

export const extractionKeys = {
  all: ["extractions"] as const,
  list: (documentIds: string[] = []) =>
    ["extractions", "list", documentIds] as const,
  detail: (id: string) => ["extractions", "detail", id] as const,
  versions: (id: string) => ["extractions", "versions", id] as const,
};

export const EXTRACTION_POLL_INTERVAL_MS = 3000;

function hasActiveJob(rows: ExtractionStatusRow[] | undefined): boolean {
  return (
    rows?.some(
      (row) => row.status === "pending" || row.status === "processing",
    ) ?? false
  );
}

/**
 * Extraction statuses for the workspace (optionally scoped to documents).
 * Polls every 3s while any extraction is pending or processing.
 */
export function useExtractionStatuses(documentIds: string[] = []) {
  return useQuery({
    queryKey: extractionKeys.list(documentIds),
    queryFn: () => getExtractions(documentIds),
    refetchInterval: (query) =>
      hasActiveJob(query.state.data?.extractions)
        ? EXTRACTION_POLL_INTERVAL_MS
        : false,
  });
}

/** Queue extractions for the selected documents and refresh document state */
export function useCreateExtractions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExtractionsInput) => createExtractions(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: extractionKeys.all });
    },
  });
}

/** Run (or re-run) a single extraction job */
export function useRunExtraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => runExtraction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: extractionKeys.all });
    },
  });
}

/** Concurrent run requests started per bulk extraction (bounded to protect the gateway) */
export const EXTRACTION_RUN_CONCURRENCY = 3;

/**
 * Run queued extractions in the background (fire-and-forget) with a bounded
 * worker pool: up to `EXTRACTION_RUN_CONCURRENCY` jobs run at once, and each
 * job's settle (completed or failed) invalidates the status query so badges
 * keep up; ongoing progress is covered by the 3s polling in
 * `useExtractionStatuses`.
  */
export function runExtractionsConcurrently(
  ids: string[],
  queryClient: QueryClient,
): Promise<void> {
  const queue = [...ids];
  const worker = async () => {
    for (;;) {
      const id = queue.shift();
      if (!id) {
        console.debug("[extraction] worker drained — queue empty");
        return;
      }
      console.debug(
        `[extraction] worker claimed job ${id} (${queue.length} queued)`,
      );
      try {
        await runExtraction(id);
      } catch {
        // The row keeps its server-side status (pending/failed); the status
        // query reflects the real outcome on the next fetch.
      } finally {
        await queryClient.invalidateQueries({ queryKey: extractionKeys.all });
      }
    }
  };
  const workers = Array.from(
    { length: Math.min(EXTRACTION_RUN_CONCURRENCY, queue.length) },
    () => worker(),
  );
  return Promise.all(workers).then(() => undefined);
}

/**
 * Full extraction detail for the review dialog. Polls while the job is
 * pending/processing so a re-run updates the dialog in place.
 */
export function useExtraction(id: string | null) {
  return useQuery({
    queryKey: extractionKeys.detail(id ?? ""),
    queryFn: () => getExtraction(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.extraction.status;
      return status === "pending" || status === "processing"
        ? EXTRACTION_POLL_INTERVAL_MS
        : false;
    },
  });
}

/** Immutable version history for an extraction (newest first). */
export function useExtractionVersions(id: string | null) {
  return useQuery({
    queryKey: extractionKeys.versions(id ?? ""),
    queryFn: () => getExtractionVersions(id!),
    enabled: !!id,
  });
}

/** Save an edited output and/or toggle approval; refreshes detail + versions */
export function useUpdateExtraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExtractionInput }) =>
      updateExtraction(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: extractionKeys.all });
    },
  });
}

/** Soft-delete an extraction (versions stay intact); badges drop the row */
export function useDeleteExtraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExtraction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: extractionKeys.all });
    },
  });
}

/** Restore a soft-deleted extraction */
export function useRestoreExtraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreExtraction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: extractionKeys.all });
    },
  });
}
