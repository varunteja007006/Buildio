import React from "react";

import { Button } from "@workspace/ui/components/button";
import { Trash2 } from "lucide-react";

export function DeleteBtn({
  iconOnly,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  iconOnly?: boolean;
}) {
  return (
    <Button size={"sm"} variant="ghost" {...props}>
      {iconOnly ? (
        <Trash2 className="h-4 w-4 text-destructive" />
      ) : (
        <>
          {children ? (
            children
          ) : (
            <>
              <Trash2 className="h-4 w-4 text-destructive" /> Delete
            </>
          )}
        </>
      )}
    </Button>
  );
}
