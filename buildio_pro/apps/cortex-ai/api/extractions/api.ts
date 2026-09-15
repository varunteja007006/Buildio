import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

import type {
  CreateExtractionsInput,
  CreateExtractionsResponse,
} from "./types";

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
