"use client";

import {
  DragOverlay,
  type DropAnimation,
  type UniqueIdentifier,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import * as React from "react";
import * as ReactDOM from "react-dom";

import {
  OVERLAY_NAME,
  SortableOverlayContext,
  useSortableContext,
} from "@workspace/ui/components/sortable-context";
import { cn } from "@workspace/ui/lib/utils";

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

interface SortableOverlayProps extends Omit<
  React.ComponentProps<typeof DragOverlay>,
  "children"
> {
  container?: Element | DocumentFragment | null;
  children?:
    | ((params: { value: UniqueIdentifier }) => React.ReactNode)
    | React.ReactNode;
}

function SortableOverlay(props: SortableOverlayProps) {
  const { container: containerProp, children, ...overlayProps } = props;

  const context = useSortableContext(OVERLAY_NAME);

  const [mounted, setMounted] = React.useState(false);
  React.useLayoutEffect(() => setMounted(true), []);

  const container =
    containerProp ?? (mounted ? globalThis.document?.body : null);

  if (!container) return null;

  return ReactDOM.createPortal(
    <DragOverlay
      dropAnimation={dropAnimation}
      modifiers={context.modifiers}
      className={cn(!context.flatCursor && "cursor-grabbing")}
      {...overlayProps}
    >
      <SortableOverlayContext.Provider value={true}>
        {context.activeId
          ? typeof children === "function"
            ? children({ value: context.activeId })
            : children
          : null}
      </SortableOverlayContext.Provider>
    </DragOverlay>,
    container,
  );
}

export { SortableOverlay };
