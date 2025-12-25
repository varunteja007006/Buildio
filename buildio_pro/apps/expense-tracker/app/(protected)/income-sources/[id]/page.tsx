"use client";

import { IncomeSourceDetailsComponent } from "@/components/organisms/income-source";
import { use } from "react";

export default function IncomeSourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Income Source Details
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage income source
        </p>
      </div>

      <IncomeSourceDetailsComponent sourceId={id} />
    </div>
  );
}
