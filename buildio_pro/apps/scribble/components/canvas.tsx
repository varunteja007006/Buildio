"use client";

import React, { useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Button } from "@workspace/ui/components/button";
import { ButtonGroup } from "@workspace/ui/components/button-group";

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

export function Canvas({ width = 800, height = 600 }: CanvasProps) {
	const [tool, setTool] = useState("pen");
	const [lines, setLines] = useState<LineData[]>([]);
	const isDrawing = useRef(false);
	const [strokeWidth, setStrokeWidth] = useState(5);
	const [eraserWidth, setEraserWidth] = useState(12);
	const [strokeColor, setStrokeColor] = useState("#000000");

	const colors = [
		{ label: "Red", value: "#ef4444" },
		{ label: "Orange", value: "#f97316" },
		{ label: "Yellow", value: "#eab308" },
		{ label: "Green", value: "#22c55e" },
		{ label: "Blue", value: "#3b82f6" },
		{ label: "Black", value: "#000000" },
		{ label: "White", value: "#ffffff" },
	];

	const handleMouseDown = (e: KonvaEventObject<any>) => {
		isDrawing.current = true;
		const pos = e.target.getStage()?.getPointerPosition();
		if (!pos) return;

		const widthForTool = tool === "eraser" ? eraserWidth : strokeWidth;
		setLines([
			...lines,
			{
				id: Date.now().toString(),
				tool,
				strokeWidth: widthForTool,
				strokeColor,
				points: [pos.x, pos.y],
			},
		]);
	};

	const handleMouseMove = (e: KonvaEventObject<any>) => {
		// no drawing - skipping
		if (!isDrawing.current) {
			return;
		}
		const stage = e.target.getStage();
		const point = stage?.getPointerPosition();
		if (!point) return;

		const lastLine = lines.at(-1);
		if (!lastLine) return;

		// add point
		const newPoints = lastLine.points.concat([point.x, point.y]);
		const newLastLine = { ...lastLine, points: newPoints };

		// replace last
		const newLines = lines.slice(0, -1).concat(newLastLine);
		setLines(newLines);
	};

	const handleMouseUp = () => {
		isDrawing.current = false;
	};

	return (
		<div className="relative border rounded-md overflow-hidden bg-white">
			<ButtonGroup className="absolute top-2 left-2 z-10 ">
				<Button variant="secondary" size={"sm"} onClick={() => setTool("pen")}>
					Pen
				</Button>
				<Button
					variant="secondary"
					size={"sm"}
					onClick={() => setTool("eraser")}
				>
					Eraser
				</Button>
				<Button variant="secondary" size={"sm"} onClick={() => setLines([])}>
					Clear
				</Button>
				<Button variant="outline" size={"sm"} onClick={() => setStrokeWidth(1)}>
					<span className="size-1 bg-black"></span>
				</Button>
				<Button variant="outline" size={"sm"} onClick={() => setStrokeWidth(3)}>
					<span className="size-3 bg-black"></span>
				</Button>
				<Button variant="outline" size={"sm"} onClick={() => setStrokeWidth(5)}>
					<span className="size-5 bg-black"></span>
				</Button>
				<Button variant="outline" size={"sm"} onClick={() => setEraserWidth(8)}>
					<span className="size-4 bg-white border border-slate-400"></span>
				</Button>
				<Button variant="outline" size={"sm"} onClick={() => setEraserWidth(14)}>
					<span className="size-6 bg-white border border-slate-400"></span>
				</Button>
				<Button variant="outline" size={"sm"} onClick={() => setEraserWidth(20)}>
					<span className="size-8 bg-white border border-slate-400"></span>
				</Button>
				{colors.map((color) => (
					<Button
						key={color.value}
						variant="outline"
						size={"sm"}
						onClick={() => setStrokeColor(color.value)}
					>
						<span
							className="size-4 rounded-full border border-slate-300"
							style={{ backgroundColor: color.value }}
						></span>
					</Button>
				))}
			</ButtonGroup>
			<Stage
				width={width}
				height={height}
				onMouseDown={handleMouseDown}
				onMousemove={handleMouseMove}
				onMouseup={handleMouseUp}
				onTouchStart={handleMouseDown}
				onTouchMove={handleMouseMove}
				onTouchEnd={handleMouseUp}
			>
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
			</Stage>
		</div>
	);
}
