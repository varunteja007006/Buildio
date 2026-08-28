import apiClient from "@/api/client";
import type {
  ActiveWorkspaceResponse,
  CreateWorkspaceInput,
  DeleteResponse,
  RenameWorkspaceInput,
  WorkspaceResponse,
  WorkspacesResponse,
} from "./types";

/** Fetch the current user's workspaces */
export async function getWorkspaces(): Promise<WorkspacesResponse> {
  const { data } = await apiClient.get<WorkspacesResponse>("/workspaces");
  return data;
}

/** Fetch the user's active workspace (or null) */
export async function getActiveWorkspace(): Promise<ActiveWorkspaceResponse> {
  const { data } = await apiClient.get<ActiveWorkspaceResponse>(
    "/workspaces/active",
  );
  return data;
}

/** Fetch a single workspace */
export async function getWorkspace(id: string): Promise<WorkspaceResponse> {
  const { data } = await apiClient.get<WorkspaceResponse>(`/workspaces/${id}`);
  return data;
}

/** Create a new workspace (max 5 per user) */
export async function createWorkspace(
  input: CreateWorkspaceInput,
): Promise<WorkspaceResponse> {
  const { data } = await apiClient.post<WorkspaceResponse>("/workspaces", input);
  return data;
}

/** Rename a workspace */
export async function renameWorkspace(
  id: string,
  input: RenameWorkspaceInput,
): Promise<WorkspaceResponse> {
  const { data } = await apiClient.patch<WorkspaceResponse>(
    `/workspaces/${id}`,
    input,
  );
  return data;
}

/** Soft-delete a workspace (owner only) */
export async function deleteWorkspace(id: string): Promise<DeleteResponse> {
  const { data } = await apiClient.delete<DeleteResponse>(`/workspaces/${id}`);
  return data;
}

/** Restore a soft-deleted workspace (owner only) */
export async function restoreWorkspace(id: string): Promise<WorkspaceResponse> {
  const { data } = await apiClient.post<WorkspaceResponse>(
    `/workspaces/${id}/restore`,
  );
  return data;
}

/** Set a workspace as the user's active workspace */
export async function activateWorkspace(
  id: string,
): Promise<WorkspaceResponse> {
  const { data } = await apiClient.post<WorkspaceResponse>(
    `/workspaces/${id}/activate`,
  );
  return data;
}