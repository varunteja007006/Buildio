import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

const DOCS_DIR = path.join(process.cwd(), "docs");

export async function GET() {
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
      return NextResponse.json(
        { success: false, error: "No active workspace" },
        { status: 400 },
      );
    }

    // Ensure docs directory exists
    try {
      await fs.access(DOCS_DIR);
    } catch {
      await fs.mkdir(DOCS_DIR, { recursive: true });
    }

    const dirEntries = await fs.readdir(DOCS_DIR, { withFileTypes: true });
    const files = dirEntries.filter(
      (e) => e.isFile() && !e.name.startsWith("."),
    );

    const results: {
      filename: string;
      filepath: string;
      fileHash: string;
      ingested: boolean;
      status: "new" | "existing" | "unchanged";
    }[] = [];

    for (const file of files) {
      const filepath = path.join(DOCS_DIR, file.name);
      const content = await fs.readFile(filepath);
      const fileHash = crypto.createHash("sha256").update(content).digest("hex");

      // Check if file already tracked in this workspace
      const existing = await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.workspaceId, workspace.id),
            eq(documents.fileHash, fileHash),
          ),
        )
        .limit(1);

      if (existing.length === 0) {
        // New file — insert with ingested=false
        await db.insert(documents).values({
          workspaceId: workspace.id,
          filename: file.name,
          filepath: filepath,
          fileHash,
          ingested: false,
        });
        results.push({
          filename: file.name,
          filepath,
          fileHash,
          ingested: false,
          status: "new",
        });
      } else {
        results.push({
          filename: file.name,
          filepath,
          fileHash,
          ingested: existing[0].ingested,
          status: "existing",
        });
      }
    }

    return NextResponse.json({
      success: true,
      scanned: files.length,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}