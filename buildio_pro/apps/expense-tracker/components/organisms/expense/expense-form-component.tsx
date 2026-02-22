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
  DialogClose,
} from "@workspace/ui/components/dialog";
import { Field, FieldGroup } from "@workspace/ui/components/field";
import { useAppForm } from "@workspace/ui/components/forms/hooks";
import { SelectItem } from "@workspace/ui/components/select";

import * as z from "zod";

import { EditBtn } from "@/components/atoms/edit-btn";
import {
  useBudgetList,
  useCreateExpense,
  useExpenseCategoryList,
  useUpdateExpense,
} from "@/hooks";

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
  const dialogCloseRef = React.useRef<HTMLButtonElement>(null);
  // Fetch categories from database
  const { data: categoriesData } = useExpenseCategoryList({
    limit: 100,
    page: 1,
  });

  // Fetch budgets from database
  const { data: budgetsData } = useBudgetList({
    limit: 100,
    page: 1,
  });

  const categories = categoriesData?.data || [];
  const budgets = budgetsData?.data || [];

  const createMutation = useCreateExpense();

  const updateMutation = useUpdateExpense();

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
        createMutation.mutate(
          {
            name: value.name,
            expenseAmount: value.expenseAmount,
            categoryId: value.categoryId ? value.categoryId : undefined,
            budgetId: value.budgetId ? value.budgetId : undefined,
            isRecurring: value.isRecurring,
            account: value.account ? value.account : undefined,
          },
          {
            onSuccess: () => {
              if (dialogCloseRef.current) {
                dialogCloseRef.current.click();
              }
            },
          },
        );
      } else if (mode === "edit" && expenseId) {
        updateMutation.mutate(
          {
            expenseId,
            name: value.name,
            expenseAmount: value.expenseAmount,
            categoryId: value.categoryId ? value.categoryId : undefined,
            budgetId: value.budgetId ? value.budgetId : undefined,
            isRecurring: value.isRecurring,
            account: value.account ? value.account : undefined,
          },
          {
            onSuccess: () => {
              if (dialogCloseRef.current) {
                dialogCloseRef.current.click();
              }
            },
          },
        );
      }
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size={"sm"}>+ Add Expense</Button>
        ) : (
          <EditBtn iconOnly />
        )}
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
          <DialogClose ref={dialogCloseRef} asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>

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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
