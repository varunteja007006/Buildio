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

import * as z from "zod";

import {
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
} from "@/hooks";

const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(255, "Category name must be at most 255 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .default(""),
});

interface ExpenseCategoryFormProps {
  mode: "create" | "edit";
  categoryId?: string;
  initialValues?: {
    name?: string;
    description?: string;
  };
}

export function ExpenseCategoryFormComponent({
  mode,
  categoryId,
  initialValues,
}: ExpenseCategoryFormProps) {
  const router = useRouter();

  const createMutation = useCreateExpenseCategory({
    onSuccess: () => {
      router.push("/expense-categories");
    },
  });

  const updateMutation = useUpdateExpenseCategory({
    onSuccess: () => {
      router.push(`/expense-categories/${categoryId}`);
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = categoryFormSchema.safeParse(value);
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
        });
      } else if (mode === "edit" && categoryId) {
        updateMutation.mutate({
          categoryId,
          name: value.name,
          description: value.description,
        });
      }
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create"
            ? "Create Expense Category"
            : "Edit Expense Category"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new category to organize your expenses"
            : "Update category information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="category-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField name="name">
              {(field) => <field.Input label="Category Name" />}
            </form.AppField>

            <form.AppField name="description">
              {(field) => <field.Textarea label="Description (Optional)" />}
            </form.AppField>
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
          <Button type="submit" form="category-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : mode === "create" ? (
              "Create Category"
            ) : (
              "Update Category"
            )}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
