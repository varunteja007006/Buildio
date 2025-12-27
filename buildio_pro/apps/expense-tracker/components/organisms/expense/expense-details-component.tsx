"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Edit2, ArrowLeft, Trash2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";

import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc-client";
import { useQuery, useMutation } from "@tanstack/react-query";

interface ExpenseDetailsComponentProps {
  expenseId: string;
}

export function ExpenseDetailsComponent({
  expenseId,
}: ExpenseDetailsComponentProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const { data: expense, isLoading } = useQuery(
    trpc.expense.getExpenseById.queryOptions({ expenseId }),
  ) as { data?: any; isLoading: boolean };

  const deleteMutation = useMutation(
    trpc.expense.deleteExpense.mutationOptions({
      onSuccess: () => {
        toast.success("Expense deleted successfully!");
        router.push("/expenses");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete expense");
      },
    }),
  );

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      deleteMutation.mutate({ expenseId });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Loading expense details...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!expense) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Expense not found
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedDate = new Date(expense.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const updatedDate = new Date(expense.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{expense.name}</CardTitle>
            <CardDescription>
              Created on {formattedDate}
              {formattedDate !== updatedDate && ` • Updated on ${updatedDate}`}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Amount */}
          <div className="pb-6 border-b">
            <p className="text-sm text-muted-foreground mb-2">Amount</p>
            <p className="text-3xl font-bold">
              ${Number(expense.expenseAmount).toFixed(2)}
            </p>
          </div>

          {/* Category */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Category</p>
            {expense.category && (expense.category as any).name ? (
              <Badge variant="outline">{(expense.category as any).name}</Badge>
            ) : (
              <p className="text-sm text-muted-foreground">
                No category assigned
              </p>
            )}
          </div>

          {/* Account */}
          {expense.account && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Account</p>
              <p className="text-sm">{expense.account}</p>
            </div>
          )}

          {/* Recurring */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Recurring</p>
            <Badge variant={expense.isRecurring ? "default" : "secondary"}>
              {expense.isRecurring ? "Yes, Recurring" : "One-time"}
            </Badge>
          </div>

          {/* Budget */}
          {expense.budget && expense.budget.id && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Linked Budget
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/budgets/${(expense.budget as any).id}`)
                }
              >
                {(expense.budget as any).name}
              </Button>
            </div>
          )}

          {/* ID */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">ID: {expense.id}</p>
          </div>
        </div>
      </CardContent>

      {/* Footer with Actions */}
      <div className="flex gap-2 px-6 py-4 border-t bg-muted/50">
        <Button variant="outline" onClick={() => router.push("/expenses")}>
          Back to Expenses
        </Button>
        <Button onClick={() => router.push(`/expenses/${expenseId}/edit`)}>
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Expense
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </Card>
  );
}
