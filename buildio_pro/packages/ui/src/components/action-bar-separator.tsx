"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import {
  type DivProps,
  type Orientation,
  SEPARATOR_NAME,
  useActionBarContext,
} from "@workspace/ui/components/action-bar-context";
import { cn } from "@workspace/ui/lib/utils";

interface ActionBarSeparatorProps extends DivProps {
  orientation?: Orientation;
}

function ActionBarSeparator(props: ActionBarSeparatorProps) {
  const {
    orientation: orientationProp,
    asChild,
    className,
    ...separatorProps
  } = props;

  const context = useActionBarContext(SEPARATOR_NAME);
  const orientation = orientationProp ?? context.orientation;

  const SeparatorPrimitive = asChild ? Slot : "div";

  return (
    <SeparatorPrimitive
      role="separator"
      aria-orientation={orientation}
      aria-hidden="true"
      data-slot="action-bar-separator"
      {...separatorProps}
      className={cn(
        "in-data-[slot=action-bar-selection]:ml-0.5 in-data-[slot=action-bar-selection]:h-4 in-data-[slot=action-bar-selection]:w-px bg-border",
        orientation === "horizontal" ? "h-6 w-px" : "h-px w-full",
        className,
      )}
    />
  );
}

export { ActionBarSeparator };
