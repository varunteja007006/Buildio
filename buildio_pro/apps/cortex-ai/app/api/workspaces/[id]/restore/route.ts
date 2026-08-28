import { NextResponse } from "next/server";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { workspaces } from "@/lib/db/schema/workspaces";
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

    const membership = await getWorkspaceMembership(user.id, id);
    if (!membership) {
      return NextResponse.json(
        { success: false, error: "Workspace not found" },
        { status: 404 },
      );
    }

    if (membership.role !== "owner") {
      return NextResponse.json(
        { success: false, error: "Only the workspace owner can restore it" },
        { status: 403 },
      );
    }

    const [deleted] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id))
      .limit(1);

    if (!deleted || !deleted.deletedAt) {
      return NextResponse.json(
        { success: false, error: "Workspace not found or not deleted" },
        { status: 404 },
      );
    }

    const [workspace] = await db
      .update(workspaces)
      .set({ deletedAt: null })
      .where(and(eq(workspaces.id, id), isNotNull(workspaces.deletedAt)))
      .returning();

    return NextResponse.json({ workspace });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}