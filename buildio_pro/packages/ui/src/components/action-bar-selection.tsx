"use client";

import { Slot } from "@radix-ui/react-slot";

import { type DivProps } from "@workspace/ui/components/action-bar-context";
import { cn } from "@workspace/ui/lib/utils";

function ActionBarSelection(props: DivProps) {
  const { className, asChild, ...selectionProps } = props;

  const SelectionPrimitive = asChild ? Slot : "div";

  return (
    <SelectionPrimitive
      data-slot="action-bar-selection"
      {...selectionProps}
      className={cn(
        "flex items-center gap-1 rounded-sm border px-2 py-1 font-medium text-sm tabular-nums",
        className,
      )}
    />
  );
}

export { ActionBarSelection };
