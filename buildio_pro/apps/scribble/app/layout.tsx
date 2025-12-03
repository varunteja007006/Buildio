import type { Metadata } from "next";

import { Providers } from "@/components/providers";
import { Toaster } from "@workspace/ui/components/sonner";

import "@workspace/ui/globals.css";

export const metadata: Metadata = {
	title: "Buildio.pro",
	description: "Build something epic. Buildio.pro",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="apple-mobile-web-app-title" content="buildio.pro" />
			</head>
			<body className="font-sans antialiased">
				<Providers>
					{children}
					<Toaster />
				</Providers>
			</body>
		</html>
	);
}
