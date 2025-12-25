"use client";

import { IncomeDetailsComponent } from "@/components/organisms/income";
import { use } from "react";

export default function IncomeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Income Details</h1>
        <p className="text-muted-foreground mt-2">
          View and manage income entry
        </p>
      </div>

      <IncomeDetailsComponent incomeId={id} />
    </div>
  );
}
