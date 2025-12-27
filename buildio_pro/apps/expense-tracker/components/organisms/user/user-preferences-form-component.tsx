"use client";

import * as React from "react";
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
import { useUserPreferencesQuery, useUpdateUserPreferences } from "@/hooks";
import { SubmitBtn } from "@/components/atoms/submit-btn";

const preferencesFormSchema = z.object({
  currency: z.string().length(3, "Invalid currency code"),
  timezone: z.string().min(1, "Timezone is required"),
});

export function UserPreferencesFormComponent() {
  const { data: preferences, isLoading } = useUserPreferencesQuery();

  const updateMutation = useUpdateUserPreferences();

  const form = useAppForm({
    defaultValues: {
      currency: preferences?.currency || "USD",
      timezone: preferences?.timezone || "UTC",
    },
    validators: {
      onSubmit: preferencesFormSchema,
    },
    onSubmit: async ({ value }) => {
      updateMutation.mutate({
        currency: value.currency,
        timezone: value.timezone,
      });
    },
  });

  const isSubmitting = updateMutation.isPending;

  React.useEffect(() => {
    if (preferences) {
      form.setFieldValue("currency", preferences.currency);
      form.setFieldValue("timezone", preferences.timezone);
    }
  }, [preferences, form]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Manage your regional preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Manage your regional preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="preferences-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField name="currency">
              {(field) => <field.CurrencySelect label="Currency" />}
            </form.AppField>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <SubmitBtn
          formId="preferences-form"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </CardFooter>
    </Card>
  );
}
