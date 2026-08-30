import React from "react";

import { DashboardShell } from "@/components/organisms/dashboard-shell";

import { Protected } from "./protected";

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Protected>
      <DashboardShell>{children}</DashboardShell>
    </Protected>
  );
}
