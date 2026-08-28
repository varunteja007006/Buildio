import apiClient from "@/api/client";
import type { DocumentsQuery, DocumentsResponse } from "./types";

/** Build a query string from pagination/filter params, omitting defaults */
function buildQueryString(params: DocumentsQuery = {}): string {
  const query = new URLSearchParams();
  if (params.page && params.page > 1) query.set("page", String(params.page));
  if (params.pageSize && params.pageSize !== 10) query.set("pageSize", String(params.pageSize));
  if (params.sort && params.sort !== "createdAt") query.set("sort", params.sort);
  if (params.sortDir && params.sortDir !== "desc") query.set("sortDir", params.sortDir);
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.folderId) query.set("folderId", params.folderId);
  if (params.topicId) query.set("topicId", params.topicId);
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

/** Fetch a paginated list of documents from the server */
export async function getDocuments(
  params: DocumentsQuery = {},
): Promise<DocumentsResponse> {
  const { data } = await apiClient.get<DocumentsResponse>(
    `/documents${buildQueryString(params)}`,
  );
  return data;
}
