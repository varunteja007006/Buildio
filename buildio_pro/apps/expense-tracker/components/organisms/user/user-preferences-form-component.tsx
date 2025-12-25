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

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "America/Denver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Australia/Sydney",
  "Australia/Melbourne",
  "India/Kolkata",
  "Asia/Dubai",
];

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR", "CAD", "AUD", "CHF"];

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
      onSubmit: ({ value }) => {
        const result = preferencesFormSchema.safeParse(value);
        if (!result.success) {
          return result.error.format();
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      updateMutation.mutate({
        currency: value.currency,
        timezone: value.timezone,
      });
    },
  });

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

  const isSubmitting = updateMutation.isPending;

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
              {(field) => (
                <field.Select label="Currency">
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </field.Select>
              )}
            </form.AppField>

            <form.AppField name="timezone">
              {(field) => (
                <field.Select label="Timezone">
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </field.Select>
              )}
            </form.AppField>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="submit" form="preferences-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
