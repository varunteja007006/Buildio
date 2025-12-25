"use client";

import { ExpenseListComponent } from "@/components/organisms/expense";

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage all your expenses in one place
        </p>
      </div>

      <ExpenseListComponent />
    </div>
  );
}
