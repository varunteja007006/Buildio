export interface IngestResultItem {
  documentId: string;
  filename: string;
  success: boolean;
  chunksCount?: number;
  /** Where the ingested content came from */
  source?: "extraction" | "file";
  error?: string;
}

export interface IngestResponse {
  success: boolean;
  message?: string;
  ingested?: number;
  failed?: number;
  results?: IngestResultItem[];
  error?: string;
}
