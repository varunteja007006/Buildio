"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

import { getDocuments } from "./api";
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
