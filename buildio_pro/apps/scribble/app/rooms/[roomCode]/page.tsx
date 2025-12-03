"use client";

import React, { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/lib/store/user.store";
import { RoomHeader } from "@/components/room-header";
import { Participants } from "@/components/participants";
import dynamic from "next/dynamic";

const Canvas = dynamic(
	() => import("@/components/canvas").then((mod) => mod.Canvas),
	{
		ssr: false,
		loading: () => (
			<div className="flex items-center justify-center h-full">
				Loading Canvas...
			</div>
		),
	}
);

export default function RoomPage() {
	const { user } = useUserStore();
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const updateDimensions = () => {
			if (containerRef.current) {
				setDimensions({
					width: containerRef.current.offsetWidth,
					height: containerRef.current.offsetHeight,
				});
			}
		};

		updateDimensions();
		window.addEventListener("resize", updateDimensions);

		return () => window.removeEventListener("resize", updateDimensions);
	}, []);

	if (!user?.id) {
		return (
			<div className="flex h-screen items-center justify-center">
				<p>Loading user...</p>
			</div>
		);
	}

	return (
		<div className="w-full flex flex-col gap-4 md:flex-row px-4 py-2 h-[calc(100vh-1rem)]">
			<div className="flex flex-col w-full gap-4 h-full">
				<RoomHeader />

				<div
					ref={containerRef}
					className="flex-1 w-full bg-muted/20 rounded-md border overflow-hidden relative"
				>
					{dimensions.width > 0 && dimensions.height > 0 ? (
						<Canvas width={dimensions.width} height={dimensions.height} />
					) : (
						<div className="flex items-center justify-center h-full text-muted-foreground">
							Initializing Canvas...
						</div>
					)}
				</div>
			</div>

			<div className="w-full md:w-80 h-full">
				<Participants />
			</div>
		</div>
	);
}
