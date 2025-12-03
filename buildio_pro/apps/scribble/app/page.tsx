"use client";

import { UserRegistration } from "@/components/user-registration";
import { ModeToggle } from "@/components/mode-toggle";
import { Pencil } from "lucide-react";
import { useUserStore } from "@/lib/store/user.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export default function Page() {
	const { userToken } = useUserStore();
	const router = useRouter();

	useEffect(() => {
		if (userToken) {
			router.push("/rooms");
		}
	}, [userToken, router]);

	return (
		<div className="min-h-screen flex flex-col">
			{/* Header */}
			<header className="p-6 flex justify-between items-center">
				<h1 className="text-2xl flex flex-row gap-2 font-bold tracking-tight">
					<span>
						<Pencil className="size-8" />
					</span>{" "}
					Scribble
				</h1>
				<nav className="space-x-6">
					<ModeToggle />
				</nav>
			</header>

			{/* Hero */}
			<main className="flex-1 flex flex-col justify-center items-center text-center px-4">
				<div className="grid grid-cols-1 gap-5 lg:grid-cols-2 place-items-center h-[500px]">
					<div className="p-5">
						<h1 className="text-primary text-5xl">Welcome to Scribble</h1>
						{userToken && (
							<div className="mt-4">
								<Button asChild>
									<Link href="/rooms">Go to Rooms</Link>
								</Button>
							</div>
						)}
					</div>
					<div className="p-5">
						{!userToken && (
							<UserRegistration onSuccess={() => router.push("/rooms")} />
						)}
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="text-center mt-10 text-gray-500 p-4 text-sm border-t border-gray-800">
				© {new Date().getFullYear()} Buildio.pro — Crafted with ❤️
			</footer>
		</div>
	);
}
