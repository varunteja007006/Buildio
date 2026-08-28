import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  ChatRequest,
  ChatThreadDetailResponse,
  ChatThreadResponse,
  ChatThreadsResponse,
  RenameChatThreadInput,
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

/** Fetch a page of chat threads (ordered by most recently updated) */
export async function getChatThreads(
  offset = 0,
  limit = 20,
): Promise<ChatThreadsResponse> {
  const { data } = await apiClient.get<ChatThreadsResponse>(
    endpoints.chat.threads,
    { params: { offset, limit } },
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