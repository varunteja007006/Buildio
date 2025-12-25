"use client";

import { ExpenseFormComponent } from "@/components/organisms/expense";
import { use } from "react";

interface EditExpensePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditExpensePage({
  params,
}: EditExpensePageProps) {
  const { id } = use(params);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Expense</h1>
        <p className="text-muted-foreground mt-2">Update expense details</p>
      </div>

      <ExpenseFormComponent mode="edit" expenseId={id} />
    </div>
  );
}
