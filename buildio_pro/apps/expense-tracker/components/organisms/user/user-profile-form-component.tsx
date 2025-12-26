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
import { useUserProfileQuery, useUpdateUserProfile } from "@/hooks";

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(500).optional(),
  image_url: z.string().url("Invalid URL").optional(),
});

export function UserProfileFormComponent() {
  const { data: profile, isLoading } = useUserProfileQuery();
  const updateMutation = useUpdateUserProfile();
  const [imageError, setImageError] = React.useState(false);

  const form = useAppForm({
    defaultValues: {
      name: profile?.name || "",
      description: profile?.description || "",
      image_url: profile?.image_url || "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = profileFormSchema.safeParse(value);
        if (!result.success) {
          return result.error.format();
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      updateMutation.mutate({
        name: value.name,
        description: value.description,
        image_url: value.image_url,
      });
    },
  });

  React.useEffect(() => {
    if (profile) {
      form.setFieldValue("name", profile.name);
      form.setFieldValue("description", profile.description || "");
      form.setFieldValue("image_url", profile.image_url || "");
    }
  }, [profile, form]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
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
  const hasValidImage = form.state.values.image_url && !imageError;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField name="name">
              {(field) => (
                <field.Input label="Display Name" placeholder="Your name" />
              )}
            </form.AppField>

            <form.AppField name="description">
              {(field) => (
                <field.Textarea
                  label="Bio"
                  placeholder="Tell us about yourself"
                />
              )}
            </form.AppField>

            <form.AppField name="image_url">
              {(field) => (
                <div className="space-y-2">
                  <field.Input
                    label="Profile Image URL"
                    placeholder="https://example.com/image.jpg"
                  />
                  {hasValidImage && (
                    <div className="mt-3 flex items-center gap-4">
                      <img
                        src={form.state.values.image_url}
                        alt="Profile preview"
                        className="h-16 w-16 rounded-full object-cover"
                        onError={() => {
                          setImageError(true);
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        Image preview
                      </span>
                    </div>
                  )}
                </div>
              )}
            </form.AppField>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="submit" form="profile-form" disabled={isSubmitting}>
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
