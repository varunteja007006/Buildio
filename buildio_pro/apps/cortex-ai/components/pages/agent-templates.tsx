"use client";

import { AgentTemplatesSection } from "@/components/agent-templates/agent-templates-section";
import { AppBreadcrumb } from "@/components/app-breadcrumb";

export function AgentTemplatesPage() {
  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Agent", href: "/dashboard/agent/builder" },
          { label: "Instruction templates" },
        ]}
      />
      <div className="flex w-full flex-1 flex-col gap-3">
        <div>
          <h1 className="text-xl font-semibold">Instruction templates</h1>
          <p className="text-sm text-muted-foreground">
            Reusable instruction sets. Applying one copies its text into an
            agent.
          </p>
        </div>
        <AgentTemplatesSection />
      </div>
    </>
  );
}