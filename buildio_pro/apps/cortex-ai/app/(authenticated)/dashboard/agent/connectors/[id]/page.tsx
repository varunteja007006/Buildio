import { AgentConnectorDetailPage } from "@/components/pages/agent-connector-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AgentConnectorDetailPage connectionId={id} />;
}
