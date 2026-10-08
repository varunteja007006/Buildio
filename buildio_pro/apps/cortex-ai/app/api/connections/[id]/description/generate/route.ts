import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { streamConnectorDescription } from "@/lib/connectors/generate-description";
import { db } from "@/lib/db";
import { connections } from "@/lib/db/schema/connections";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

const schema = z
  .object({
    metadataTables: z
      .array(
        z
          .object({
            schema: z.string().min(1).max(128),
            table: z.string().min(1).max(128),
          })
          .strict(),
      )
      .min(1)
      .max(200),
    includeSamples: z.boolean().default(false),
    samples: z
      .array(
        z
          .object({
            schema: z.string().min(1).max(128),
            table: z.string().min(1).max(128),
            columns: z.array(z.string().min(1).max(128)).min(1).max(20),
          })
          .strict(),
      )
      .max(5)
      .default([]),
  })
  .strict()
  .refine((data) => data.includeSamples || data.samples.length === 0, {
    message: "Sample selection requires explicit consent",
  });

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const workspace = await getActiveWorkspace(user.id);
  if (!workspace)
    return NextResponse.json({ error: "No active workspace" }, { status: 400 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );

  const { id } = await params;
  const [connection] = await db
    .select({ type: connections.type, database: connections.database })
    .from(connections)
    .where(
      and(
        eq(connections.id, id),
        eq(connections.workspaceId, workspace.id),
        eq(connections.type, "postgres"),
        eq(connections.status, "connected"),
        isNull(connections.deletedAt),
      ),
    )
    .limit(1);
  if (!connection)
    return NextResponse.json(
      { error: "Connected Postgres connector not found" },
      { status: 404 },
    );

  const stream = streamConnectorDescription({
    connectionId: id,
    workspaceId: workspace.id,
    connectionType: connection.type,
    database: connection.database,
    ...parsed.data,
    signal: request.signal,
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
    },
  });
}
