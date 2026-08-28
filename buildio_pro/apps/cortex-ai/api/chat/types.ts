/** A minimal message shape sent to the chat API */
export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

/** Payload sent to the chat API */
export type ChatRequest = {
  messages: ChatMessage[];
};

/** A single chat thread (conversation) */
export type ChatThread = {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
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

/** Error response shape used across chat routes */
export type ApiError = {
  success: false;
  error: string;
};