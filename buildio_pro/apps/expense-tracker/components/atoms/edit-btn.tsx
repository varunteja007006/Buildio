import React from "react";

import { Button } from "@workspace/ui/components/button";
import { Edit2 } from "lucide-react";

export function EditBtn({
  iconOnly,
  ...props
}: React.ComponentProps<"button"> & {
  iconOnly?: boolean;
}) {
  return (
    <Button size={"sm"} variant={"ghost"} {...props}>
      {iconOnly ? (
        <Edit2 className="h-4 w-4 text-primary" />
      ) : (
        <>
          <Edit2 className="h-4 w-4 text-primary" />
          Edit
        </>
      )}
    </Button>
  );
}
