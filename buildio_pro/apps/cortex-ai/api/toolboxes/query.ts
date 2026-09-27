"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addToolboxTool,
  createToolbox,
  deleteToolbox,
  getToolbox,
  getToolboxes,
  permanentlyDeleteToolbox,
  removeToolboxTool,
  restoreToolbox,
  setToolboxTools,
  updateToolbox,
} from "./api";
import type { ToolboxInput } from "./types";

export const toolboxKeys = {
  all: ["toolboxes"] as const,
  list: (page: number, pageSize: number, status: "active" | "deleted") =>
    ["toolboxes", "list", page, pageSize, status] as const,
  detail: (id: string) => ["toolboxes", "detail", id] as const,
};

export function useToolboxes(
  page: number,
  pageSize: number,
  status: "active" | "deleted" = "active",
) {
  return useQuery({
    queryKey: toolboxKeys.list(page, pageSize, status),
    queryFn: () => getToolboxes(page, pageSize, status),
  });
}

export function useToolbox(id: string) {
  return useQuery({
    queryKey: toolboxKeys.detail(id),
    queryFn: () => getToolbox(id),
  });
}

function invalidateToolboxes(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: toolboxKeys.all });
}

export function useCreateToolbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ToolboxInput) => createToolbox(input),
    onSuccess: () => invalidateToolboxes(queryClient),
  });
}

export function useUpdateToolbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ToolboxInput> }) =>
      updateToolbox(id, input),
    onSuccess: () => invalidateToolboxes(queryClient),
  });
}

export function useDeleteToolbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteToolbox,
    onSuccess: () => invalidateToolboxes(queryClient),
  });
}

export function useRestoreToolbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreToolbox,
    onSuccess: () => invalidateToolboxes(queryClient),
  });
}

export function usePermanentlyDeleteToolbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: permanentlyDeleteToolbox,
    onSuccess: () => invalidateToolboxes(queryClient),
  });
}

export function useSetToolboxTools() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, toolKeys }: { id: string; toolKeys: string[] }) =>
      setToolboxTools(id, toolKeys),
    onSuccess: () => invalidateToolboxes(queryClient),
  });
}

export function useAddToolboxTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, toolKey }: { id: string; toolKey: string }) =>
      addToolboxTool(id, toolKey),
    onSuccess: () => invalidateToolboxes(queryClient),
  });
}

export function useRemoveToolboxTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, toolKey }: { id: string; toolKey: string }) =>
      removeToolboxTool(id, toolKey),
    onSuccess: () => invalidateToolboxes(queryClient),
  });
}