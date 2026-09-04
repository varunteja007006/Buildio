"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import {
  ITEM_HANDLE_NAME,
  useSortableContext,
  useSortableItemContext,
} from "@workspace/ui/components/sortable-context";
import { useComposedRefs } from "@workspace/ui/lib/compose-refs";
import { cn } from "@workspace/ui/lib/utils";

interface SortableItemHandleProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function SortableItemHandle(props: SortableItemHandleProps) {
  const { asChild, disabled, className, ref, ...itemHandleProps } = props;

  const context = useSortableContext(ITEM_HANDLE_NAME);
  const itemContext = useSortableItemContext(ITEM_HANDLE_NAME);

  const isDisabled = disabled ?? itemContext.disabled;

  const composedRef = useComposedRefs(ref, (node) => {
    if (!isDisabled) return;
    itemContext.setActivatorNodeRef(node);
  });

  const HandlePrimitive = asChild ? Slot : "button";

  return (
    <HandlePrimitive
      type="button"
      aria-controls={itemContext.id}
      data-disabled={isDisabled}
      data-dragging={itemContext.isDragging ? "" : undefined}
      data-slot="sortable-item-handle"
      {...itemHandleProps}
      {...(isDisabled ? {} : itemContext.attributes)}
      {...(isDisabled ? {} : itemContext.listeners)}
      ref={composedRef}
      className={cn(
        "select-none disabled:pointer-events-none disabled:opacity-50",
        context.flatCursor
          ? "cursor-default"
          : "cursor-grab data-dragging:cursor-grabbing",
        className,
      )}
      disabled={isDisabled}
    />
  );
}

export { SortableItemHandle };
