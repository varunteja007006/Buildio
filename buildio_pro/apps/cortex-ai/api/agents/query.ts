"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAgent,
  deleteAgent,
  deployAgent,
  getAgent,
  getAgentFeedback,
  getAgents,
  permanentlyDeleteAgent,
  restoreAgent,
  setAgentTools,
  setAgentTopics,
  undeployAgent,
  updateAgent,
  upsertAgentFeedback,
} from "./api";
import type { AgentFeedbackInput, AgentInput, AgentToolsInput } from "./types";

export const agentKeys = {
  all: ["agents"] as const,
  list: (page: number, pageSize: number, status: "active" | "deleted") =>
    ["agents", "list", page, pageSize, status] as const,
  detail: (id: string) => ["agents", "detail", id] as const,
  feedback: (id: string) => ["agents", "feedback", id] as const,
};

export function useAgents(
  page: number,
  pageSize: number,
  status: "active" | "deleted" = "active",
) {
  return useQuery({
    queryKey: agentKeys.list(page, pageSize, status),
    queryFn: () => getAgents(page, pageSize, status),
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: () => getAgent(id),
  });
}

function invalidateAgents(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: agentKeys.all });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AgentInput) => createAgent(input),
    onSuccess: () => invalidateAgents(queryClient),
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AgentInput> }) =>
      updateAgent(id, input),
    onSuccess: () => invalidateAgents(queryClient),
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => invalidateAgents(queryClient),
  });
}

export function useRestoreAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreAgent,
    onSuccess: () => invalidateAgents(queryClient),
  });
}

export function usePermanentlyDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: permanentlyDeleteAgent,
    onSuccess: () => invalidateAgents(queryClient),
  });
}

export function useDeployAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deployAgent,
    onSuccess: () => invalidateAgents(queryClient),
  });
}

export function useUndeployAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: undeployAgent,
    onSuccess: () => invalidateAgents(queryClient),
  });
}

export function useSetAgentTopics() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, topicIds }: { id: string; topicIds: string[] }) =>
      setAgentTopics(id, topicIds),
    onSuccess: () => invalidateAgents(queryClient),
  });
}

export function useSetAgentTools() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AgentToolsInput }) =>
      setAgentTools(id, input),
    onSuccess: () => invalidateAgents(queryClient),
  });
}

export function useAgentFeedback(id: string) {
  return useQuery({
    queryKey: agentKeys.feedback(id),
    queryFn: () => getAgentFeedback(id),
  });
}

export function useUpsertAgentFeedback(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AgentFeedbackInput) => upsertAgentFeedback(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: agentKeys.feedback(id) }),
  });
}