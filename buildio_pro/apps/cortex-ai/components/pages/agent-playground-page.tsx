"use client";

import { useAgent } from "@/api/agents/query";
import { AgentPlayground } from "@/components/agents/agent-playground";
import { AppBreadcrumb } from "@/components/app-breadcrumb";

export function AgentPlaygroundPageView({
  agentId,
}: {
  agentId: string;
}) {
  const { data, isLoading, isError } = useAgent(agentId);

  if (isLoading)
    return (
      <>
        <AppBreadcrumb
          segments={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Agent", href: "/dashboard/agent/builder" },
            { label: "Playground" },
          ]}
        />
        <p className="text-sm text-muted-foreground">Loading agent…</p>
      </>
    );

  if (isError || !data)
    return (
      <>
        <AppBreadcrumb
          segments={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Agent", href: "/dashboard/agent/builder" },
            { label: "Unavailable" },
          ]}
        />
        <p className="text-sm text-muted-foreground">
          Agent not found. Return to the builder to pick an agent.
        </p>
      </>
    );

  return (
    <AgentPlayground agentId={agentId} agentName={data.agent.name} />
  );
}