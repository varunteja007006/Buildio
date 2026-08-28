import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chatThreads } from "@/lib/db/schema/threads";
import { chatMessages } from "@/lib/db/schema/messages";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
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

    const { id } = await params;

    const [thread] = await db
      .select()
      .from(chatThreads)
      .where(
        and(
          eq(chatThreads.id, id),
          eq(chatThreads.userId, user.id),
          eq(chatThreads.workspaceId, workspace.id),
        ),
      );

    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Thread not found" },
        { status: 404 },
      );
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.threadId, id))
      .orderBy(asc(chatMessages.createdAt));

    return NextResponse.json({ thread, messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
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

    const { id } = await params;

    const body = await request.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Thread title is required" },
        { status: 400 },
      );
    }

    const [thread] = await db
      .update(chatThreads)
      .set({ title })
      .where(
        and(
          eq(chatThreads.id, id),
          eq(chatThreads.userId, user.id),
          eq(chatThreads.workspaceId, workspace.id),
        ),
      )
      .returning();

    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Thread not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ thread });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}