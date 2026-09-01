import React from "react";

import { RenderProfiler } from "@/components/atoms/render-profiler";
import { DashboardShell } from "@/components/organisms/dashboard-shell";

import { Protected } from "./protected";

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Protected>
      <DashboardShell>
        <RenderProfiler id="protected-page">{children}</RenderProfiler>
      </DashboardShell>
    </Protected>
  );
}
