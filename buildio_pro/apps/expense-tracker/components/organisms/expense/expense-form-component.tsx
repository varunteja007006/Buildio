"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Field, FieldGroup } from "@workspace/ui/components/field";
import { useAppForm } from "@workspace/ui/components/forms/hooks";
import { SelectItem } from "@workspace/ui/components/select";

import { toast } from "sonner";
import * as z from "zod";

import { useTRPC } from "@/lib/trpc-client";
import { useMutation, useQuery } from "@tanstack/react-query";

const expenseFormSchema = z.object({
  name: z
    .string()
    .min(1, "Expense name is required")
    .max(255, "Expense name must be at most 255 characters"),
  expenseAmount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  categoryId: z.uuid("Invalid category").optional(),
  budgetId: z.uuid("Invalid budget").optional(),
  isRecurring: z.boolean().default(false),
  account: z.string().max(255).optional(),
});

interface ExpenseFormProps {
  mode: "create" | "edit";
  expenseId?: string;
  initialValues?: {
    name?: string;
    expenseAmount?: string;
    categoryId?: string;
    budgetId?: string;
    isRecurring?: boolean;
    account?: string;
  };
}

export function ExpenseFormComponent({
  mode,
  expenseId,
  initialValues,
}: ExpenseFormProps) {
  const router = useRouter();
  const trpc = useTRPC();

  // Fetch categories from database
  const { data: categoriesData } = useQuery(
    trpc.expenseCategory.listCategories.queryOptions({
      limit: 100,
    }),
  );

  // Fetch budgets from database
  const { data: budgetsData } = useQuery(
    trpc.budget.budgetList.queryOptions({
      limit: 100,
    }),
  );

  const categories = categoriesData?.data || [];
  const budgets = budgetsData?.data || [];

  const createMutation = useMutation(
    trpc.expense.createExpense.mutationOptions({
      onSuccess: () => {
        toast.success("Expense created successfully!");
        router.push("/expenses");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create expense");
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.expense.updateExpense.mutationOptions({
      onSuccess: () => {
        toast.success("Expense updated successfully!");
        router.push(`/expenses/${expenseId}`);
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update expense");
      },
    }),
  );

  const form = useAppForm({
    defaultValues: {
      name: initialValues?.name || "",
      expenseAmount: initialValues?.expenseAmount || "",
      categoryId: initialValues?.categoryId || undefined,
      budgetId: initialValues?.budgetId || undefined,
      isRecurring: initialValues?.isRecurring || false,
      account: initialValues?.account || "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = expenseFormSchema.safeParse(value);
        if (!result.success) {
          return result.error.format();
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        createMutation.mutate({
          name: value.name,
          expenseAmount: value.expenseAmount,
          categoryId: value.categoryId ? value.categoryId : undefined,
          budgetId: value.budgetId ? value.budgetId : undefined,
          isRecurring: value.isRecurring,
          account: value.account ? value.account : undefined,
        });
      } else if (mode === "edit" && expenseId) {
        updateMutation.mutate({
          expenseId,
          name: value.name,
          expenseAmount: value.expenseAmount,
          categoryId: value.categoryId ? value.categoryId : undefined,
          budgetId: value.budgetId ? value.budgetId : undefined,
          isRecurring: value.isRecurring,
          account: value.account ? value.account : undefined,
        });
      }
    },
  });

  console.log(form.getAllErrors());

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"sm"}>+ Add Expense</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Expense" : "Edit Expense"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Record a new expense"
              : "Update expense details"}
          </DialogDescription>
        </DialogHeader>

        <form id="expense-form">
          <FieldGroup>
            <form.AppField name="name">
              {(field) => <field.Input label="Expense Name" />}
            </form.AppField>

            <form.AppField name="expenseAmount">
              {(field) => <field.Input label="Amount" />}
            </form.AppField>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.AppField name="categoryId">
                {(field) => (
                  <field.Select label="Category (Optional)">
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </field.Select>
                )}
              </form.AppField>

              <form.AppField name="budgetId">
                {(field) => (
                  <field.Select label="Budget (Optional)">
                    {budgets.map((budget: any) => (
                      <SelectItem key={budget.id} value={budget.id}>
                        {budget.name}
                      </SelectItem>
                    ))}
                  </field.Select>
                )}
              </form.AppField>
            </div>

            <form.AppField name="account">
              {(field) => <field.Input label="Account (Optional)" />}
            </form.AppField>

            <form.AppField name="isRecurring">
              {(field) => <field.Checkbox label="Recurring Expense" />}
            </form.AppField>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Field orientation="horizontal" className="justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="expense-form"
              onClick={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : mode === "create" ? (
                "Add Expense"
              ) : (
                "Update Expense"
              )}
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
