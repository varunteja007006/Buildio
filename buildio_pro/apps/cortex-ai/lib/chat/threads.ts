import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { chatMessages } from "@/lib/db/schema/messages";
import { chatThreads } from "@/lib/db/schema/threads";

/**
 * Returns the user's existing thread that has no messages yet, creating one
 * if none exists. Powers "New Chat" without spamming empty threads.
 */
export async function getOrCreateEmptyThread(
  userId: string,
  workspaceId: string,
) {
  return db.transaction(async (tx) => {
    // Serialize per user+workspace so concurrent "New chat" clicks can't both
    // see "no empty thread" and create duplicates.
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtext(${`${userId}:${workspaceId}`})::bigint)`,
    );

    const [existing] = await tx
      .select()
      .from(chatThreads)
      .where(
        and(
          eq(chatThreads.userId, userId),
          eq(chatThreads.workspaceId, workspaceId),
          isNull(chatThreads.deletedAt),
          sql`NOT EXISTS (
            SELECT 1 FROM ${chatMessages}
            WHERE ${chatMessages.threadId} = ${chatThreads.id}
          )`,
        ),
      )
      .orderBy(desc(chatThreads.createdAt))
      .limit(1);

    if (existing) {
      return existing;
    }

    const [thread] = await tx
      .insert(chatThreads)
      .values({ userId, workspaceId })
      .returning();

    return thread;
  });
}

/** Returns a non-deleted thread owned by the user in the workspace, or null. */
export async function getThreadForUser(
  threadId: string,
  userId: string,
  workspaceId: string,
) {
  const [thread] = await db
    .select()
    .from(chatThreads)
    .where(
      and(
        eq(chatThreads.id, threadId),
        eq(chatThreads.userId, userId),
        eq(chatThreads.workspaceId, workspaceId),
        isNull(chatThreads.deletedAt),
      ),
    );

  return thread ?? null;
}

/** Bump a thread's `updatedAt` and optionally backfill title/model once. */
export async function touchThread(input: {
  threadId: string;
  userId: string;
  workspaceId: string;
  title?: string;
  model?: string;
}) {
  const { threadId, userId, workspaceId, title, model } = input;

  await db
    .update(chatThreads)
    .set({
      updatedAt: sql`now()`,
      ...(title
        ? { title: sql`COALESCE(${chatThreads.title}, ${title})` }
        : {}),
      ...(model
        ? { model: sql`COALESCE(${chatThreads.model}, ${model})` }
        : {}),
    })
    .where(
      and(
        eq(chatThreads.id, threadId),
        eq(chatThreads.userId, userId),
        eq(chatThreads.workspaceId, workspaceId),
        isNull(chatThreads.deletedAt),
      ),
    );
}

/** Soft-delete a thread by stamping `deletedAt`. */
export async function softDeleteThread(
  threadId: string,
  userId: string,
  workspaceId: string,
) {
  const [thread] = await db
    .update(chatThreads)
    .set({ deletedAt: sql`now()` })
    .where(
      and(
        eq(chatThreads.id, threadId),
        eq(chatThreads.userId, userId),
        eq(chatThreads.workspaceId, workspaceId),
        isNull(chatThreads.deletedAt),
      ),
    )
    .returning();

  return thread ?? null;
}

/** Restore a soft-deleted thread by clearing `deletedAt`. */
export async function restoreThread(
  threadId: string,
  userId: string,
  workspaceId: string,
) {
  const [thread] = await db
    .update(chatThreads)
    .set({ deletedAt: null })
    .where(
      and(
        eq(chatThreads.id, threadId),
        eq(chatThreads.userId, userId),
        eq(chatThreads.workspaceId, workspaceId),
      ),
    )
    .returning();

  return thread ?? null;
}
