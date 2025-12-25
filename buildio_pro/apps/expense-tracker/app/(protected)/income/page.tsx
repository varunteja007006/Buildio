"use client";

import { IncomeListComponent } from "@/components/organisms/income";

export default function IncomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Income</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage all your income in one place
        </p>
      </div>

      <IncomeListComponent />
    </div>
  );
}
