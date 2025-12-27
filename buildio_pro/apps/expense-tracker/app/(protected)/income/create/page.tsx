"use client";

import { IncomeFormComponent } from "@/components/organisms/income";

export default function CreateIncomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Income</h1>
        <p className="text-muted-foreground mt-2">Record a new income entry</p>
      </div>

      <IncomeFormComponent mode="create" />
    </div>
  );
}
