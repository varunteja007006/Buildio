"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  checkConnection,
  createConnection,
  deleteConnection,
  getConnections,
  permanentlyDeleteConnection,
  restoreConnection,
  testConnection,
  updateConnection,
} from "./api";
import type { ConnectionInput, ProbeResult } from "./types";

export const connectionKeys = {
  all: ["connections"] as const,
  list: (page: number, pageSize: number, status: "active" | "deleted") =>
    ["connections", "list", page, pageSize, status] as const,
};

export function useConnections(
  page: number,
  pageSize: number,
  status: "active" | "deleted" = "active",
) {
  return useQuery({
    queryKey: connectionKeys.list(page, pageSize, status),
    queryFn: () => getConnections(page, pageSize, status),
  });
}

function invalidateConnections(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({
    queryKey: connectionKeys.all,
  });
}

export function useTestConnection() {
  return useMutation({
    mutationFn: testConnection,
  });
}

export function useCreateConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConnectionInput) => createConnection(input),
    onSuccess: () => invalidateConnections(queryClient),
  });
}

export function useUpdateConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<ConnectionInput>;
    }) => updateConnection(id, input),
    onSuccess: () => invalidateConnections(queryClient),
  });
}

export function useCheckConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkConnection,
    onSuccess: () => invalidateConnections(queryClient),
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteConnection,
    onSuccess: () => invalidateConnections(queryClient),
  });
}

export function useRestoreConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreConnection,
    onSuccess: () => invalidateConnections(queryClient),
  });
}

export function usePermanentlyDeleteConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: permanentlyDeleteConnection,
    onSuccess: () => invalidateConnections(queryClient),
  });
}

export type { ProbeResult };