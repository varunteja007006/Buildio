"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createExtractions } from "./api";
import type { CreateExtractionsInput } from "./types";

export const extractionKeys = {
  all: ["extractions"] as const,
  list: () => ["extractions", "list"] as const,
};

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
