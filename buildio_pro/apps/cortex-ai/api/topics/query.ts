"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createTopic, deleteTopic, getTopics, hardDeleteTopic, renameTopic, restoreTopic } from "./api";
import type { CreateTopicInput, RenameTopicInput, Topic } from "./types";

/** Query key factory for topics domain */
export const topicKeys = {
  all: ["topics"] as const,
  list: () => ["topics", "list"] as const,
};

/** Fetch the list of topics */
export function useTopics() {
  return useQuery({ queryKey: topicKeys.list(), queryFn: getTopics });
}

/** Create a topic */
export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTopicInput) => createTopic(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
}

/** Rename a topic */
export function useRenameTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RenameTopicInput }) =>
      renameTopic(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
}

/** Soft-delete a topic */
export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
}

/** Restore a soft-deleted topic */
export function useRestoreTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
}

/** Permanently delete a topic */
export function useHardDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => hardDeleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
}

/** Optimistically rename a topic in the cached list */
export function updateTopicInCache(
  topics: Topic[],
  id: string,
  updates: Partial<Pick<Topic, "name" | "slug">>,
): Topic[] {
  return topics.map((topic) =>
    topic.id === id ? { ...topic, ...updates } : topic,
  );
}