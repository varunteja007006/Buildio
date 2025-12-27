"use client";

import { ExpenseCategoryDetailsComponent } from "@/components/organisms/expense-category";
import { use } from "react";

export default function ExpenseCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Expense Category Details
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage expense category
        </p>
      </div>

      <ExpenseCategoryDetailsComponent categoryId={id} />
    </div>
  );
}
