"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";
import * as z from "zod";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Field, FieldGroup } from "@workspace/ui/components/field";
import { useAppForm } from "@workspace/ui/components/forms/hooks";

import { EditBtn } from "@/components/atoms/edit-btn";
import { useCreateExpenseCategory, useUpdateExpenseCategory } from "@/hooks";

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
    <div className="space-y-6">
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

      <Field orientation="horizontal">
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
    </div>
  );
}

export function ExpenseCategoryFormDialog(props: ExpenseCategoryFormProps) {
  const { mode } = props;
  return (
    <Dialog>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button variant="default">Create Category</Button>
        ) : (
          <EditBtn iconOnly />
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Create Expense Category"
              : "Edit Expense Category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new category to organize your expenses"
              : "Update category information"}
          </DialogDescription>
        </DialogHeader>

        <ExpenseCategoryFormComponent {...props} />
      </DialogContent>
    </Dialog>
  );
}
