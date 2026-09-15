import { and, count, desc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { documentAuditLogs } from "@/lib/db/schema/document-audit-logs";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

const KNOWN_ACTIONS = [
  "extract",
  "ingest",
  "delete",
  "restore",
  "permanent_delete",
  "template_create",
  "template_update",
  "template_delete",
] as const;

/** Parse the `action` query param: comma-separated, validated, deduped. */
function parseActions(raw: string | null): string[] {
  if (!raw) return [];
  const requested = raw
    .split(",")
    .map((a) => a.trim())
    .filter((a): a is (typeof KNOWN_ACTIONS)[number] =>
      (KNOWN_ACTIONS as readonly string[]).includes(a),
    );
  return [...new Set(requested)];
}

/**
 * Paginated list of document audit logs (immutable), scoped to the
 * current user + active workspace.
 */
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

    const actions = parseActions(searchParams.get("action"));
    const where = and(
      eq(documentAuditLogs.userId, user.id),
      eq(documentAuditLogs.workspaceId, workspace.id),
      actions.length > 0 ? inArray(documentAuditLogs.action, actions) : undefined,
    );

    const [{ total }] = await db
      .select({ total: count() })
      .from(documentAuditLogs)
      .where(where);

    const logs = await db
      .select()
      .from(documentAuditLogs)
      .where(where)
      .orderBy(desc(documentAuditLogs.createdAt))
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
