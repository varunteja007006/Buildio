/** A folder — organizes documents within a topic. UI-only structure. */
export type Folder = {
  id: string;
  topicId: string;
  parentFolderId: string | null;
  name: string;
  depth: number;
  position: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Query params for GET /api/folders */
export type FoldersQuery = {
  topicId: string;
  parentFolderId?: string | null;
};

/** Input for creating a folder */
export type CreateFolderInput = {
  topicId: string;
  name: string;
  parentFolderId?: string | null;
};

/** Input for renaming a folder */
export type RenameFolderInput = {
  name: string;
};

/** Response from GET /api/folders */
export type FoldersResponse = {
  folders: Folder[];
};

/** Response from POST /api/folders and PATCH /api/folders/:id */
export type FolderResponse = {
  folder: Folder;
};

/** Response from DELETE /api/folders/:id */
export type DeleteResponse = {
  success: true;
  id: string;
};

/** Error response shape used across folder routes */
export type ApiError = {
  success: false;
  error: string;
};