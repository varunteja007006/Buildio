import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { folders } from "@/lib/db/schema/folders";
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
      .select({ workspaceId: folders.workspaceId })
      .from(folders)
      .where(eq(folders.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Folder not found" },
        { status: 404 },
      );
    }

    const membership = await getWorkspaceMembership(user.id, existing.workspaceId);
    if (!membership) {
      return NextResponse.json(
        { success: false, error: "Folder not found" },
        { status: 404 },
      );
    }

    // Cascades to child folders (folders.parent_folder_id ON DELETE CASCADE);
    // documents.folder_id is set to null.
    const [deleted] = await db
      .delete(folders)
      .where(eq(folders.id, id))
      .returning({ id: folders.id });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Folder not found" },
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