import { Badge } from "@workspace/ui/components/badge";

import type { Agent } from "@/api/agents/types";

const LABELS: Record<Agent["status"], string> = {
  draft: "Draft",
  deployed: "Deployed",
  undeployed: "Undeployed",
};

export function AgentStatusBadge({ status }: { status: Agent["status"] }) {
  return (
    <Badge
      variant={
        status === "deployed"
          ? "default"
          : status === "draft"
            ? "secondary"
            : "outline"
      }
    >
      {LABELS[status]}
    </Badge>
  );
}