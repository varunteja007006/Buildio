"use client";

import { ExpenseDetailsComponent } from "@/components/organisms/expense";
import { use } from "react";

interface ExpenseDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ExpenseDetailsPage({
  params,
}: ExpenseDetailsPageProps) {
  const { id } = use(params);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expense Details</h1>
        <p className="text-muted-foreground mt-2">
          View and manage expense information
        </p>
      </div>

      <ExpenseDetailsComponent expenseId={id} />
    </div>
  );
}
