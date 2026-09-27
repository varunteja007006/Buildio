"use client";

import { useRouter } from "next/navigation";

import { AgentsSection } from "@/components/agents/agents-section";
import { AppBreadcrumb } from "@/components/app-breadcrumb";

export function AgentsPage() {
  const router = useRouter();

  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Agent", href: "/dashboard/agent/builder" },
          { label: "Builder" },
        ]}
      />
      <div className="flex w-full flex-1 flex-col gap-3">
        <div>
          <h1 className="text-xl font-semibold">Agent Builder</h1>
          <p className="text-sm text-muted-foreground">
            Create agents, attach topics and tools, test in the playground, then
            deploy.
          </p>
        </div>
        <AgentsSection onOpenAgent={(id) => router.push(`/dashboard/agent/${id}`)} />
      </div>
    </>
  );
}