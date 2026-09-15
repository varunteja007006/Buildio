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
  approved: boolean;
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

/** Lightweight extraction row returned by GET /api/extraction (for polling). */
export type ExtractionStatusRow = {
  id: string;
  documentId: string;
  status: ExtractionStatus;
  error: string | null;
  autoIngest: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ExtractionsListResponse = {
  extractions: ExtractionStatusRow[];
};

export type ExtractionDocument = {
  id: string;
  filename: string;
  filepath: string;
};

export type ExtractionDetailResponse = {
  extraction: Extraction;
  document: ExtractionDocument;
};

export type UpdateExtractionInput = {
  currentContent?: string;
  approved?: boolean;
};

export type ExtractionVersion = {
  id: string;
  extractionId: string;
  version: number;
  /** ai | user */
  source: "ai" | "user";
  content: string;
  structuredOutput: unknown;
  createdBy: string | null;
  createdAt: string;
};

export type ExtractionVersionsResponse = {
  versions: ExtractionVersion[];
};

export type DeleteResponse = { success: boolean; id: string };
