import { redirect } from "next/navigation";

import { getOrCreateEmptyThread } from "@/lib/chat/threads";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

/** "New Chat" entry point: resolves to a fresh (or reused empty) thread. */
export default async function NewChatPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const workspace = await getActiveWorkspace(user.id);
  if (!workspace) {
    redirect("/dashboard");
  }

  const thread = await getOrCreateEmptyThread(user.id, workspace.id);
  redirect(`/dashboard/chat/${thread.id}`);
}
