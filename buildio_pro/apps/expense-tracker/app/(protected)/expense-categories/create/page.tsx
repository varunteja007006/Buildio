"use client";

import { ExpenseCategoryFormComponent } from "@/components/organisms/expense-category";

export default function CreateExpenseCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Create Expense Category
        </h1>
        <p className="text-muted-foreground mt-2">Add a new expense category</p>
      </div>

      <ExpenseCategoryFormComponent mode="create" />
    </div>
  );
}
