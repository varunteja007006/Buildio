"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createOrGetEmptyThread,
  getChatThread,
  getChatThreads,
  renameChatThread,
} from "./api";
import type { RenameChatThreadInput } from "./types";

/** Query key factory for chat domain */
export const chatKeys = {
  all: ["chat"] as const,
  threads: () => ["chat", "threads"] as const,
  threadList: () => ["chat", "threads", "list"] as const,
  thread: (id: string) => ["chat", "threads", id] as const,
};

const PAGE_SIZE = 20;

/** Fetch chat threads with infinite pagination (20 per page) */
export function useChatThreads(pageSize = PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: chatKeys.threadList(),
    queryFn: ({ pageParam }) => getChatThreads(pageParam, pageSize),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
}

/**
 * Get-or-create an empty chat thread for "New Chat".
 * Navigate to the returned thread's id.
 */
export function useCreateOrGetEmptyThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrGetEmptyThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.threads() });
    },
  });
}

/** Fetch a single thread with its messages */
export function useChatThread(id: string) {
  return useQuery({
    queryKey: chatKeys.thread(id),
    queryFn: () => getChatThread(id),
    enabled: !!id,
  });
}

/** Rename a thread */
export function useRenameChatThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RenameChatThreadInput }) =>
      renameChatThread(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.threads() });
    },
  });
}