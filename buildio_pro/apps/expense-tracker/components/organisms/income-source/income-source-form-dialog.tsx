"use client";

import * as React from "react";

import { Button } from "@workspace/ui/components/button";
import { FieldGroup } from "@workspace/ui/components/field";
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

import { useRouter } from "next/navigation";
import { useCreateIncomeSource, useUpdateIncomeSource } from "@/hooks";

import { useAppForm } from "@workspace/ui/components/forms/hooks";

import * as z from "zod";

import { EditBtn } from "@/components/atoms/edit-btn";
import { SubmitBtn } from "@/components/atoms/submit-btn";

const sourceFormSchema = z.object({
  name: z
    .string()
    .min(1, "Income source name is required")
    .max(255, "Income source name must be at most 255 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters"),
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
  const [open, setOpen] = React.useState(false);

  const createMutation = useCreateIncomeSource({
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  const updateMutation = useUpdateIncomeSource({
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
    },
    validators: {
      onSubmit: sourceFormSchema,
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>+ Add Income Source</Button>
        ) : (
          <EditBtn iconOnly />
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Income Source" : "Edit Income Source"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new source to categorize your income"
              : "Update source information"}
          </DialogDescription>
        </DialogHeader>
        <div>
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
        </div>
        <DialogFooter className="gap-5">
          <DialogClose onClick={() => setOpen(false)} disabled={isSubmitting}>
            Close
          </DialogClose>

          <SubmitBtn
            disabled={isSubmitting}
            formId="source-form"
            loading={isSubmitting}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
