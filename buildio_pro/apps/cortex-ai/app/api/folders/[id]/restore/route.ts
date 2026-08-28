import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { folders } from "@/lib/db/schema/folders";
import { and, eq, isNotNull } from "drizzle-orm";
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
      .from(folders)
      .where(and(eq(folders.id, id), isNotNull(folders.deletedAt)));

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Folder not found or not deleted" },
        { status: 404 },
      );
    }

    const membership = await getWorkspaceMembership(user.id, deleted.workspaceId);
    if (!membership) {
      return NextResponse.json(
        { success: false, error: "Folder not found" },
        { status: 404 },
      );
    }

    const [folder] = await db
      .update(folders)
      .set({ deletedAt: null })
      .where(eq(folders.id, id))
      .returning();

    return NextResponse.json({ folder });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}