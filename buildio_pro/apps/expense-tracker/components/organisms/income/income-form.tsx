"use client";

import * as React from "react";

import * as z from "zod";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { FieldGroup } from "@workspace/ui/components/field";
import { useAppForm } from "@workspace/ui/components/forms/hooks";
import { SelectItem } from "@workspace/ui/components/select";

import { useCreateIncome, useUpdateIncome, useIncomeSourceList } from "@/hooks";

import { EditBtn } from "@/components/atoms/edit-btn";
import { SubmitBtn } from "@/components/atoms/submit-btn";

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
  sourceId: z.uuid("Invalid income source").optional(),
  paymentMethodId: z.uuid("Invalid payment method").optional(),
});

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

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

export function IncomeForm({ mode, incomeId, initialValues }: IncomeFormProps) {
  const [open, setOpen] = React.useState(false);

  // Fetch income sources
  const { data: sourcesData } = useIncomeSourceList({
    limit: 100,
    page: 1,
  });

  const sources = sourcesData?.data || [];

  const createMutation = useCreateIncome({
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });

  const updateMutation = useUpdateIncome({
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: initialValues?.name || "",
      incomeAmount: initialValues?.incomeAmount || "",
      sourceId: initialValues?.sourceId || undefined,
      paymentMethodId: initialValues?.paymentMethodId || undefined,
    } as IncomeFormValues,
    validators: {
      onSubmit: incomeFormSchema,
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size={"sm"}>+ Add Income</Button>
        ) : (
          <EditBtn iconOnly />
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Income" : "Edit Income"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Record a new income entry"
              : "Update income information"}
          </DialogDescription>
        </DialogHeader>

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
        <DialogFooter>
          <DialogClose>Close</DialogClose>
          <SubmitBtn
            formId="income-form"
            disabled={isSubmitting}
            loading={isSubmitting}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
