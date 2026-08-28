import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { workspaces } from "@/lib/db/schema/workspaces";
import { getWorkspaceMembership, setActiveWorkspace } from "@/lib/workspaces";

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

    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id))
      .limit(1);

    if (!workspace || workspace.deletedAt) {
      return NextResponse.json(
        { success: false, error: "Workspace not found" },
        { status: 404 },
      );
    }

    const activated = await setActiveWorkspace(user.id, id);
    if (!activated) {
      return NextResponse.json(
        { success: false, error: "Workspace not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      workspace: { ...workspace, role: membership.role, isActive: true },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}