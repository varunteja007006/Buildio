import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

import type {
  ChatModelsResponse,
  ChatPreferencesResponse,
  ChatRequest,
  ChatThreadDetailResponse,
  ChatThreadResponse,
  ChatThreadsResponse,
  DeleteResponse,
  RenameChatThreadInput,
  UpdateChatPreferencesInput,
} from "./types";

/**
 * Send a chat message and receive a streaming response.
 *
 * Uses native `fetch` (not axios) because axios does not natively
 * support streaming `ReadableStream` responses the way the AI SDK
 * expects. The AI SDK's `useChat` hook handles this internally.
 *
 * This function is provided for manual streaming usage when not
 * using the `useChat` hook.
 */
export async function sendChatMessage(
  body: ChatRequest,
  signal?: AbortSignal,
): Promise<Response> {
  return fetch(endpoints.chat.stream, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
}

/**
 * Fetch a page of chat threads (ordered by most recently updated).
 * Pass `deleted` to list soft-deleted threads instead.
 */
export async function getChatThreads(
  offset = 0,
  limit = 20,
  deleted = false,
): Promise<ChatThreadsResponse> {
  const { data } = await apiClient.get<ChatThreadsResponse>(
    endpoints.chat.threads,
    { params: { offset, limit, deleted: deleted ? "true" : undefined } },
  );
  return data;
}

/**
 * Get-or-create a chat thread:
 * returns the user's existing empty thread if one exists,
 * otherwise creates a new one.
 */
export async function createOrGetEmptyThread(): Promise<ChatThreadResponse> {
  const { data } = await apiClient.post<ChatThreadResponse>(
    endpoints.chat.threads,
  );
  return data;
}

/** Fetch a thread together with its messages */
export async function getChatThread(
  id: string,
): Promise<ChatThreadDetailResponse> {
  const { data } = await apiClient.get<ChatThreadDetailResponse>(
    endpoints.chat.thread(id),
  );
  return data;
}

/** Rename a thread */
export async function renameChatThread(
  id: string,
  input: RenameChatThreadInput,
): Promise<ChatThreadResponse> {
  const { data } = await apiClient.patch<ChatThreadResponse>(
    endpoints.chat.thread(id),
    input,
  );
  return data;
}

/** Soft-delete a thread (recoverable) */
export async function deleteChatThread(id: string): Promise<DeleteResponse> {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.chat.thread(id),
  );
  return data;
}

/** Restore a soft-deleted thread */
export async function restoreChatThread(
  id: string,
): Promise<ChatThreadResponse> {
  const { data } = await apiClient.post<ChatThreadResponse>(
    endpoints.chat.threadRestore(id),
  );
  return data;
}

/** Fetch the models available for chat */
export async function getChatModels(): Promise<ChatModelsResponse> {
  const { data } = await apiClient.get<ChatModelsResponse>(
    endpoints.chat.models,
  );
  return data;
}

/** Fetch the user's default chat model */
export async function getChatPreferences(): Promise<ChatPreferencesResponse> {
  const { data } = await apiClient.get<ChatPreferencesResponse>(
    endpoints.chat.preferences,
  );
  return data;
}

/** Update the user's default chat model */
export async function updateChatPreferences(
  input: UpdateChatPreferencesInput,
): Promise<ChatPreferencesResponse> {
  const { data } = await apiClient.patch<ChatPreferencesResponse>(
    endpoints.chat.preferences,
    input,
  );
  return data;
}
