import { and, eq, inArray, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { folders } from "@/lib/db/schema/folders";
import { topics } from "@/lib/db/schema/topics";

import {
  restoreDocumentChildren,
  softDeleteDocumentsCascade,
} from "./document-cascade";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Container (topic/folder) delete/restore cascades (H11/H12). Deleting a
 * topic or folder soft-deletes its whole subtree plus every document in it
 * (and those documents' extractions/resources/embeddings), all tagged with
 * one `deletedBatchId` so restoring the container brings back exactly that
 * batch — not rows deleted individually before or after.
 */

function collectDescendants(
  rows: { id: string; parentFolderId: string | null }[],
  rootId: string,
): string[] {
  const childrenByParent = new Map<string, string[]>();
  for (const row of rows) {
    if (!row.parentFolderId) continue;
    const list = childrenByParent.get(row.parentFolderId) ?? [];
    list.push(row.id);
    childrenByParent.set(row.parentFolderId, list);
  }
  const result: string[] = [];
  const stack = [rootId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const child of childrenByParent.get(current) ?? []) {
      result.push(child);
      stack.push(child);
    }
  }
  return result;
}

/** A folder subtree: the root folder plus all its active descendants. */
async function collectFolderSubtreeIds(
  tx: Tx,
  rootFolderId: string,
): Promise<string[]> {
  const rows = await tx
    .select({ id: folders.id, parentFolderId: folders.parentFolderId })
    .from(folders)
    .where(isNull(folders.deletedAt));
  return [rootFolderId, ...collectDescendants(rows, rootFolderId)];
}

async function softDeleteFoldersAndDocs(
  tx: Tx,
  folderIds: string[],
  batchId: string,
  topicId?: string,
) {
  if (folderIds.length > 0) {
    await tx
      .update(folders)
      .set({ deletedAt: sql`now()`, deletedBatchId: batchId })
      .where(and(inArray(folders.id, folderIds), isNull(folders.deletedAt)));
  }
  const docIds = (
    await tx
      .select({ id: documents.id })
      .from(documents)
      .where(
        and(
          isNull(documents.deletedAt),
          topicId
            ? // Topic delete: every document of the topic (folder rows included)
              eq(documents.topicId, topicId)
            : inArray(documents.folderId, folderIds),
        ),
      )
  ).map((row) => row.id);
  await softDeleteDocumentsCascade(tx, docIds, batchId);
}

/** Soft-delete a folder, its subtree, and every document inside it. */
export async function softDeleteFolderCascade(tx: Tx, folderId: string) {
  const batchId = crypto.randomUUID();
  const folderIds = await collectFolderSubtreeIds(tx, folderId);
  await softDeleteFoldersAndDocs(tx, folderIds, batchId);
  return batchId;
}

/** Soft-delete a topic, its folder trees, and all of its documents. */
export async function softDeleteTopicCascade(tx: Tx, topicId: string) {
  const batchId = crypto.randomUUID();
  const rootFolderIds = (
    await tx
      .select({ id: folders.id })
      .from(folders)
      .where(
        and(
          eq(folders.topicId, topicId),
          isNull(folders.deletedAt),
          isNull(folders.parentFolderId),
        ),
      )
  ).map((row) => row.id);
  const folderIds: string[] = [];
  for (const rootId of rootFolderIds) {
    folderIds.push(...(await collectFolderSubtreeIds(tx, rootId)));
  }
  await tx
    .update(topics)
    .set({ deletedAt: sql`now()`, deletedBatchId: batchId })
    .where(and(eq(topics.id, topicId), isNull(topics.deletedAt)));
  await softDeleteFoldersAndDocs(tx, folderIds, batchId, topicId);
  return batchId;
}

async function restoreFolderRows(tx: Tx, folderIds: string[]) {
  if (folderIds.length === 0) return;
  await tx
    .update(folders)
    .set({ deletedAt: null, deletedBatchId: null })
    .where(inArray(folders.id, folderIds));
}

async function restoreDocsByBatch(
  tx: Tx,
  batchId: string,
  scope: { topicId?: string; folderIds?: string[] },
) {
  const docRows = await tx
    .select({ id: documents.id })
    .from(documents)
    .where(
      and(
        eq(documents.deletedBatchId, batchId),
        scope.topicId
          ? eq(documents.topicId, scope.topicId)
          : inArray(documents.folderId, scope.folderIds ?? []),
      ),
    );
  const docIds = docRows.map((row) => row.id);
  if (docIds.length === 0) return;
  await tx
    .update(documents)
    .set({ deletedAt: null, deletedBatchId: null })
    .where(inArray(documents.id, docIds));
  await restoreDocumentChildren(tx, docIds, batchId);
}

/**
 * Restore a folder subtree plus the documents (and children) trashed with
 * it. Only rows carrying the container's `deletedBatchId` come back.
 */
export async function restoreFolderCascade(tx: Tx, folderId: string) {
  const [folder] = await tx
    .select({ deletedBatchId: folders.deletedBatchId })
    .from(folders)
    .where(eq(folders.id, folderId))
    .limit(1);
  const batchId = folder?.deletedBatchId;
  await restoreFolderRows(tx, [folderId]);
  if (!batchId) return;
  const folderRows = await tx
    .select({ id: folders.id })
    .from(folders)
    .where(eq(folders.deletedBatchId, batchId));
  const folderIds = folderRows.map((row) => row.id);
  await restoreFolderRows(tx, folderIds);
  await restoreDocsByBatch(tx, batchId, { folderIds });
}

/** Restore a topic, its folder tree, and the batch of trashed documents. */
export async function restoreTopicCascade(tx: Tx, topicId: string) {
  const [topic] = await tx
    .select({ deletedBatchId: topics.deletedBatchId })
    .from(topics)
    .where(eq(topics.id, topicId))
    .limit(1);
  const batchId = topic?.deletedBatchId;
  await tx
    .update(topics)
    .set({ deletedAt: null, deletedBatchId: null })
    .where(eq(topics.id, topicId));
  if (!batchId) return;
  const folderRows = await tx
    .select({ id: folders.id })
    .from(folders)
    .where(eq(folders.deletedBatchId, batchId));
  const folderIds = folderRows.map((row) => row.id);
  await restoreFolderRows(tx, folderIds);
  await restoreDocsByBatch(tx, batchId, { topicId });
}
