"use client";

import { ExpenseFormComponent } from "@/components/organisms/expense";

export default function CreateExpensePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Expense</h1>
        <p className="text-muted-foreground mt-2">
          Record a new expense to track your spending
        </p>
      </div>

      <ExpenseFormComponent mode="create" />
    </div>
  );
}
