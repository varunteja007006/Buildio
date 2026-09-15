import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

import type {
  CreateExtractionsInput,
  CreateExtractionsResponse,
  DeleteResponse,
  Extraction,
  ExtractionDetailResponse,
  ExtractionVersionsResponse,
  ExtractionsListResponse,
  UpdateExtractionInput,
} from "./types";

/** List extraction statuses, optionally scoped to documents (for polling). */
export async function getExtractions(
  documentIds: string[] = [],
): Promise<ExtractionsListResponse> {
  const { data } = await apiClient.get<ExtractionsListResponse>(
    endpoints.extractions.list,
    { params: { documentId: documentIds } },
  );
  return data;
}

/** Queue extractions for one or more documents (rows start as `pending`) */
export async function createExtractions(
  input: CreateExtractionsInput,
): Promise<CreateExtractionsResponse> {
  const { data } = await apiClient.post<CreateExtractionsResponse>(
    endpoints.extractions.list,
    input,
  );
  return data;
}

/** Run (or re-run) a single extraction job */
export async function runExtraction(id: string): Promise<{ extraction: Extraction }> {
  const { data } = await apiClient.post<{ extraction: Extraction }>(
    endpoints.extractions.run(id),
  );
  return data;
}

/** Full extraction detail (incl. document info) for the review dialog. */
export async function getExtraction(id: string): Promise<ExtractionDetailResponse> {
  const { data } = await apiClient.get<ExtractionDetailResponse>(
    endpoints.extractions.detail(id),
  );
  return data;
}

/** Immutable version history for an extraction (newest first). */
export async function getExtractionVersions(
  id: string,
): Promise<ExtractionVersionsResponse> {
  const { data } = await apiClient.get<ExtractionVersionsResponse>(
    endpoints.extractions.versions(id),
  );
  return data;
}

/** Save an edited output (creates a `user` version) and/or toggle approval. */
export async function updateExtraction(
  id: string,
  input: UpdateExtractionInput,
): Promise<{ extraction: Extraction }> {
  const { data } = await apiClient.patch<{ extraction: Extraction }>(
    endpoints.extractions.detail(id),
    input,
  );
  return data;
}

/** Soft-delete an extraction (versions stay intact for audit). */
export async function deleteExtraction(id: string): Promise<DeleteResponse> {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.extractions.detail(id),
  );
  return data;
}

/** Restore a soft-deleted extraction. */
export async function restoreExtraction(
  id: string,
): Promise<{ extraction: Extraction }> {
  const { data } = await apiClient.post<{ extraction: Extraction }>(
    endpoints.extractions.restore(id),
  );
  return data;
}
