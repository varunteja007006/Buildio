/** A document tracked in the system */
export type Document = {
  id: string;
  filename: string;
  filepath: string;
  fileHash: string;
  ingested: boolean;
  topicId: string | null;
  folderId: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Response from POST /api/documents/[id]/restore */
export type DocumentResponse = { document: Document };

/** Response from DELETE /api/documents/[id] */
export type DeleteResponse = { success: boolean; id: string };

/** Query params for paginated GET /api/documents */
export type DocumentsQuery = {
  page?: number;
  pageSize?: number;
  sort?:
    | "filename"
    | "filepath"
    | "fileHash"
    | "ingested"
    | "createdAt"
    | "updatedAt";
  sortDir?: "asc" | "desc";
  search?: string;
  status?: "ingested" | "pending" | "deleted";
  folderId?: string | null;
  topicId?: string | null;
};

/** Response from GET /api/documents */
export type DocumentsResponse = {
  documents: Document[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  /** True when the response is the trash view (status=deleted) */
  trashed: boolean;
};
