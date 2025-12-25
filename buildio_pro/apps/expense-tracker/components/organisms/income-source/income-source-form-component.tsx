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

import { toast } from "sonner";
import * as z from "zod";

import { useTRPC } from "@/lib/trpc-client";
import { useMutation } from "@tanstack/react-query";

const sourceFormSchema = z.object({
  name: z
    .string()
    .min(1, "Income source name is required")
    .max(255, "Income source name must be at most 255 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .default(""),
});

interface IncomeSourceFormProps {
  mode: "create" | "edit";
  sourceId?: string;
  initialValues?: {
    name?: string;
    description?: string;
  };
}

export function IncomeSourceFormComponent({
  mode,
  sourceId,
  initialValues,
}: IncomeSourceFormProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const createMutation = useMutation(
    trpc.incomeSource.createSource.mutationOptions({
      onSuccess: () => {
        toast.success("Income source created successfully!");
        router.push("/income-sources");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create income source");
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.incomeSource.updateSource.mutationOptions({
      onSuccess: () => {
        toast.success("Income source updated successfully!");
        router.push(`/income-sources/${sourceId}`);
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update income source");
      },
    }),
  );

  const form = useAppForm({
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = sourceFormSchema.safeParse(value);
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
      } else if (mode === "edit" && sourceId) {
        updateMutation.mutate({
          sourceId,
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
          {mode === "create" ? "Create Income Source" : "Edit Income Source"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new source to categorize your income"
            : "Update source information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="source-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField name="name">
              {(field) => <field.Input label="Source Name" />}
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
          <Button type="submit" form="source-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : mode === "create" ? (
              "Create Source"
            ) : (
              "Update Source"
            )}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
