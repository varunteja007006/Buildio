import type { ChatModelOption } from "@/lib/chat/models";

export type { ChatModelOption };

/** A minimal message shape sent to the chat API */
export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

/** Response from GET /api/chat/models */
export type ChatModelsResponse = {
  models: ChatModelOption[];
  defaultModel: string;
};

/** Response from GET/PATCH /api/chat/preferences */
export type ChatPreferencesResponse = {
  defaultModel: string;
};

/** Input for updating the user's default chat model */
export type UpdateChatPreferencesInput = {
  defaultModel: string;
};

/** Payload sent to the chat API */
export type ChatRequest = {
  messages: ChatMessage[];
  model?: string;
  threadId?: string;
};

/** A single chat thread (conversation) */
export type ChatThread = {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  messageCount?: number;
  lastMessage?: string | null;
};

/** A persisted chat message within a thread */
export type ChatMessageRecord = {
  id: string;
  threadId: string;
  role: ChatMessage["role"];
  content: string;
  createdAt: string;
  updatedAt: string;
};

/** Client-side metadata carried on UI messages. */
export type ChatMessageMetadata = {
  createdAt?: string;
};

/** Response from GET /api/chat/threads */
export type ChatThreadsResponse = {
  threads: ChatThread[];
  nextOffset: number | null;
};

/** Response from POST /api/chat/threads (get-or-create empty thread) */
export type ChatThreadResponse = {
  thread: ChatThread;
};

/** Response from GET /api/chat/threads/:id */
export type ChatThreadDetailResponse = {
  thread: ChatThread;
  messages: ChatMessageRecord[];
};

/** Input for renaming a thread */
export type RenameChatThreadInput = {
  title: string;
};

/** Response from DELETE routes that only confirm removal */
export type DeleteResponse = {
  success: true;
  id: string;
};

/** Error response shape used across chat routes */
export type ApiError = {
  success: false;
  error: string;
};
