import React from "react";

import { Trash2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

export function DeleteBtn({
  iconOnly,
  children,
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
          {children ? (
            children
          ) : (
            <>
              <Trash2 className="h-4 w-4" /> Delete
            </>
          )}
        </>
      )}
    </Button>
  );
}
