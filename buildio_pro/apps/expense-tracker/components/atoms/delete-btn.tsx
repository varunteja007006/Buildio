import React from "react";

import { Button } from "@workspace/ui/components/button";
import { Trash2 } from "lucide-react";

export function DeleteBtn({
  iconOnly,
  ...props
}: React.ComponentProps<"button"> & {
  iconOnly?: boolean;
}) {
  return (
    <Button size={"sm"} variant="destructive" {...props}>
      {iconOnly ? (
        <Trash2 className="h-4 w-4" />
      ) : (
        <>
          <Trash2 className="h-4 w-4" />
          Delete
        </>
      )}
    </Button>
  );
}
