import { NextRequest, NextResponse } from "next/server";
import { asc, eq, max } from "drizzle-orm";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { workspaces } from "@/lib/db/schema/workspaces";
import { workspaceMembers } from "@/lib/db/schema/workspace-members";
import {
  countUserWorkspaces,
  ensurePersonalWorkspace,
  MAX_WORKSPACES_PER_USER,
  setActiveWorkspace,
} from "@/lib/workspaces";
import { slugify } from "@/lib/slug";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Guarantee a default personal workspace exists and is active
    await ensurePersonalWorkspace(user.id);

    const rows = await db
      .select({
        workspace: workspaces,
        role: workspaceMembers.role,
        isActive: workspaceMembers.isActive,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, user.id))
      .orderBy(asc(workspaceMembers.position), asc(workspaces.createdAt));

    const activeWorkspaceId =
      rows.find((row) => row.isActive)?.workspace.id ?? null;

    const workspaceList = rows.map((row) => ({
      ...row.workspace,
      role: row.role,
      isActive: row.isActive,
    }));

    return NextResponse.json({ workspaces: workspaceList, activeWorkspaceId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const description =
      typeof body?.description === "string" ? body.description.trim() : null;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Workspace name is required" },
        { status: 400 },
      );
    }

    const slug = slugify(name);
    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Workspace name must contain letters or numbers",
        },
        { status: 400 },
      );
    }

    const total = await countUserWorkspaces(user.id);
    if (total >= MAX_WORKSPACES_PER_USER) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum of ${MAX_WORKSPACES_PER_USER} workspaces allowed`,
        },
        { status: 409 },
      );
    }

    const [{ maxPosition }] = await db
      .select({ maxPosition: max(workspaceMembers.position) })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, user.id));

    const [workspace] = await db
      .insert(workspaces)
      .values({ name, slug, description, createdBy: user.id })
      .returning();

    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: user.id,
      role: "owner",
      position: (maxPosition ?? 0) + 1,
    });

    // Make the newly created workspace active
    await setActiveWorkspace(user.id, workspace.id);

    return NextResponse.json(
      { workspace: { ...workspace, role: "owner", isActive: true } },
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