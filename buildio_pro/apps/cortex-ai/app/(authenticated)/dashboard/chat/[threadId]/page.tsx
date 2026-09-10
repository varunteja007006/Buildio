import { ChatThreadPage } from "@/components/pages/chat-thread";

export default async function Page({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  return <ChatThreadPage threadId={threadId} />;
}
