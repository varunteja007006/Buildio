"use client";

import React, { useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Button } from "@workspace/ui/components/button";
import { ButtonGroup } from "@workspace/ui/components/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/games-convex-backend/convex/_generated/api";
import { useParams } from "next/navigation";
import { useUserStore } from "@/lib/store/user.store";
import { CircleX, Eraser, Pencil } from "lucide-react";

interface CanvasProps {
  width?: number;
  height?: number;
}

interface LineData {
  id: string;
  tool: string;
  points: number[];
  strokeWidth: number;
  strokeColor: string;
}

const colors = [
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Yellow", value: "#eab308" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Black", value: "#000000" },
  { label: "White", value: "#ffffff" },
];

export function Canvas({ width = 800, height = 600 }: CanvasProps) {
  const params = useParams();
  const roomCode = params.roomCode as string;
  const linesFromQuery = useQuery(api.scribble.getLines, {
    roomCode,
  });

  const { userToken, user } = useUserStore();

  const isDrawer = linesFromQuery?.[0]?.playerId === user?.id;

  const createLineStrokes = useMutation(api.scribble.createLineStrokes);
  const [tool, setTool] = useState("pen");
  const [lines, setLines] = useState<LineData[]>([]);
  const isDrawing = useRef(false);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [eraserWidth, setEraserWidth] = useState(12);
  const [strokeColor, setStrokeColor] = useState("#000000");

  const sendCreateLineStrokes = async ({
    tool,
    lines,
    isComplete = false,
  }: {
    tool: string;
    lines: LineData[];
    isComplete?: boolean;
  }) => {
    const res = await createLineStrokes({
      roomCode,
      userToken,
      tool,
      lines,
      isComplete,
    });

    console.log("CreateLineStrokes response: ", res);
  };

  const handleMouseDown = (e: KonvaEventObject<any>) => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const widthForTool = tool === "eraser" ? eraserWidth : strokeWidth;

    setLines((prev) => {
      const newLines = [
        ...prev,
        {
          id: Date.now().toString(),
          tool,
          strokeWidth: widthForTool,
          strokeColor,
          points: [pos.x, pos.y],
        },
      ];

      sendCreateLineStrokes({ tool, lines: newLines, isComplete: false });
      return newLines;
    });
  };

  const handleMouseMove = (e: KonvaEventObject<any>) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    setLines((lines) => {
      const lastLine = lines.at(-1);
      if (!lastLine) return lines;

      // add point
      const newPoints = lastLine.points.concat([point.x, point.y]);
      const newLastLine = { ...lastLine, points: newPoints };

      // replace last
      const newLines = lines.slice(0, -1).concat(newLastLine);
      return newLines;
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    sendCreateLineStrokes({ tool, lines, isComplete: false });
  };

  const tools = [
    {
      label: "Pen",
      action: () => setTool("pen"),
      icon: Pencil,
    },
    {
      label: "Eraser",
      action: () => setTool("eraser"),
      icon: Eraser,
    },
    {
      label: "Clear",
      action: () => setLines([]),
      icon: CircleX,
    },
  ];

  const strokeWidths = [
    {
      label: "Thin",
      action: () => setStrokeWidth(1),
      child: <span className="size-1 bg-gray-500"></span>,
    },
    {
      label: "Medium",
      action: () => setStrokeWidth(3),
      child: <span className="size-3 bg-gray-500"></span>,
    },
    {
      label: "Thick",
      action: () => setStrokeWidth(5),
      child: <span className="size-5 bg-gray-500"></span>,
    },
  ];

  const eraserWidths = [
    {
      label: "Small Eraser",
      action: () => setEraserWidth(8),
      child: <span className="size-2 bg-white"></span>,
    },
    {
      label: "Medium Eraser",
      action: () => setEraserWidth(14),
      child: <span className="size-4 bg-white"></span>,
    },
    {
      label: "Large Eraser",
      action: () => setEraserWidth(20),
      child: <span className="size-6 bg-white"></span>,
    },
  ];

  return (
    <div className="relative border rounded-md overflow-hidden bg-white">
      <ButtonGroup className="absolute top-2 left-2 z-10 flex-wrap">
        {tools.map((tool) => (
          <Tooltip key={tool.label}>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size={"icon-sm"}
                onClick={tool.action}
              >
                {<tool.icon className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{tool.label}</TooltipContent>
          </Tooltip>
        ))}

        {colors.map((color) => (
          <React.Fragment key={color.value}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size={"sm"}
                  onClick={() => setStrokeColor(color.value)}
                >
                  <span
                    className="size-4 rounded-full border border-slate-300"
                    style={{ backgroundColor: color.value }}
                  ></span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{color.label}</TooltipContent>
            </Tooltip>
          </React.Fragment>
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
      </ButtonGroup>

      <Stage
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {isDrawer ? (
          <Layer>
            {lines.map((line) => (
              <Line
                key={line.id}
                points={line.points}
                stroke={line.strokeColor}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === "eraser" ? "destination-out" : "source-over"
                }
              />
            ))}
          </Layer>
        ) : (
          <Layer>
            {linesFromQuery?.[0]?.lines &&
              linesFromQuery?.[0]?.lines.map((line) => {
                return (
                  <React.Fragment key={line.id}>
                    <Line
                      points={line.points}
                      stroke={line.strokeColor}
                      strokeWidth={line.strokeWidth}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                      globalCompositeOperation={
                        line.tool === "eraser"
                          ? "destination-out"
                          : "source-over"
                      }
                    />
                  </React.Fragment>
                );
              })}
          </Layer>
        )}
      </Stage>
    </div>
  );
}
