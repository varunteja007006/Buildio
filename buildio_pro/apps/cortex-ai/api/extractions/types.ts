export type ExtractionStatus = "pending" | "processing" | "completed" | "failed";

export type Extraction = {
  id: string;
  documentId: string;
  templateId: string | null;
  templateSnapshot: unknown;
  model: string | null;
  provider: string | null;
  status: ExtractionStatus;
  rawOutput: string | null;
  currentContent: string | null;
  structuredOutput: unknown;
  error: string | null;
  usage: unknown;
  autoIngest: boolean;
  resourceId: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateExtractionsInput = {
  documentIds: string[];
  templateId: string;
  model?: string;
  autoIngest?: boolean;
};

export type CreateExtractionsResponse = {
  extractions: Extraction[];
};
