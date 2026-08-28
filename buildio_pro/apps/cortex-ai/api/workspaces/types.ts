/** A workspace — a shared container for topics, folders, files and chat. */
export type WorkspaceRole = "owner" | "member";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isPersonal: boolean;
  createdBy: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  role: WorkspaceRole;
  isActive: boolean;
};

/** Input for creating a workspace */
export type CreateWorkspaceInput = {
  name: string;
  description?: string;
};

/** Input for renaming a workspace */
export type RenameWorkspaceInput = {
  name: string;
  description?: string;
};

/** Response from GET /api/workspaces */
export type WorkspacesResponse = {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
};

/** Response from POST /api/workspaces, PATCH /api/workspaces/:id, etc. */
export type WorkspaceResponse = {
  workspace: Workspace;
};

/** Response from GET /api/workspaces/active */
export type ActiveWorkspaceResponse = {
  workspace: Workspace | null;
};

/** Response from DELETE /api/workspaces/:id */
export type DeleteResponse = {
  success: true;
  id: string;
};

/** Error response shape used across workspace routes */
export type ApiError = {
  success: false;
  error: string;
};