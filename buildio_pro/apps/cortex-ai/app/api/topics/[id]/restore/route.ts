import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics } from "@/lib/db/schema/topics";
import { and, count, eq, isNotNull, isNull } from "drizzle-orm";
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
      .from(topics)
      .where(and(eq(topics.id, id), isNotNull(topics.deletedAt)));

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Topic not found or not deleted" },
        { status: 404 },
      );
    }

    const membership = await getWorkspaceMembership(user.id, deleted.workspaceId);
    if (!membership) {
      return NextResponse.json(
        { success: false, error: "Topic not found" },
        { status: 404 },
      );
    }

    // Slug must not collide with an active topic in the same workspace
    const [{ slugCount }] = await db
      .select({ slugCount: count() })
      .from(topics)
      .where(
        and(
          eq(topics.workspaceId, deleted.workspaceId),
          isNull(topics.deletedAt),
          eq(topics.slug, deleted.slug),
        ),
      );

    if (slugCount > 0) {
      return NextResponse.json(
        { success: false, error: "A topic with this name already exists" },
        { status: 409 },
      );
    }

    const [topic] = await db
      .update(topics)
      .set({ deletedAt: null })
      .where(eq(topics.id, id))
      .returning();

    return NextResponse.json({ topic });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}