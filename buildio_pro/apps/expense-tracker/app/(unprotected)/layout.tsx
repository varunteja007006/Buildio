import React from "react";

import { Footer2 } from "@workspace/ui/components/footer2";
import { Navbar } from "@/components/organisms/navbar";

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<Navbar />
			{children}
			<Footer2 />
		</>
	);
}
