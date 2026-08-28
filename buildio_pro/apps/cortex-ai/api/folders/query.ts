"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createFolder,
  deleteFolder,
  getAllFolders,
  getFolders,
  hardDeleteFolder,
  renameFolder,
  restoreFolder,
} from "./api";
import type {
  CreateFolderInput,
  FoldersQuery,
  RenameFolderInput,
} from "./types";

/** Query key factory for folders domain */
export const folderKeys = {
  all: ["folders"] as const,
  list: (query: FoldersQuery) => ["folders", "list", query] as const,
};

/** Fetch all folders in the current workspace (for building a tree) */
export function useAllFolders() {
  return useQuery({
    queryKey: folderKeys.all,
    queryFn: getAllFolders,
  });
}

/** Fetch folders (root level or children of a parent) for a topic */
export function useFolders(query: FoldersQuery) {
  return useQuery({
    queryKey: folderKeys.list(query),
    queryFn: () => getFolders(query),
  });
}

/** Create a folder */
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFolderInput) => createFolder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
    },
  });
}

/** Rename a folder */
export function useRenameFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RenameFolderInput }) =>
      renameFolder(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
    },
  });
}

/** Soft-delete a folder */
export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
    },
  });
}

/** Restore a soft-deleted folder */
export function useRestoreFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
    },
  });
}

/** Permanently delete a folder */
export function useHardDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => hardDeleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
    },
  });
}