"use client";

import { ExpenseCategoryListComponent } from "@/components/organisms/expense-category";

export default function ExpenseCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Expense Categories
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your expense categories like Groceries, Rent, Travel, etc.
        </p>
      </div>

      <ExpenseCategoryListComponent />
    </div>
  );
}
