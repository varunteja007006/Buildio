import { and, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getOrCreateEmptyThread } from "@/lib/chat/threads";
import { db } from "@/lib/db";
import { chatMessages } from "@/lib/db/schema/messages";
import { chatThreads } from "@/lib/db/schema/threads";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const workspace = await getActiveWorkspace(user.id);
    if (!workspace) {
      return NextResponse.json({ threads: [], nextOffset: null });
    }

    const searchParams = request.nextUrl.searchParams;

    const parsedOffset = Number(searchParams.get("offset"));
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;

    const parsedLimit = Number(searchParams.get("limit"));
    const limit = Math.min(
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? parsedLimit
        : DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE,
    );

    const showDeleted = searchParams.get("deleted") === "true";

    const rows = await db
      .select({
        id: chatThreads.id,
        title: chatThreads.title,
        createdAt: chatThreads.createdAt,
        updatedAt: chatThreads.updatedAt,
        deletedAt: chatThreads.deletedAt,
        messageCount: sql<number>`(
          SELECT count(*) FROM ${chatMessages}
          WHERE ${chatMessages.threadId} = ${chatThreads.id}
        )`,
        lastMessage: sql<string | null>`(
          SELECT ${chatMessages.content} FROM ${chatMessages}
          WHERE ${chatMessages.threadId} = ${chatThreads.id}
          ORDER BY ${chatMessages.createdAt} DESC
          LIMIT 1
        )`,
      })
      .from(chatThreads)
      .where(
        and(
          eq(chatThreads.userId, user.id),
          eq(chatThreads.workspaceId, workspace.id),
          showDeleted
            ? isNotNull(chatThreads.deletedAt)
            : isNull(chatThreads.deletedAt),
        ),
      )
      .orderBy(desc(chatThreads.updatedAt))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = rows.length > limit;
    const threads = rows.slice(0, limit);

    return NextResponse.json({
      threads,
      nextOffset: hasMore ? offset + threads.length : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const workspace = await getActiveWorkspace(user.id);
    if (!workspace) {
      return NextResponse.json(
        { success: false, error: "No active workspace" },
        { status: 400 },
      );
    }

    const thread = await getOrCreateEmptyThread(user.id, workspace.id);

    return NextResponse.json({
      thread: { ...thread, messageCount: 0, lastMessage: null },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
