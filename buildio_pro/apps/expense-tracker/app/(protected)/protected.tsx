"use client";
import React from "react";

import { useSession } from "@/lib/auth-client";
import Unauthorized from "@/components/organisms/auth/unauthorized";

export const Protected = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	const { data, isPending } = useSession();

	if (isPending) {
		return <>Loading....</>;
	}

	if (data?.user) {
		return <>{children}</>;
	}

	return <Unauthorized />
};
