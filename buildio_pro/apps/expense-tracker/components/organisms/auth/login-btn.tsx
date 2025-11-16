"use client";

import React from "react";

import { Button } from "@workspace/ui/components/button";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

export function LoginBtn() {
	const { data } = useSession();

	if (data?.user) {
		return (
			<Link href={"/dashboard"}>
				<Button size={"sm"}>Dashboard</Button>
			</Link>
		);
	}

	return (
		<Link href={"/login"}>
			<Button size={"sm"}>Login</Button>
		</Link>
	);
}
