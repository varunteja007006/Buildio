"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { toast } from "sonner";

import { Copy } from "lucide-react";

type CopyBtnProps = {
  text: string;
  children?: React.ReactNode;
  tooltipText?: string;
} & React.ComponentProps<"button">;

export function CopyBtn({
  text,
  tooltipText,
  children,
  ...props
}: Readonly<CopyBtnProps>) {
  const handleCopyRoomCode = () => {
    try {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
      console.error("Failed to copy: ", error);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={handleCopyRoomCode}
          className="cursor-pointer"
          {...props}
        >
          {children ?? <Copy />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText ?? "Click to copy"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
