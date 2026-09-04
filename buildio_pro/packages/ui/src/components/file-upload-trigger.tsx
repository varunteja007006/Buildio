"use client";

import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";

import {
  TRIGGER_NAME,
  useFileUploadContext,
} from "@workspace/ui/components/file-upload-context";
import { useAsRef } from "@workspace/ui/hooks/use-as-ref";

interface FileUploadTriggerProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function FileUploadTrigger(props: FileUploadTriggerProps) {
  const { asChild, onClick: onClickProp, ...triggerProps } = props;

  const context = useFileUploadContext(TRIGGER_NAME);

  const propsRef = useAsRef({
    onClick: onClickProp,
  });

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      propsRef.current.onClick?.(event);

      if (event.defaultPrevented) return;

      context.inputRef.current?.click();
    },
    [context.inputRef, propsRef],
  );

  const TriggerPrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <TriggerPrimitive
      type="button"
      aria-controls={context.inputId}
      data-disabled={context.disabled ? "" : undefined}
      data-slot="file-upload-trigger"
      {...triggerProps}
      disabled={context.disabled}
      onClick={onClick}
    />
  );
}

export { FileUploadTrigger };
