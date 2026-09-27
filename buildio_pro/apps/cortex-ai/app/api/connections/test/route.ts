import { NextRequest, NextResponse } from "next/server";

import { probeConnection } from "@/lib/connectors/probe";
import { connectionTestSchema } from "@/lib/connectors/validation";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => null);
    const parsed = connectionTestSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    const input = parsed.data;

    if (input.type === "sqlite" || input.type === "mysql")
      return NextResponse.json(
        { ok: false, error: `${input.type} connections are not supported yet` },
        { status: 400 },
      );

    const probe = await probeConnection({
      type: input.type,
      host: input.host,
      port: input.port,
      database: input.database,
      username: input.username,
      password: input.password,
    });
    return NextResponse.json(probe);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
