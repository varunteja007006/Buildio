"use client";

import { IncomeSourceListComponent } from "@/components/organisms/income-source";

export default function IncomeSourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Income Sources</h1>
        <p className="text-muted-foreground mt-2">
          Manage your income sources like Salary, Freelance, Investments, etc.
        </p>
      </div>

      <IncomeSourceListComponent />
    </div>
  );
}
