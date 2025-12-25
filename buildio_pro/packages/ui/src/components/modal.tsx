"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@workspace/ui/components/dialog";

interface ModalProps {
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
  header?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({
  title,
  description,
  trigger,
  open,
  onOpenChange,
  contentClassName,
  header,
  children,
  footer,
}: ModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const controlled = open !== undefined;
  const currentOpen = controlled ? open : internalOpen;
  const handleOpenChange = (v: boolean) => {
    if (!controlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={currentOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className={contentClassName}>
        {header ? (
          header
        ) : title || description ? (
          <DialogHeader>
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
        ) : null}
        {children}
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}

export { DialogClose };
