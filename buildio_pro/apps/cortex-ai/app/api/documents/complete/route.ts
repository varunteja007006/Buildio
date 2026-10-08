import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { getUploadDestination } from "@/lib/documents/upload";
import { getCurrentUser } from "@/lib/session";
import { documentObjectExists, MAX_DOCUMENT_SIZE } from "@/lib/storage/s3";
import { getActiveWorkspace } from "@/lib/workspaces";

const inputSchema = z.object({
  key: z.string().min(1),
  filename: z.string().trim().min(1).max(255),
  fileSize: z.number().int().positive().max(MAX_DOCUMENT_SIZE),
  fileHash: z.string().regex(/^[\da-f]{64}$/),
  folderId: z.string().nullable().optional(),
});

export async function POST(request: Request) {
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

    const parsed = inputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid upload details" },
        { status: 400 },
      );
    }
    const { key, filename, fileSize, fileHash, folderId } = parsed.data;
    if (!key.startsWith(`documents/${workspace.id}/`)) {
      return NextResponse.json(
        { error: "Invalid document key" },
        { status: 403 },
      );
    }
    const destination = await getUploadDestination(
      workspace.id,
      folderId ?? undefined,
    );
    if (!destination)
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    if (!(await documentObjectExists(key, fileSize))) {
      return NextResponse.json(
        { error: "Uploaded file was not found" },
        { status: 400 },
      );
    }

    const [existing] = await db
      .select({ id: documents.id, filename: documents.filename })
      .from(documents)
      .where(
        and(
          eq(documents.workspaceId, workspace.id),
          eq(documents.filepath, key),
        ),
      )
      .limit(1);
    if (existing) return NextResponse.json({ name: existing.filename, key });

    await db.insert(documents).values({
      workspaceId: workspace.id,
      filename,
      filepath: key,
      fileHash,
      folderId: destination.folderId,
      topicId: destination.topicId,
      ingested: false,
    });
    return NextResponse.json({ name: filename, key });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
