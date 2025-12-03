"use client";

import React, { useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";

interface CanvasProps {
	width?: number;
	height?: number;
}

interface LineData {
	id: string;
	tool: string;
	points: number[];
}

export function Canvas({ width = 800, height = 600 }: CanvasProps) {
	const [tool, setTool] = useState("pen");
	const [lines, setLines] = useState<LineData[]>([]);
	const isDrawing = useRef(false);

	const handleMouseDown = (e: KonvaEventObject<any>) => {
		isDrawing.current = true;
		const pos = e.target.getStage()?.getPointerPosition();
		if (!pos) return;
		setLines([
			...lines,
			{ id: Date.now().toString(), tool, points: [pos.x, pos.y] },
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
			<div className="absolute top-2 left-2 z-10 flex gap-2 bg-white/80 p-2 rounded-md shadow-sm border">
				<button
					className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
						tool === "pen"
							? "bg-primary text-primary-foreground"
							: "bg-secondary text-secondary-foreground hover:bg-secondary/80"
					}`}
					onClick={() => setTool("pen")}
				>
					Pen
				</button>
				<button
					className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
						tool === "eraser"
							? "bg-primary text-primary-foreground"
							: "bg-secondary text-secondary-foreground hover:bg-secondary/80"
					}`}
					onClick={() => setTool("eraser")}
				>
					Eraser
				</button>
				<button
					className="px-3 py-1 rounded text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
					onClick={() => setLines([])}
				>
					Clear
				</button>
			</div>
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
							stroke="#df4b26"
							strokeWidth={5}
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
