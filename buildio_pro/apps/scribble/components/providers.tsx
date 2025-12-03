"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ConvexClientProvider } from "./convex-provider";
import { UserStoreProvider } from "@/lib/store/user.store";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
			enableColorScheme
		>
			<ConvexClientProvider>
				<UserStoreProvider>{children}</UserStoreProvider>
			</ConvexClientProvider>
		</NextThemesProvider>
	);
}
