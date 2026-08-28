/** Default system prompt for the RAG chat */
export const SYSTEM_PROMPT = `
You are an AI assistant with access to a knowledge base of documents.
Use the tools available to you to answer user questions based on the
retrieved context. If you don't know the answer, say so — don't make
things up.
`.trim();

/** Maximum number of tool-call steps before stopping */
export const MAX_TOOL_STEPS = 5;

/** Model to use for chat */
export const CHAT_MODEL = "gpt-4o";

/** Placeholder text shown in the chat input */
export const CHAT_INPUT_PLACEHOLDER = "Ask a question about your documents…";
