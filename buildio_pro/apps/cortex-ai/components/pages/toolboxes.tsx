"use client";

import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { ToolboxesSection } from "@/components/toolboxes/toolboxes-section";

export function ToolboxesPage() {
  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Agent", href: "/dashboard/agent/builder" },
          { label: "Toolboxes" },
        ]}
      />
      <div className="flex w-full flex-1 flex-col gap-3">
        <div>
          <h1 className="text-xl font-semibold">Toolboxes</h1>
          <p className="text-sm text-muted-foreground">
            Reusable tool groups. Tools inside toolboxes are not individually
            attachable to agents.
          </p>
        </div>
        <ToolboxesSection />
      </div>
    </>
  );
}