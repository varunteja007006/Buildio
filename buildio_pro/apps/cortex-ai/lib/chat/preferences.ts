import { eq } from "drizzle-orm";

import { DEFAULT_CHAT_MODEL_ID } from "@/lib/chat/models";
import { db } from "@/lib/db";
import { chatPreferences } from "@/lib/db/schema/chat-preferences";

export type ChatPreferences = {
  userId: string;
  defaultModel: string;
};

/**
 * Returns the user's chat preferences, creating a row with the default
 * model on first access. Safe to call concurrently.
 */
export async function getOrCreateChatPreferences(
  userId: string,
): Promise<ChatPreferences> {
  const [existing] = await db
    .select()
    .from(chatPreferences)
    .where(eq(chatPreferences.userId, userId))
    .limit(1);

  if (existing) {
    return existing;
  }

  await db.insert(chatPreferences).values({ userId }).onConflictDoNothing();

  const [created] = await db
    .select()
    .from(chatPreferences)
    .where(eq(chatPreferences.userId, userId))
    .limit(1);

  return (
    created ?? { userId, defaultModel: DEFAULT_CHAT_MODEL_ID }
  );
}

export async function setDefaultChatModel(
  userId: string,
  defaultModel: string,
): Promise<ChatPreferences> {
  await getOrCreateChatPreferences(userId);

  const [updated] = await db
    .update(chatPreferences)
    .set({ defaultModel })
    .where(eq(chatPreferences.userId, userId))
    .returning();

  return updated ?? { userId, defaultModel };
}
