import { and, desc, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { createResource } from "@/lib/actions/resources";
import { db } from "@/lib/db";
import { resources } from "@/lib/db/schema/resources";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

export async function GET() {
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
      return NextResponse.json([]);
    }

    const rows = await db
      .select()
      .from(resources)
      .where(
        and(
          eq(resources.workspaceId, workspace.id),
          isNull(resources.deletedAt),
        ),
      )
      .orderBy(desc(resources.createdAt));

    return NextResponse.json(rows);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json().catch(() => null);
    const content = typeof body?.content === "string" ? body.content : "";

    if (!content.trim()) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 },
      );
    }

    const result = await createResource(content, workspace.id);
    if (!result.success || !result.resourceId) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Failed to create resource" },
        { status: 400 },
      );
    }

    const [resource] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, result.resourceId));

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
