import React from "react";

import { Button } from "@workspace/ui/components/button";
import { Loader2 } from "lucide-react";

export function SubmitBtn({
  formId,
  loading,
  ...props
}: {
  disabled?: boolean;
  formId: string;
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button type="submit" form={formId} className="w-36" {...props}>
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        "Save Changes"
      )}
    </Button>
  );
}
