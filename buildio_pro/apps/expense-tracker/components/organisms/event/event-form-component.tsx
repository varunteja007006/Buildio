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
import { useMutation, useQuery } from "@tanstack/react-query";
import { SelectItem } from "@workspace/ui/components/select";

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
    statusId: z.string().uuid({ message: "Status is required" }),
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
    name?: string;
    description?: string;
    estimatedBudget?: string;
    startDate?: Date;
    endDate?: Date;
    statusId?: string;
  };
}

export function EventFormComponent({
  mode,
  eventId,
  initialValues,
}: EventFormProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const { data: statusOptions, isLoading: isLoadingStatuses } = useQuery(
    trpc.event.listStatuses.queryOptions(),
  );

  const createMutation = useMutation(
    trpc.event.createEvent.mutationOptions({
      onSuccess: () => {
        toast.success("Event created successfully!");
        router.push("/events");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create event");
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.event.updateEvent.mutationOptions({
      onSuccess: () => {
        toast.success("Event updated successfully!");
        router.push(`/events/${eventId}`);
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update event");
      },
    }),
  );

  const form = useAppForm({
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description,
      estimatedBudget: initialValues?.estimatedBudget,
      startDate: initialValues?.startDate || undefined,
      endDate: initialValues?.endDate || undefined,
      statusId: initialValues?.statusId || undefined,
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = eventFormSchema.safeParse(value);
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
        });
      } else if (mode === "edit" && eventId) {
        updateMutation.mutate({
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
        });
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create Event" : "Edit Event"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Create a new event to track expenses across multiple months and budgets"
            : "Update your event details"}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                <field.Select
                  label="Status"
                  // disabled={isLoadingStatuses || !statusOptions?.length}
                >
                  {statusOptions?.length ? (
                    statusOptions.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
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
          <Button type="submit" form="event-form" disabled={isSubmitDisabled}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : mode === "create" ? (
              "Create Event"
            ) : (
              "Update Event"
            )}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
