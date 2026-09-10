import { and, eq, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { restoreThread } from "@/lib/chat/threads";
import { db } from "@/lib/db";
import { chatThreads } from "@/lib/db/schema/threads";
import { getCurrentUser } from "@/lib/session";
import { getWorkspaceMembership } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const [deleted] = await db
      .select()
      .from(chatThreads)
      .where(and(eq(chatThreads.id, id), isNotNull(chatThreads.deletedAt)));

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Thread not found or not deleted" },
        { status: 404 },
      );
    }

    const membership = await getWorkspaceMembership(
      user.id,
      deleted.workspaceId,
    );
    if (!membership) {
      return NextResponse.json(
        { success: false, error: "Thread not found" },
        { status: 404 },
      );
    }

    const thread = await restoreThread(
      id,
      user.id,
      deleted.workspaceId,
    );

    return NextResponse.json({ thread });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
