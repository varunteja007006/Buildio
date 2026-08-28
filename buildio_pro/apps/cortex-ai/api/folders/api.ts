import apiClient from "@/api/client";
import type {
  CreateFolderInput,
  DeleteResponse,
  FolderResponse,
  FoldersQuery,
  FoldersResponse,
  RenameFolderInput,
} from "./types";

/** Fetch folders for a topic, optionally filtered to a parent's children */
export async function getFolders(query: FoldersQuery): Promise<FoldersResponse> {
  const params = new URLSearchParams({ topicId: query.topicId });
  // Absent/"root" → top-level folders; otherwise children of parentFolderId
  params.set("parentFolderId", query.parentFolderId ?? "root");
  const { data } = await apiClient.get<FoldersResponse>(`/folders?${params}`);
  return data;
}

/** Fetch all folders for the current workspace (for building a tree) */
export async function getAllFolders(): Promise<FoldersResponse> {
  const { data } = await apiClient.get<FoldersResponse>("/folders");
  return data;
}

/** Create a folder (root or nested under a parent) */
export async function createFolder(input: CreateFolderInput): Promise<FolderResponse> {
  const { data } = await apiClient.post<FolderResponse>("/folders", input);
  return data;
}

/** Rename a folder */
export async function renameFolder(
  id: string,
  input: RenameFolderInput,
): Promise<FolderResponse> {
  const { data } = await apiClient.patch<FolderResponse>(`/folders/${id}`, input);
  return data;
}

/** Soft-delete a folder */
export async function deleteFolder(id: string): Promise<DeleteResponse> {
  const { data } = await apiClient.delete<DeleteResponse>(`/folders/${id}`);
  return data;
}

/** Restore a soft-deleted folder */
export async function restoreFolder(id: string): Promise<FolderResponse> {
  const { data } = await apiClient.post<FolderResponse>(`/folders/${id}/restore`);
  return data;
}

/** Permanently delete a folder (cascades to its subfolders) */
export async function hardDeleteFolder(id: string): Promise<DeleteResponse> {
  const { data } = await apiClient.delete<DeleteResponse>(
    `/folders/${id}/permanent`,
  );
  return data;
}