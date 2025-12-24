"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Field, FieldGroup } from "@workspace/ui/components/field";
import { useAppForm } from "@workspace/ui/components/forms/hooks";
import { DatePicker } from "@workspace/ui/components/date-picker";
import { Label } from "@workspace/ui/components/label";

import { toast } from "sonner";
import * as z from "zod";

import { useTRPC } from "@/lib/trpc-client";
import { useMutation } from "@tanstack/react-query";

const budgetFormSchema = z
  .object({
    name: z
      .string()
      .min(3, "Budget name must be at least 3 characters.")
      .max(100, "Budget name must be at most 100 characters."),
    description: z
      .string()
      .max(500, "Description must be at most 500 characters.")
      .default(""),
    budgetAmount: z
      .string()
      .min(1, "Budget amount is required")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Budget amount must be a positive number",
      }),
    startMonth: z.date({ message: "Start month is required" }),
    endMonth: z.date({ message: "End month is required" }),
  })
  .refine(
    (data) => {
      return data.endMonth > data.startMonth;
    },
    {
      message: "End month must be after start month",
      path: ["endMonth"],
    }
  );

interface BudgetFormProps {
  mode: "create" | "edit";
  budgetId?: string;
  initialValues?: {
    name?: string;
    description?: string;
    budgetAmount?: string;
    startMonth?: Date;
    endMonth?: Date;
  };
}

export function BudgetFormComponent({
  mode,
  budgetId,
  initialValues,
}: BudgetFormProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const createMutation = useMutation(
    trpc.budget.createBudget.mutationOptions({
      onSuccess: () => {
        toast.success("Budget created successfully!");
        router.push("/budgets");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create budget");
      },
    })
  );

  const updateMutation = useMutation(
    trpc.budget.updateBudget.mutationOptions({
      onSuccess: () => {
        toast.success("Budget updated successfully!");
        router.push(`/budgets/${budgetId}`);
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update budget");
      },
    })
  );

  const form = useAppForm({
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      budgetAmount: initialValues?.budgetAmount || "",
      startMonth: initialValues?.startMonth || undefined,
      endMonth: initialValues?.endMonth || undefined,
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = budgetFormSchema.safeParse(value);
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
          description: value.description,
          budgetAmount: value.budgetAmount,
          startMonth: value.startMonth!,
          endMonth: value.endMonth!,
        });
      } else if (mode === "edit" && budgetId) {
        updateMutation.mutate({
          budgetId,
          name: value.name,
          description: value.description,
          budgetAmount: value.budgetAmount,
          startMonth: value.startMonth!,
          endMonth: value.endMonth!,
        });
      }
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create Budget" : "Edit Budget"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Set up a new budget to track your spending"
            : "Update your budget details"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="budget-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField name="name">
              {(field) => <field.Input label="Budget Name" />}
            </form.AppField>

            <form.AppField name="description">
              {(field) => <field.Textarea label="Description (Optional)" />}
            </form.AppField>

            <form.AppField name="budgetAmount">
              {(field) => <field.Input label="Budget Amount" />}
            </form.AppField>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.AppField name="startMonth">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Start Month</Label>
                    <DatePicker
                      value={field.state.value}
                      onChange={field.handleChange}
                      placeholder="Select start date"
                      disabled={isSubmitting}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.AppField>

              <form.AppField name="endMonth">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>End Month</Label>
                    <DatePicker
                      value={field.state.value}
                      onChange={field.handleChange}
                      placeholder="Select end date"
                      disabled={isSubmitting}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.AppField>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="budget-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : mode === "create" ? (
              "Create Budget"
            ) : (
              "Update Budget"
            )}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
