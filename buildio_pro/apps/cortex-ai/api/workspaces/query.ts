"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  activateWorkspace,
  createWorkspace,
  deleteWorkspace,
  getActiveWorkspace,
  getWorkspaces,
  renameWorkspace,
  restoreWorkspace,
} from "./api";
import type { CreateWorkspaceInput, RenameWorkspaceInput } from "./types";

/** Query key factory for workspaces domain */
export const workspaceKeys = {
  all: ["workspaces"] as const,
  list: () => ["workspaces", "list"] as const,
  active: () => ["workspaces", "active"] as const,
  detail: (id: string) => ["workspaces", "detail", id] as const,
};

/** Query keys for workspace-scoped domains, invalidated on workspace switch */
export const workspaceScopedKeys = {
  topics: ["topics"] as const,
  folders: ["folders"] as const,
  documents: ["documents"] as const,
  chatThreads: ["chat-threads"] as const,
};

/** Fetch the list of workspaces */
export function useWorkspaces() {
  return useQuery({ queryKey: workspaceKeys.list(), queryFn: getWorkspaces });
}

/** Fetch the active workspace */
export function useActiveWorkspace() {
  return useQuery({
    queryKey: workspaceKeys.active(),
    queryFn: getActiveWorkspace,
  });
}

/** Create a workspace */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => createWorkspace(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      queryClient.invalidateQueries({ queryKey: workspaceScopedKeys.topics });
      queryClient.invalidateQueries({ queryKey: workspaceScopedKeys.folders });
      queryClient.invalidateQueries({ queryKey: workspaceScopedKeys.documents });
      queryClient.invalidateQueries({ queryKey: workspaceScopedKeys.chatThreads });
    },
  });
}

/** Rename a workspace */
export function useRenameWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RenameWorkspaceInput }) =>
      renameWorkspace(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

/** Soft-delete a workspace */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      queryClient.invalidateQueries({ queryKey: workspaceScopedKeys.topics });
      queryClient.invalidateQueries({ queryKey: workspaceScopedKeys.folders });
      queryClient.invalidateQueries({ queryKey: workspaceScopedKeys.documents });
      queryClient.invalidateQueries({ queryKey: workspaceScopedKeys.chatThreads });
    },
  });
}

/** Restore a soft-deleted workspace */
export function useRestoreWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

/** Set the active workspace — invalidates all workspace-scoped data */
export function useActivateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      queryClient.invalidateQueries({ queryKey: workspaceScopedKeys.topics });
      queryClient.invalidateQueries({ queryKey: workspaceScopedKeys.folders });
      queryClient.invalidateQueries({ queryKey: workspaceScopedKeys.documents });
      queryClient.invalidateQueries({ queryKey: workspaceScopedKeys.chatThreads });
    },
  });
}