import { and, eq, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { connections } from "@/lib/db/schema/connections";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const workspace = await getActiveWorkspace(user.id);
    if (!workspace)
      return NextResponse.json(
        { error: "No active workspace" },
        { status: 400 },
      );
    const { id } = await params;
    const [row] = await db
      .update(connections)
      .set({ deletedAt: null })
      .where(
        and(
          eq(connections.id, id),
          eq(connections.workspaceId, workspace.id),
          isNotNull(connections.deletedAt),
        ),
      )
      .returning();
    if (!row)
      return NextResponse.json(
        { error: "Deleted connection not found" },
        { status: 404 },
      );
    return NextResponse.json({ connection: { id: row.id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
