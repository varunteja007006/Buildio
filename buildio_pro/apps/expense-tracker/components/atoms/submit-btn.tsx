import { Button } from "@workspace/ui/components/button";
import { Field } from "@workspace/ui/components/field";
import { Loader2 } from "lucide-react";
import React from "react";

export function SubmitBtn({
  disabled,
  formId,
  loading,
}: {
  disabled?: boolean;
  formId: string;
  loading?: boolean;
}) {
  return (
    <Field orientation="horizontal">
      <Button type="submit" form={formId} disabled={disabled} className="w-36">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </Field>
  );
}
