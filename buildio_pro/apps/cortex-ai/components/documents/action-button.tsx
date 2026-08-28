"use client"

import type { LucideIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

interface ActionButtonProps {
  label: string
  icon: LucideIcon
  onClick: () => void
  variant?: "ghost" | "destructive"
  disabled?: boolean
}

export function ActionButton({
  label,
  icon: Icon,
  onClick,
  variant = "ghost",
  disabled,
}: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size="icon-sm"
          aria-label={label}
          onClick={onClick}
          disabled={disabled}
        >
          <Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}