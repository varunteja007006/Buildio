"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAgentTemplate,
  deleteAgentTemplate,
  getAgentTemplates,
  permanentlyDeleteAgentTemplate,
  restoreAgentTemplate,
  updateAgentTemplate,
} from "./api";
import type { AgentTemplateInput } from "./types";

export const agentTemplateKeys = {
  all: ["agent-templates"] as const,
  list: (page: number, pageSize: number, status: "active" | "deleted") =>
    ["agent-templates", "list", page, pageSize, status] as const,
};

export function useAgentTemplates(
  page: number,
  pageSize: number,
  status: "active" | "deleted" = "active",
) {
  return useQuery({
    queryKey: agentTemplateKeys.list(page, pageSize, status),
    queryFn: () => getAgentTemplates(page, pageSize, status),
  });
}

function invalidateTemplates(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: agentTemplateKeys.all });
}

export function useCreateAgentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AgentTemplateInput) => createAgentTemplate(input),
    onSuccess: () => invalidateTemplates(queryClient),
  });
}

export function useUpdateAgentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<AgentTemplateInput>;
    }) => updateAgentTemplate(id, input),
    onSuccess: () => invalidateTemplates(queryClient),
  });
}

export function useDeleteAgentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAgentTemplate,
    onSuccess: () => invalidateTemplates(queryClient),
  });
}

export function useRestoreAgentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreAgentTemplate,
    onSuccess: () => invalidateTemplates(queryClient),
  });
}

export function usePermanentlyDeleteAgentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: permanentlyDeleteAgentTemplate,
    onSuccess: () => invalidateTemplates(queryClient),
  });
}