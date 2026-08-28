import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema/workspaces";
import { workspaceMembers } from "@/lib/db/schema/workspace-members";
import { slugify } from "@/lib/slug";

export const MAX_WORKSPACES_PER_USER = 5;
export const PERSONAL_WORKSPACE_NAME = "My Workspace";

/**
 * Returns the active, non-deleted workspace for a user, or null.
 */
export async function getActiveWorkspace(userId: string) {
  const rows = await db
    .select({ workspace: workspaces })
    .from(workspaceMembers)
    .innerJoin(
      workspaces,
      and(
        eq(workspaceMembers.workspaceId, workspaces.id),
        isNull(workspaces.deletedAt),
      ),
    )
    .where(
      and(
        eq(workspaceMembers.userId, userId),
        eq(workspaceMembers.isActive, true),
      ),
    )
    .limit(1);

  return rows[0]?.workspace ?? null;
}

/**
 * Returns the membership a user has in a given workspace, or null.
 */
export async function getWorkspaceMembership(userId: string, workspaceId: string) {
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.userId, userId),
        eq(workspaceMembers.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  return membership ?? null;
}

/**
 * Creates the default personal workspace for a user on their first sign-up.
 * Idempotent — does nothing if the user already belongs to any workspace.
 */
export async function ensurePersonalWorkspace(userId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId));

  if (total > 0) return;

  const slug = `${slugify(PERSONAL_WORKSPACE_NAME)}-${userId.slice(0, 8)}`;

  const [workspace] = await db
    .insert(workspaces)
    .values({
      name: PERSONAL_WORKSPACE_NAME,
      slug,
      isPersonal: true,
      createdBy: userId,
    })
    .returning();

  await db.insert(workspaceMembers).values({
    workspaceId: workspace.id,
    userId,
    role: "owner",
    isActive: true,
    position: 0,
  });

  return workspace;
}

/**
 * Counts how many non-deleted workspaces a user currently belongs to.
 */
export async function countUserWorkspaces(userId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(workspaceMembers)
    .innerJoin(
      workspaces,
      and(
        eq(workspaceMembers.workspaceId, workspaces.id),
        isNull(workspaces.deletedAt),
      ),
    )
    .where(eq(workspaceMembers.userId, userId));

  return total;
}

/**
 * Sets the active workspace for a user. Returns true on success,
 * false when the user has no membership in that workspace.
 */
export async function setActiveWorkspace(userId: string, workspaceId: string) {
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.userId, userId),
        eq(workspaceMembers.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  if (!membership) return false;

  await db
    .update(workspaceMembers)
    .set({ isActive: false })
    .where(eq(workspaceMembers.userId, userId));

  await db
    .update(workspaceMembers)
    .set({ isActive: true })
    .where(eq(workspaceMembers.id, membership.id));

  return true;
}

/**
 * Returns a non-deleted workspace by id, or null.
 */
export async function getWorkspace(workspaceId: string) {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.id, workspaceId), isNull(workspaces.deletedAt)))
    .limit(1);

  return workspace ?? null;
}