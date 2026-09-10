import { and, count, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { chatAuditLogs } from "@/lib/db/schema/chat-audit-logs";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
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
      return NextResponse.json({
        logs: [],
        total: 0,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        pageCount: 1,
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const rawPage = Number(searchParams.get("page") ?? "1");
    const rawPageSize = Number(
      searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
    );
    const page =
      Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize =
      Number.isFinite(rawPageSize) && rawPageSize > 0
        ? Math.min(Math.floor(rawPageSize), MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE;

    const where = and(
      eq(chatAuditLogs.userId, user.id),
      eq(chatAuditLogs.workspaceId, workspace.id),
    );

    const [{ total }] = await db
      .select({ total: count() })
      .from(chatAuditLogs)
      .where(where);

    const logs = await db
      .select()
      .from(chatAuditLogs)
      .where(where)
      .orderBy(desc(chatAuditLogs.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const pageCount = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({ logs, total, page, pageSize, pageCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
