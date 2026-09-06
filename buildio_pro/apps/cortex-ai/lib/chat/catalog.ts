import { gateway } from "ai";

import {
  FALLBACK_CHAT_MODELS,
  type ChatModelOption,
} from "./models";

/** Keep gateway metadata around so the combobox doesn't hammer the gateway. */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
let cachedModels: ChatModelOption[] | null = null;
let cachedAt = 0;
let inflight: Promise<ChatModelOption[]> | null = null;

async function loadChatModels(): Promise<ChatModelOption[]> {
  try {
    const { models } = await gateway.getAvailableModels();
    const languageModels = models
      .filter(
        (entry) =>
          entry.modelType === "language" || entry.modelType == null,
      )
      .map((entry) => ({
        id: entry.id,
        label: entry.name,
        description:
          entry.description ??
          `${entry.specification.provider} language model`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    if (languageModels.length > 0) {
      cachedModels = languageModels;
      cachedAt = Date.now();
      return languageModels;
    }
  } catch (error) {
    // Unauthenticated / unreachable gateway — fall through to the fallback
    // catalog so the picker still works.
    console.error("Failed to fetch gateway models:", error);
  }

  return FALLBACK_CHAT_MODELS;
}

/**
 * Lists the chat models available on the configured Vercel AI Gateway,
 * falling back to a curated static catalog when the gateway is unreachable.
 * Dedupes concurrent calls and caches in-process for six hours.
 */
export async function getChatModels(): Promise<ChatModelOption[]> {
  if (cachedModels && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedModels;
  }
  if (!inflight) {
    inflight = loadChatModels().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}
