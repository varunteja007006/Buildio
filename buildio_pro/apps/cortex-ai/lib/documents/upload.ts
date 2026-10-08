import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { folders } from "@/lib/db/schema/folders";

export async function getUploadDestination(
  workspaceId: string,
  folderId?: string,
) {
  if (!folderId) return { folderId: null, topicId: null };
  const [folder] = await db
    .select({ id: folders.id, topicId: folders.topicId })
    .from(folders)
    .where(
      and(
        eq(folders.id, folderId),
        eq(folders.workspaceId, workspaceId),
        isNull(folders.deletedAt),
      ),
    )
    .limit(1);
  return folder ? { folderId: folder.id, topicId: folder.topicId } : null;
}
