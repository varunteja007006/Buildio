import { AgentPlaygroundPageView } from "@/components/pages/agent-playground-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AgentPlaygroundPageView agentId={id} />;
}
