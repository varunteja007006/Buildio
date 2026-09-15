"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { extractionKeys } from "@/api/extractions/query";

import {
  deleteDocument,
  emptyTrash,
  getDocuments,
  permanentlyDeleteDocument,
  restoreDocument,
} from "./api";
import type { DocumentsResponse, DocumentsQuery } from "./types";

/** Query key factory for documents domain */
export const documentKeys = {
  all: ["documents"] as const,
  list: (params: DocumentsQuery = {}) => ["documents", "list", params] as const,
  infiniteList: (params: Omit<DocumentsQuery, "page"> = {}) =>
    ["documents", "infinite", params] as const,
  detail: (id: string) => ["documents", "detail", id] as const,
};

/** Fetch a paginated list of tracked documents */
export function useDocuments(params: DocumentsQuery = {}) {
  return useQuery<DocumentsResponse>({
    queryKey: documentKeys.list(params),
    queryFn: () => getDocuments(params),
  });
}

/** Infinite scroll: fetch documents page-by-page, accumulating results */
export function useInfiniteDocuments(
  params: Omit<DocumentsQuery, "page"> = {},
) {
  return useInfiniteQuery<DocumentsResponse>({
    queryKey: documentKeys.infiniteList(params),
    queryFn: ({ pageParam }) =>
      getDocuments({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pageCount ? lastPage.page + 1 : undefined,
  });
}

/** Soft-delete a document (moves it to trash) and refresh document lists */
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

/** Restore a soft-deleted document and refresh document lists */
export function useRestoreDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

/** Permanently delete a trashed document (owner only) and refresh lists */
export function usePermanentlyDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => permanentlyDeleteDocument(id),
    onSuccess: () => {
      void invalidateDocumentScope(queryClient);
    },
  });
}

/** Empty the trash: permanently delete every trashed document (owner only) */
export function useEmptyTrash() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: emptyTrash,
    onSuccess: () => {
      void invalidateDocumentScope(queryClient);
    },
  });
}

/** Purges touch documents, resources, and extraction state */
function invalidateDocumentScope(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: documentKeys.all }),
    queryClient.invalidateQueries({ queryKey: ["resources"] }),
    queryClient.invalidateQueries({ queryKey: extractionKeys.all }),
  ]);
}
