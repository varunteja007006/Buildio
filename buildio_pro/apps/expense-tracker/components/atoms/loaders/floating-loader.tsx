"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { X } from "lucide-react";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";

type Side = "top" | "bottom";
type Align = "start" | "center" | "end";

interface FloatingLoaderProps {
  /** Controls visibility of the loader */
  open?: boolean;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Loading text to display */
  title?: string;
  /** Position from top or bottom */
  side?: Side;
  /** Distance from the edge in pixels */
  sideOffset?: number;
  /** Horizontal alignment */
  align?: Align;
  /** Distance from left/right edge when align is start/end */
  alignOffset?: number;
  /** Custom portal container */
  portalContainer?: Element | DocumentFragment | null;
  /** Additional class names */
  className?: string;
  /** Show close button */
  dismissible?: boolean;
}

function FloatingLoader(props: FloatingLoaderProps) {
  const {
    open = false,
    onClose,
    title = "Loading...",
    side = "bottom",
    sideOffset = 16,
    align = "center",
    alignOffset = 16,
    portalContainer: portalContainerProp,
    className,
    dismissible = false,
  } = props;

  const [mounted, setMounted] = React.useState(false);

  React.useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const portalContainer =
    portalContainerProp ?? (mounted ? globalThis.document?.body : null);

  if (!portalContainer || !open) return null;

  return ReactDOM.createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-slot="floating-loader"
      data-side={side}
      data-align={align}
      className={cn(
        "fixed z-50 flex items-center gap-2.5 rounded-full border bg-card px-4 py-2 shadow-lg",
        "fade-in-0 zoom-in-95 animate-in duration-250 [animation-timing-function:cubic-bezier(0.16,1,0.3,1)]",
        "data-[side=bottom]:slide-in-from-bottom-4 data-[side=top]:slide-in-from-top-4",
        "motion-reduce:animate-none motion-reduce:transition-none",
        className,
      )}
      style={{
        [side]: `${sideOffset}px`,
        ...(align === "center" && {
          left: "50%",
          translate: "-50% 0",
        }),
        ...(align === "start" && { left: `${alignOffset}px` }),
        ...(align === "end" && { right: `${alignOffset}px` }),
      }}
    >
      <Spinner className="size-4" />
      <span className="text-sm font-medium text-foreground">{title}</span>
      {dismissible && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-1 rounded-full p-0.5 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Dismiss"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>,
    portalContainer,
  );
}

export { FloatingLoader, type FloatingLoaderProps };
