import React from "react";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { DashboardShell } from "@/components/organisms/dashboard-shell";
import { SessionLayout } from "@/components/organisms/session-layout";

export default function DonateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionLayout
      protectedShell={<DashboardShell>{children}</DashboardShell>}
      publicShell={
        <>
          <Navbar />
          <main className="min-h-screen container">{children}</main>
          <Footer />
        </>
      }
    />
  );
}
