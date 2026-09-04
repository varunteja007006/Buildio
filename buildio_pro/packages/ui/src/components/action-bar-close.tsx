"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import {
  CLOSE_NAME,
  useActionBarContext,
} from "@workspace/ui/components/action-bar-context";
import { cn } from "@workspace/ui/lib/utils";

type CloseElement = React.ComponentRef<typeof ActionBarClose>;

interface ActionBarCloseProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function ActionBarClose(props: ActionBarCloseProps) {
  const { asChild, className, onClick, ...closeProps } = props;

  const { onOpenChange } = useActionBarContext(CLOSE_NAME);

  const onCloseClick = React.useCallback(
    (event: React.MouseEvent<CloseElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;

      onOpenChange?.(false);
    },
    [onOpenChange, onClick],
  );

  const ClosePrimitive = asChild ? Slot : "button";

  return (
    <ClosePrimitive
      type="button"
      data-slot="action-bar-close"
      {...closeProps}
      className={cn(
        "rounded-xs opacity-70 outline-none hover:opacity-100 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      onClick={onCloseClick}
    />
  );
}

export { ActionBarClose };
