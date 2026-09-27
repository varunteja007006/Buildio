"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

import { useAgent, useDeployAgent, useUndeployAgent } from "@/api/agents/query";
import { AgentFeedbackSection } from "@/components/agents/agent-feedback-section";
import { AgentStatusBadge } from "@/components/agents/agent-status-badge";
import { AppBreadcrumb } from "@/components/app-breadcrumb";

export function AgentDetailPage({ agentId }: { agentId: string }) {
  const { data, isLoading, isError } = useAgent(agentId);
  const deploy = useDeployAgent();
  const undeploy = useUndeployAgent();
  const agent = data?.agent;

  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Agent", href: "/dashboard/agent/builder" },
          { label: agent?.name ?? "…" },
        ]}
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading agent…</p>
      ) : isError || !agent ? (
        <p className="text-sm text-muted-foreground">
          Agent not found.{" "}
          <Link href="/dashboard/agent/builder" className="underline">
            Back to builder
          </Link>
        </p>
      ) : (
        <div className="flex w-full flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{agent.name}</h1>
                <AgentStatusBadge status={agent.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {agent.description || "No description"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/dashboard/agent/${agent.id}/playground`}>
                  Open playground
                </Link>
              </Button>
              {agent.status === "deployed" ? (
                <Button
                  variant="outline"
                  onClick={() => undeploy.mutate(agent.id)}
                  disabled={undeploy.isPending}
                >
                  {undeploy.isPending ? "Undeploying…" : "Undeploy"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => deploy.mutate(agent.id)}
                  disabled={deploy.isPending}
                >
                  {deploy.isPending ? "Deploying…" : "Deploy"}
                </Button>
              )}
            </div>
          </div>
          {deploy.error ? (
            <p className="text-sm text-destructive">
              {deploy.error instanceof Error
                ? deploy.error.message
                : "Deploy failed."}
            </p>
          ) : null}

          <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Instructions
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {agent.instructions || "No instructions set."}
              </p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Topics ({data?.topics.length ?? 0})
                </p>
                <div className="flex flex-wrap gap-1">
                  {(data?.topics ?? []).map((topic) => (
                    <Badge key={topic.id} variant="secondary">
                      {topic.name}
                    </Badge>
                  ))}
                  {data?.topics.length === 0 ? (
                    <span className="text-sm text-muted-foreground">None</span>
                  ) : null}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Tools ({(data?.tools.length ?? 0) + (data?.toolboxes.length ?? 0)})
                </p>
                <div className="flex flex-wrap gap-1">
                  {(data?.tools ?? []).map((toolKey) => (
                    <Badge key={toolKey} variant="outline">
                      {toolKey}
                    </Badge>
                  ))}
                  {(data?.toolboxes ?? []).map((toolbox) => (
                    <Badge key={toolbox.id} variant="outline">
                      🧰 {toolbox.name}
                    </Badge>
                  ))}
                  {(data?.tools.length ?? 0) + (data?.toolboxes.length ?? 0) ===
                  0 ? (
                    <span className="text-sm text-muted-foreground">None</span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <AgentFeedbackSection agentId={agent.id} />
        </div>
      )}
    </>
  );
}