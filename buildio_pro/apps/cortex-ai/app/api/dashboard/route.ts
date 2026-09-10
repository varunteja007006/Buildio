import { and, count, desc, eq, isNull, sum } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { chatAuditLogs } from "@/lib/db/schema/chat-audit-logs";
import { documents } from "@/lib/db/schema/documents";
import { chatMessages } from "@/lib/db/schema/messages";
import { chatThreads } from "@/lib/db/schema/threads";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

const RECENT_LIMIT = 5;

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
      return NextResponse.json({
        stats: {
          threads: 0,
          messages: 0,
          documents: 0,
          totalTokens: 0,
          flaggedQueries: 0,
          blockedQueries: 0,
        },
        recentLogs: [],
      });
    }

    const auditScope = and(
      eq(chatAuditLogs.userId, user.id),
      eq(chatAuditLogs.workspaceId, workspace.id),
    );

    const [
      [threadRow],
      [messageRow],
      [documentRow],
      [tokenRow],
      [flaggedRow],
      [blockedRow],
      recentLogs,
    ] = await Promise.all([
      db
        .select({ total: count() })
        .from(chatThreads)
        .where(
          and(
            eq(chatThreads.userId, user.id),
            eq(chatThreads.workspaceId, workspace.id),
            isNull(chatThreads.deletedAt),
          ),
        ),
      db
        .select({ total: count() })
        .from(chatMessages)
        .innerJoin(
          chatThreads,
          eq(chatMessages.threadId, chatThreads.id),
        )
        .where(
          and(
            eq(chatThreads.userId, user.id),
            eq(chatThreads.workspaceId, workspace.id),
            isNull(chatThreads.deletedAt),
          ),
        ),
      db
        .select({ total: count() })
        .from(documents)
        .where(eq(documents.workspaceId, workspace.id)),
      db
        .select({ total: sum(chatAuditLogs.totalTokens) })
        .from(chatAuditLogs)
        .where(auditScope),
      db
        .select({ total: count() })
        .from(chatAuditLogs)
        .where(and(auditScope, eq(chatAuditLogs.guardrailFlagged, true))),
      db
        .select({ total: count() })
        .from(chatAuditLogs)
        .where(and(auditScope, eq(chatAuditLogs.guardrailBlocked, true))),
      db
        .select()
        .from(chatAuditLogs)
        .where(auditScope)
        .orderBy(desc(chatAuditLogs.createdAt))
        .limit(RECENT_LIMIT),
    ]);

    return NextResponse.json({
      stats: {
        threads: threadRow?.total ?? 0,
        messages: messageRow?.total ?? 0,
        documents: documentRow?.total ?? 0,
        totalTokens: Number(tokenRow?.total ?? 0),
        flaggedQueries: flaggedRow?.total ?? 0,
        blockedQueries: blockedRow?.total ?? 0,
      },
      recentLogs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
