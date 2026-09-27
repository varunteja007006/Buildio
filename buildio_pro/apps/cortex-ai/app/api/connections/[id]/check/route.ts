import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { decryptSecret } from "@/lib/connectors/crypto";
import { probeConnection } from "@/lib/connectors/probe";
import { toConnectionView } from "@/lib/connectors/view";
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
    const [existing] = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.id, id),
          eq(connections.workspaceId, workspace.id),
          isNull(connections.deletedAt),
        ),
      )
      .limit(1);
    if (!existing || existing.type !== "postgres")
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 },
      );

    const probe = await probeConnection({
      type: "postgres",
      host: existing.host ?? "",
      port: existing.port ?? 5432,
      database: existing.database ?? "",
      username: existing.username ?? "",
      password: existing.passwordEncrypted
        ? decryptSecret(existing.passwordEncrypted)
        : "",
    });

    const [row] = await db
      .update(connections)
      .set({
        status: probe.ok ? "connected" : "failed",
        lastCheckedAt: new Date(),
        lastError: probe.ok ? null : (probe.error ?? "Connection failed"),
      })
      .where(eq(connections.id, existing.id))
      .returning();

    return NextResponse.json({
      connection: toConnectionView(row),
      probe,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
