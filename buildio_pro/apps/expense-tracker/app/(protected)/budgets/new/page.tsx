"use client";

import { BudgetFormComponent } from "@/components/organisms/budget/budget-form-component";

export default function CreateBudgetPage() {
  return (
    <div className="container mx-auto py-8">
      <BudgetFormComponent mode="create" />
    </div>
  );
}
