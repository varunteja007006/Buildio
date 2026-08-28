/** A RAG resource (source document chunk) */
export type Resource = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

/** Input for creating a new resource */
export type CreateResourceInput = {
  content: string;
};
