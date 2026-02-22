"use client";

import * as React from "react";

import { ThemeProvider as NextThemesProvider } from "next-themes";

import { UserStoreProvider } from "@/lib/store/user.store";

import { ConvexClientProvider } from "./convex-provider";

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
