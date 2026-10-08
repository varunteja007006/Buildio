import { inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { embeddings } from "@/lib/db/schema/embeddings";
import { extractions } from "@/lib/db/schema/extractions";
import { resources } from "@/lib/db/schema/resources";
import { deleteDocumentObject } from "@/lib/storage/s3";

/**
 * Hard-delete helpers (H3): permanently removing documents deletes their
 * embeddings, resources, and extractions (versions cascade via FK), plus the
 * stored file. `extraction_versions` rows only disappear here because
 * their extraction row is gone — in soft-delete flows they are never touched.
 */

/** Best-effort cleanup of MinIO objects. */
export async function deleteDocumentFiles(filepaths: string[]) {
  // Legacy remote URLs remain readable but cannot be deleted without their API.
  const objectKeys = filepaths.filter(
    (filepath) =>
      !filepath.startsWith("http://") && !filepath.startsWith("https://"),
  );
  try {
    await Promise.all(objectKeys.map(deleteDocumentObject));
  } catch (error) {
    // Storage cleanup must not block the DB delete; surface for debugging.
    console.error("[documents] object cleanup failed:", error);
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
  await db.delete(resources).where(inArray(resources.documentId, documentIds));
  await db
    .delete(extractions)
    .where(inArray(extractions.documentId, documentIds));
  await db.delete(documents).where(inArray(documents.id, documentIds));
}
