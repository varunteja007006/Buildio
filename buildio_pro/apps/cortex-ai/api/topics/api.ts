import apiClient from "@/api/client";
import type {
  CreateTopicInput,
  DeleteResponse,
  RenameTopicInput,
  TopicResponse,
  TopicsResponse,
} from "./types";

/** Fetch all topics */
export async function getTopics(): Promise<TopicsResponse> {
  const { data } = await apiClient.get<TopicsResponse>("/topics");
  return data;
}

/** Create a new topic */
export async function createTopic(input: CreateTopicInput): Promise<TopicResponse> {
  const { data } = await apiClient.post<TopicResponse>("/topics", input);
  return data;
}

/** Rename a topic */
export async function renameTopic(
  id: string,
  input: RenameTopicInput,
): Promise<TopicResponse> {
  const { data } = await apiClient.patch<TopicResponse>(`/topics/${id}`, input);
  return data;
}

/** Soft-delete a topic */
export async function deleteTopic(id: string): Promise<DeleteResponse> {
  const { data } = await apiClient.delete<DeleteResponse>(`/topics/${id}`);
  return data;
}

/** Restore a soft-deleted topic */
export async function restoreTopic(id: string): Promise<TopicResponse> {
  const { data } = await apiClient.post<TopicResponse>(`/topics/${id}/restore`);
  return data;
}

/** Permanently delete a topic (cascades to its folders) */
export async function hardDeleteTopic(id: string): Promise<DeleteResponse> {
  const { data } = await apiClient.delete<DeleteResponse>(
    `/topics/${id}/permanent`,
  );
  return data;
}