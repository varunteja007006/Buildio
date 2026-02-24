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

import { EditBtn } from "@/components/atoms/edit-btn";
import { SubmitBtn } from "@/components/atoms/submit-btn";
import { useEventCreate, useEventListStatues, useEventUpdate } from "@/hooks";

const eventFormSchema = z
  .object({
    name: z
      .string()
      .min(3, "Event name must be at least 3 characters.")
      .max(255, "Event name must be at most 255 characters."),
    description: z
      .string()
      .max(1000, "Description must be at most 1000 characters.")
      .optional(),
    estimatedBudget: z
      .string()
      .refine(
        (val) =>
          !val || val === "" || (!isNaN(Number(val)) && Number(val) >= 0),
        {
          message: "Estimated budget must be a positive number",
        },
      )
      .optional(),
    startDate: z.date({ message: "Start date is required" }),
    endDate: z.date().optional(),
    statusId: z.uuid({ message: "Status is required" }),
  })
  .refine(
    (data) => {
      if (data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  initialValues?: {
    name: string;
    description?: string | null;
    estimatedBudget?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    statusId?: string;
  };
}

export function EventForm({ mode, eventId, initialValues }: EventFormProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const { data: statusOptions, isLoading: isLoadingStatuses } =
    useEventListStatues();

  const createMutation = useEventCreate();

  const updateMutation = useEventUpdate();

  const form = useAppForm({
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description,
      estimatedBudget: initialValues?.estimatedBudget,
      startDate: initialValues?.startDate || undefined,
      endDate: initialValues?.endDate || undefined,
      statusId: initialValues?.statusId || undefined,
    } as EventFormProps["initialValues"],
    validators: {
      onSubmit: eventFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        createMutation.mutate(
          {
            name: value.name,
            description:
              value.description && value.description.trim() !== ""
                ? value.description
                : undefined,
            estimatedBudget:
              value.estimatedBudget && value.estimatedBudget.trim() !== ""
                ? value.estimatedBudget
                : undefined,
            startDate: value.startDate!,
            endDate: value.endDate,
            statusId: value.statusId,
          },
          {
            onSuccess: () => {
              setDialogOpen(false);
            },
          },
        );
      } else if (mode === "edit" && eventId) {
        updateMutation.mutate(
          {
            eventId,
            name: value.name,
            description:
              value.description && value.description.trim() !== ""
                ? value.description
                : undefined,
            estimatedBudget:
              value.estimatedBudget && value.estimatedBudget.trim() !== ""
                ? value.estimatedBudget
                : undefined,
            startDate: value.startDate!,
            endDate: value.endDate,
            statusId: value.statusId,
          },
          {
            onSuccess: () => {
              setDialogOpen(false);
            },
          },
        );
      }
    },
  });

  React.useEffect(() => {
    if (!statusOptions || statusOptions.length === 0) return;

    const preferredStatusId =
      initialValues?.statusId ||
      statusOptions.find((status) => status.isDefault)?.id ||
      statusOptions?.[0]?.id;

    const currentStatusId = form.state.values.statusId as string | undefined;
    if (!currentStatusId && preferredStatusId) {
      form.setFieldValue("statusId", preferredStatusId);
    }
  }, [statusOptions, initialValues?.statusId, form]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isSubmitDisabled =
    isSubmitting || isLoadingStatuses || !statusOptions?.length;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size={"sm"}>Create Event</Button>
        ) : (
          <EditBtn iconOnly />
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Event" : "Edit Event"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new event to track expenses across multiple months and budgets"
              : "Update your event details"}
          </DialogDescription>
        </DialogHeader>
        <form
          id="event-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField name="name">
              {(field) => (
                <field.Input
                  label="Event Name"
                  placeholder="e.g., Buying a Property, Home Renovation"
                />
              )}
            </form.AppField>

            <form.AppField name="description">
              {(field) => (
                <field.Textarea
                  label="Description (Optional)"
                  placeholder="Describe this event in detail..."
                />
              )}
            </form.AppField>

            <form.AppField name="estimatedBudget">
              {(field) => (
                <field.Input
                  label="Estimated Budget (Optional)"
                  placeholder="0.00"
                />
              )}
            </form.AppField>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.AppField name="startDate">
                {(field) => <field.DatePicker label="Start Date" />}
              </form.AppField>

              <form.AppField name="endDate">
                {(field) => <field.DatePicker label="End Date (Optional)" />}
              </form.AppField>
            </div>

            <form.AppField name="statusId">
              {(field) => (
                <field.Select label="Status" placeholder="Select status">
                  {statusOptions?.length ? (
                    statusOptions.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="NA" disabled>
                      {isLoadingStatuses
                        ? "Loading statuses..."
                        : "No statuses configured"}
                    </SelectItem>
                  )}
                </field.Select>
              )}
            </form.AppField>
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitDisabled}>
              Close
            </Button>
          </DialogClose>
          <SubmitBtn
            loading={isSubmitting}
            disabled={isSubmitDisabled}
            formId="event-form"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
