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
import { SelectItem } from "@workspace/ui/components/select";

import { toast } from "sonner";
import * as z from "zod";

import { useTRPC } from "@/lib/trpc-client";
import { useQuery, useMutation } from "@tanstack/react-query";

const incomeFormSchema = z.object({
  name: z
    .string()
    .min(1, "Income name is required")
    .max(255, "Income name must be at most 255 characters"),
  incomeAmount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  sourceId: z.string().uuid("Invalid income source").optional(),
  paymentMethodId: z.string().uuid("Invalid payment method").optional(),
});

interface IncomeFormProps {
  mode: "create" | "edit";
  incomeId?: string;
  initialValues?: {
    name?: string;
    incomeAmount?: string;
    sourceId?: string;
    paymentMethodId?: string;
  };
}

export function IncomeFormComponent({
  mode,
  incomeId,
  initialValues,
}: IncomeFormProps) {
  const router = useRouter();
  const trpc = useTRPC();

  // Fetch income sources
  const { data: sourcesData } = useQuery(
    trpc.incomeSource.listSources.queryOptions({
      limit: 100,
      page: 1,
    }),
  );

  const sources = sourcesData?.data || [];

  const createMutation = useMutation(
    trpc.income.createIncome.mutationOptions({
      onSuccess: () => {
        toast.success("Income created successfully!");
        router.push("/income");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create income");
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.income.updateIncome.mutationOptions({
      onSuccess: () => {
        toast.success("Income updated successfully!");
        router.push(`/income/${incomeId}`);
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update income");
      },
    }),
  );

  const form = useAppForm({
    defaultValues: {
      name: initialValues?.name || "",
      incomeAmount: initialValues?.incomeAmount || "",
      sourceId: initialValues?.sourceId || "",
      paymentMethodId: initialValues?.paymentMethodId || "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = incomeFormSchema.safeParse(value);
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
          incomeAmount: value.incomeAmount,
          sourceId: value.sourceId || undefined,
          paymentMethodId: value.paymentMethodId || undefined,
        });
      } else if (mode === "edit" && incomeId) {
        updateMutation.mutate({
          incomeId,
          name: value.name,
          incomeAmount: value.incomeAmount,
          sourceId: value.sourceId || null,
          paymentMethodId: value.paymentMethodId || null,
        });
      }
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create Income" : "Edit Income"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Record a new income entry"
            : "Update income information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="income-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField name="name">
              {(field) => <field.Input label="Income Name" />}
            </form.AppField>

            <form.AppField name="incomeAmount">
              {(field) => <field.Input label="Amount" />}
            </form.AppField>

            <form.AppField name="sourceId">
              {(field) => (
                <field.Select label="Income Source (Optional)">
                  <SelectItem value="">None</SelectItem>
                  {sources.map((source: any) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </field.Select>
              )}
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
          <Button type="submit" form="income-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : mode === "create" ? (
              "Create Income"
            ) : (
              "Update Income"
            )}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
