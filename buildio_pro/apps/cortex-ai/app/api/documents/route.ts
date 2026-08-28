import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

const SORTABLE_COLUMNS = {
  filename: documents.filename,
  filepath: documents.filepath,
  fileHash: documents.fileHash,
  ingested: documents.ingested,
  createdAt: documents.createdAt,
  updatedAt: documents.updatedAt,
} as const;

type SortColumn = keyof typeof SORTABLE_COLUMNS;

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
      return NextResponse.json({ documents: [], total: 0, page: 1, pageSize: 10, pageCount: 1 });
    }

    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const rawPage = Number(searchParams.get("page") ?? "1");
    const rawPageSize = Number(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE));
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize =
      Number.isFinite(rawPageSize) && rawPageSize > 0
        ? Math.min(Math.floor(rawPageSize), MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE;

    // Sorting
    const sort = searchParams.get("sort") ?? "createdAt";
    const sortDir = searchParams.get("sortDir") ?? "desc";
    const sortableColumn =
      sort in SORTABLE_COLUMNS ? SORTABLE_COLUMNS[sort as SortColumn] : documents.createdAt;
    const order = sortDir === "asc" ? asc(sortableColumn) : desc(sortableColumn);

    // Filters
    const conditions: SQL[] = [eq(documents.workspaceId, workspace.id)];

    const search = searchParams.get("search")?.trim();
    if (search) {
      const pattern = `%${search}%`;
      const searchCondition = or(
        ilike(documents.filename, pattern),
        ilike(documents.filepath, pattern),
        ilike(documents.fileHash, pattern),
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    const status = searchParams.get("status");
    if (status === "ingested") {
      conditions.push(eq(documents.ingested, true));
    } else if (status === "pending") {
      conditions.push(eq(documents.ingested, false));
    }

    const folderId = searchParams.get("folderId");
    if (folderId) {
      conditions.push(eq(documents.folderId, folderId));
    }
    const topicId = searchParams.get("topicId");
    if (topicId) {
      conditions.push(eq(documents.topicId, topicId));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Count for total + page count
    const [{ total }] = await db
      .select({ total: count() })
      .from(documents)
      .where(where);

    // Fetch the requested page
    const pageDocuments = await db
      .select()
      .from(documents)
      .where(where)
      .orderBy(order)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const pageCount = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      documents: pageDocuments,
      total,
      page,
      pageSize,
      pageCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}