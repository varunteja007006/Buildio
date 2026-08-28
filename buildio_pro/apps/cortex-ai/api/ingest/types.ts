export interface IngestResultItem {
  filename: string;
  success: boolean;
  chunksCount?: number;
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
