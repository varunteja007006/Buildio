import { inArray } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { embeddings } from "@/lib/db/schema/embeddings";
import { extractions } from "@/lib/db/schema/extractions";
import { resources } from "@/lib/db/schema/resources";

/**
 * Hard-delete helpers (H3): permanently removing documents deletes their
 * embeddings, resources, and extractions (versions cascade via FK), plus the
 * UploadThing file. `extraction_versions` rows only disappear here because
 * their extraction row is gone — in soft-delete flows they are never touched.
 */

/** Extract the UploadThing file key from a CDN URL (`.../f/<key>`). */
export function extractUploadThingKey(filepath: string): string | null {
  try {
    const url = new URL(filepath);
    if (
      !url.hostname.endsWith("utfs.io") &&
      !url.hostname.endsWith("uploadthing.com")
    ) {
      return null;
    }
    const key = url.pathname.split("/").filter(Boolean).pop();
    return key ?? null;
  } catch {
    return null;
  }
}

/** Best-effort: delete the UploadThing files behind these document URLs. */
export async function deleteUploadThingFiles(filepaths: string[]) {
  const keys = filepaths
    .map(extractUploadThingKey)
    .filter((key): key is string => key !== null);
  if (keys.length === 0) return;
  try {
    await new UTApi().deleteFiles(keys);
  } catch (error) {
    // Storage cleanup must not block the DB delete; surface for debugging.
    console.error("[documents] UploadThing deleteFiles failed:", error);
  }
}

/** Hard-delete the given documents' cascade children, then the rows. */
export async function hardDeleteDocumentRows(documentIds: string[]) {
  if (documentIds.length === 0) return;
  await db
    .delete(embeddings)
    .where(
      inArray(
        embeddings.resourceId,
        db
          .select({ id: resources.id })
          .from(resources)
          .where(inArray(resources.documentId, documentIds)),
      ),
    );
  await db
    .delete(resources)
    .where(inArray(resources.documentId, documentIds));
  await db.delete(extractions).where(inArray(extractions.documentId, documentIds));
  await db.delete(documents).where(inArray(documents.id, documentIds));
}
