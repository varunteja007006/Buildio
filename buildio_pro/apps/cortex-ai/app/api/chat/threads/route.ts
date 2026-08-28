import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { chatThreads } from "@/lib/db/schema/threads";
import { chatMessages } from "@/lib/db/schema/messages";
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

    const rows = await db
      .select({
        id: chatThreads.id,
        title: chatThreads.title,
        createdAt: chatThreads.createdAt,
        updatedAt: chatThreads.updatedAt,
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

    // Reuse an existing thread that has no messages yet, if one exists.
    const [existing] = await db
      .select()
      .from(chatThreads)
      .where(
        and(
          eq(chatThreads.userId, user.id),
          eq(chatThreads.workspaceId, workspace.id),
          sql`NOT EXISTS (
            SELECT 1 FROM ${chatMessages}
            WHERE ${chatMessages.threadId} = ${chatThreads.id}
          )`,
        ),
      )
      .orderBy(desc(chatThreads.createdAt))
      .limit(1);

    if (existing) {
      return NextResponse.json({
        thread: { ...existing, messageCount: 0, lastMessage: null },
      });
    }

    const [thread] = await db
      .insert(chatThreads)
      .values({ userId: user.id, workspaceId: workspace.id })
      .returning();

    return NextResponse.json(
      { thread: { ...thread, messageCount: 0, lastMessage: null } },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}