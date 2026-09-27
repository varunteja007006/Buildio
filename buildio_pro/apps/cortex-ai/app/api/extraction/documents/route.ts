import { and, count, desc, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { extractionTemplates } from "@/lib/db/schema/extraction-templates";
import { extractions } from "@/lib/db/schema/extractions";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

const MAX_PAGE_SIZE = 100;

/** Paginated list of extractions with their document and template info. */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const workspace = await getActiveWorkspace(user.id);
    if (!workspace)
      return NextResponse.json({
        extractions: [],
        total: 0,
        page: 1,
        pageSize: 10,
        pageCount: 0,
      });

    const page = Math.max(
      1,
      Number(request.nextUrl.searchParams.get("page")) || 1,
    );
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(request.nextUrl.searchParams.get("pageSize")) || 10),
    );

    const where = and(
      eq(documents.workspaceId, workspace.id),
      isNull(extractions.deletedAt),
      isNull(documents.deletedAt),
    );

    const [{ total }] = await db
      .select({ total: count() })
      .from(extractions)
      .innerJoin(documents, eq(extractions.documentId, documents.id))
      .where(where);

    const rows = await db
      .select({
        id: extractions.id,
        documentId: extractions.documentId,
        filename: documents.filename,
        templateId: extractions.templateId,
        templateName: extractionTemplates.name,
        status: extractions.status,
        approved: extractions.approved,
        createdAt: extractions.createdAt,
        updatedAt: extractions.updatedAt,
      })
      .from(extractions)
      .innerJoin(documents, eq(extractions.documentId, documents.id))
      .leftJoin(
        extractionTemplates,
        eq(extractions.templateId, extractionTemplates.id),
      )
      .where(where)
      .orderBy(desc(extractions.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return NextResponse.json({
      extractions: rows,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
