import { and, eq, inArray, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { embeddings } from "@/lib/db/schema/embeddings";
import { extractions } from "@/lib/db/schema/extractions";
import { resources } from "@/lib/db/schema/resources";

/**
 * Soft-delete cascades tagged with a `deletedBatchId` (H5/H6): every row
 * deleted together gets the same batch id, so a restore only un-deletes the
 * rows that were trashed with the container — single-row deletes (e.g. an
 * extraction deleted on its own, or resources superseded by re-ingestion)
 * have a different (or null) batch id and stay deleted.
 */

/** Soft-delete a document's children (extractions → resources → embeddings). */
export async function softDeleteDocumentChildren(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  documentIds: string[],
  batchId: string,
) {
  if (documentIds.length === 0) return;
  await tx
    .update(extractions)
    .set({ deletedAt: sql`now()`, deletedBatchId: batchId })
    .where(
      and(
        inArray(extractions.documentId, documentIds),
        isNull(extractions.deletedAt),
      ),
    );
  await tx
    .update(resources)
    .set({ deletedAt: sql`now()`, deletedBatchId: batchId })
    .where(
      and(
        inArray(resources.documentId, documentIds),
        isNull(resources.deletedAt),
      ),
    );
  await tx
    .update(embeddings)
    .set({ deletedAt: sql`now()`, deletedBatchId: batchId })
    .where(
      and(
        inArray(
          embeddings.resourceId,
          tx
            .select({ id: resources.id })
            .from(resources)
            .where(
              and(
                inArray(resources.documentId, documentIds),
                eq(resources.deletedBatchId, batchId),
              ),
            ),
        ),
        isNull(embeddings.deletedAt),
      ),
    );
}

/** Un-delete the children that were trashed with the given documents. */
export async function restoreDocumentChildren(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  documentIds: string[],
  batchId: string,
) {
  if (documentIds.length === 0) return;
  await tx
    .update(extractions)
    .set({ deletedAt: null, deletedBatchId: null })
    .where(
      and(
        inArray(extractions.documentId, documentIds),
        eq(extractions.deletedBatchId, batchId),
      ),
    );
  await tx
    .update(resources)
    .set({ deletedAt: null, deletedBatchId: null })
    .where(
      and(
        inArray(resources.documentId, documentIds),
        eq(resources.deletedBatchId, batchId),
      ),
    );
  await tx
    .update(embeddings)
    .set({ deletedAt: null, deletedBatchId: null })
    .where(
      and(
        inArray(
          embeddings.resourceId,
          tx
            .select({ id: resources.id })
            .from(resources)
            .where(
              and(
                inArray(resources.documentId, documentIds),
                eq(resources.deletedBatchId, batchId),
              ),
            ),
        ),
        eq(embeddings.deletedBatchId, batchId),
      ),
    );
}

/** Soft-delete documents (batch-tagged) plus their cascade children. */
export async function softDeleteDocumentsCascade(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  documentIds: string[],
  batchId: string,
) {
  if (documentIds.length === 0) return;
  await tx
    .update(documents)
    .set({ deletedAt: sql`now()`, deletedBatchId: batchId })
    .where(
      and(inArray(documents.id, documentIds), isNull(documents.deletedAt)),
    );
  await softDeleteDocumentChildren(tx, documentIds, batchId);
}
