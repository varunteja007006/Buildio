import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics } from "@/lib/db/schema/topics";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/session";
import { getWorkspaceMembership } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const [existing] = await db
      .select({ workspaceId: topics.workspaceId })
      .from(topics)
      .where(eq(topics.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Topic not found" },
        { status: 404 },
      );
    }

    const membership = await getWorkspaceMembership(user.id, existing.workspaceId);
    if (!membership) {
      return NextResponse.json(
        { success: false, error: "Topic not found" },
        { status: 404 },
      );
    }

    // Cascades to folders (folders.topic_id ON DELETE CASCADE);
    // documents.topic_id is set to null.
    const [deleted] = await db
      .delete(topics)
      .where(eq(topics.id, id))
      .returning({ id: topics.id });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Topic not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}