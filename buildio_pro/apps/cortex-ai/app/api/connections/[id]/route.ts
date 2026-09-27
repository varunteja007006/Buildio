import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { decryptSecret, encryptSecret } from "@/lib/connectors/crypto";
import { probeConnection } from "@/lib/connectors/probe";
import {
  connectionUpdateSchema,
  DEFAULT_PORTS,
  type ConnectionType,
} from "@/lib/connectors/validation";
import { toConnectionView } from "@/lib/connectors/view";
import { db } from "@/lib/db";
import { connections } from "@/lib/db/schema/connections";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
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
    if (!row)
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 },
      );
    return NextResponse.json({ connection: toConnectionView(row) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
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
    const body = await request.json().catch(() => null);
    const parsed = connectionUpdateSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    const input = parsed.data;
    if (!Object.keys(input).length)
      return NextResponse.json(
        { error: "No valid changes supplied" },
        { status: 400 },
      );

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
    if (!existing || existing.type === "sqlite" || existing.type === "mysql")
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 },
      );

    if (input.name && input.name !== existing.name) {
      const [duplicate] = await db
        .select({ id: connections.id })
        .from(connections)
        .where(
          and(
            eq(connections.workspaceId, workspace.id),
            eq(connections.name, input.name),
            isNull(connections.deletedAt),
          ),
        )
        .limit(1);
      if (duplicate)
        return NextResponse.json(
          { error: "A connection with this name already exists" },
          { status: 409 },
        );
    }

    const type = existing.type as ConnectionType;
    const host = input.host ?? existing.host ?? "";
    const port = input.port ?? existing.port ?? DEFAULT_PORTS[type];
    const database = input.database ?? existing.database ?? "";
    const username = input.username ?? existing.username ?? "";
    const password = input.password
      ? input.password
      : existing.passwordEncrypted
        ? decryptSecret(existing.passwordEncrypted)
        : "";

    const probe = await probeConnection({
      type,
      host,
      port,
      database,
      username,
      password,
    });
    if (!probe.ok)
      return NextResponse.json(
        {
          error: `Connection check failed: ${probe.error ?? "unreachable"}`,
        },
        { status: 400 },
      );

    const [row] = await db
      .update(connections)
      .set({
        ...(input.name ? { name: input.name } : {}),
        ...(input.host ? { host: input.host } : {}),
        ...(input.port ? { port: input.port } : {}),
        ...(input.database ? { database: input.database } : {}),
        ...(input.username ? { username: input.username } : {}),
        ...(input.password
          ? { passwordEncrypted: encryptSecret(input.password) }
          : {}),
        status: "connected",
        lastCheckedAt: new Date(),
        lastError: null,
      })
      .where(
        and(
          eq(connections.id, id),
          eq(connections.workspaceId, workspace.id),
          isNull(connections.deletedAt),
        ),
      )
      .returning();

    return NextResponse.json({ connection: toConnectionView(row) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
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
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(connections.id, id),
          eq(connections.workspaceId, workspace.id),
          isNull(connections.deletedAt),
        ),
      )
      .returning();
    if (!row)
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 },
      );
    return NextResponse.json({ success: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
