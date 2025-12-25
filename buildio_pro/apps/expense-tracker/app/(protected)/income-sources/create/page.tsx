"use client";

import { IncomeSourceFormComponent } from "@/components/organisms/income-source";

export default function CreateIncomeSourcePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Create Income Source
        </h1>
        <p className="text-muted-foreground mt-2">
          Add a new income source category
        </p>
      </div>

      <IncomeSourceFormComponent mode="create" />
    </div>
  );
}
