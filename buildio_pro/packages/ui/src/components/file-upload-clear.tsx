"use client";

import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";

import {
  CLEAR_NAME,
  useFileUploadContext,
  useStore,
  useStoreContext,
} from "@workspace/ui/components/file-upload-context";

interface FileUploadClearProps extends React.ComponentProps<"button"> {
  forceMount?: boolean;
  asChild?: boolean;
}

function FileUploadClear(props: FileUploadClearProps) {
  const {
    asChild,
    forceMount,
    disabled,
    onClick: onClickProp,
    ...clearProps
  } = props;

  const context = useFileUploadContext(CLEAR_NAME);
  const store = useStoreContext(CLEAR_NAME);
  const fileCount = useStore((state) => state.files.size);

  const isDisabled = disabled || context.disabled;

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);

      if (event.defaultPrevented) return;

      store.dispatch({ type: "CLEAR" });
    },
    [store, onClickProp],
  );

  const shouldRender = forceMount || fileCount > 0;

  if (!shouldRender) return null;

  const ClearPrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <ClearPrimitive
      type="button"
      aria-controls={context.listId}
      data-slot="file-upload-clear"
      data-disabled={isDisabled ? "" : undefined}
      {...clearProps}
      disabled={isDisabled}
      onClick={onClick}
    />
  );
}

export { FileUploadClear };
