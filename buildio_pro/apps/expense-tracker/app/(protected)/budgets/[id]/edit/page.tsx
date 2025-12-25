"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@workspace/ui/components/card";

import { useTRPC } from "@/lib/trpc-client";
import { BudgetFormComponent } from "@/components/organisms/budget/budget-form-component";
import { useQuery } from "@tanstack/react-query";

export default function EditBudgetPage() {
  const params = useParams();
  const budgetId = params.id as string;
  const trpc = useTRPC();

  const budgetQuery = useQuery(
    trpc.budget.budgetDetails.queryOptions({ budgetId }),
  );

  if (budgetQuery.isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (budgetQuery.isError || !budgetQuery.data) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Budget not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { budget } = budgetQuery.data;

  return (
    <div className="container mx-auto py-8">
      <BudgetFormComponent
        mode="edit"
        budgetId={budgetId}
        initialValues={{
          name: budget.name,
          description: budget.description || "",
          budgetAmount: budget.budgetAmount.toString(),
          startMonth: new Date(budget.startMonth),
          endMonth: new Date(budget.endMonth),
        }}
      />
    </div>
  );
}
