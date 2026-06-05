"use client";

import { useEffect } from "react";

import confetti from "canvas-confetti";
import { PartyPopper } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

export function ConfettiSideCannonsBtn({
  children,
  onClickCb,
  className,
  autoTrigger = false,
  size = "default",
  ...props
}: {
  size?: "sm" | "default" | "lg";
  onClickCb?: () => void;
  autoTrigger?: boolean; // whether to auto trigger confetti on mount
} & React.ComponentProps<"button">) {
  const handleClick = () => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  const handleClickWithCb = () => {
    handleClick();
    if (onClickCb) {
      onClickCb();
    }
  };

  // auto trigger confetti when props change (for example, when teamReactions update)
  useEffect(() => {
    if (autoTrigger) {
      handleClick();
    }
  }, [autoTrigger]);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={handleClickWithCb}
        {...props}
        className={cn("", className)}
        size={size}
      >
        {children || (
          <>
            <PartyPopper />
          </>
        )}
      </Button>
    </div>
  );
}
