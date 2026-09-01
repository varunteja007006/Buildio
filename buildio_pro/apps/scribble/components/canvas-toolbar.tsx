"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { CircleX, Eraser, Pencil } from "lucide-react";

const COLORS = [
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Yellow", value: "#eab308" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Black", value: "#000000" },
  { label: "White", value: "#ffffff" },
];

interface CanvasToolbarProps {
  onSelectTool: (tool: "pen" | "eraser") => void;
  onClear: () => void;
  onSelectColor: (color: string) => void;
  onSelectStrokeWidth: (width: number) => void;
  onSelectEraserWidth: (width: number) => void;
}

export function CanvasToolbar({
  onSelectTool,
  onClear,
  onSelectColor,
  onSelectStrokeWidth,
  onSelectEraserWidth,
}: CanvasToolbarProps) {
  const tools = [
    {
      label: "Pen",
      action: () => onSelectTool("pen"),
      icon: Pencil,
    },
    {
      label: "Eraser",
      action: () => onSelectTool("eraser"),
      icon: Eraser,
    },
    {
      label: "Clear",
      action: onClear,
      icon: CircleX,
    },
  ];

  const strokeWidths = [
    {
      label: "Thin",
      action: () => onSelectStrokeWidth(1),
      child: <span className="size-1 bg-gray-500"></span>,
    },
    {
      label: "Medium",
      action: () => onSelectStrokeWidth(3),
      child: <span className="size-3 bg-gray-500"></span>,
    },
    {
      label: "Thick",
      action: () => onSelectStrokeWidth(5),
      child: <span className="size-5 bg-gray-500"></span>,
    },
  ];

  const eraserWidths = [
    {
      label: "Small Eraser",
      action: () => onSelectEraserWidth(8),
      child: <span className="size-2 bg-white"></span>,
    },
    {
      label: "Medium Eraser",
      action: () => onSelectEraserWidth(14),
      child: <span className="size-4 bg-white"></span>,
    },
    {
      label: "Large Eraser",
      action: () => onSelectEraserWidth(20),
      child: <span className="size-6 bg-white"></span>,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-background shrink-0">
      {tools.map((tool) => (
        <Tooltip key={tool.label}>
          <TooltipTrigger asChild>
            <Button variant="secondary" size={"icon-sm"} onClick={tool.action}>
              {<tool.icon className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tool.label}</TooltipContent>
        </Tooltip>
      ))}

      {COLORS.map((color) => (
        <Tooltip key={color.value}>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size={"sm"}
              onClick={() => onSelectColor(color.value)}
            >
              <span
                className="size-4 rounded-full border border-slate-300"
                style={{ backgroundColor: color.value }}
              ></span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{color.label}</TooltipContent>
        </Tooltip>
      ))}

      {strokeWidths.map((sw) => (
        <Tooltip key={sw.label}>
          <TooltipTrigger asChild>
            <Button variant="secondary" size={"sm"} onClick={sw.action}>
              {sw.child}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{sw.label}</TooltipContent>
        </Tooltip>
      ))}

      {eraserWidths.map((ew) => (
        <Tooltip key={ew.label}>
          <TooltipTrigger asChild>
            <Button variant="secondary" size={"sm"} onClick={ew.action}>
              {ew.child}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{ew.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
