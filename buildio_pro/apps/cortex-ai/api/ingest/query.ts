"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingestDocuments } from "./api";
import type { IngestResponse } from "./types";
import { documentKeys } from "@/api/documents/query";

/** Ingest all uningested documents (chunk → embed → store) */
export function useIngestDocuments() {
  const queryClient = useQueryClient();

  return useMutation<IngestResponse, Error, void>({
    mutationFn: ingestDocuments,
    onSuccess: (data) => {
      if (data.success) {
        // Refresh the documents list to reflect updated ingestion status
        queryClient.invalidateQueries({ queryKey: documentKeys.all });
      }
    },
  });
}
