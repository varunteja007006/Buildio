"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { TRPCAppProvider } from "@/lib/trpc-client";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <NuqsAdapter>
        <TRPCAppProvider>{children}</TRPCAppProvider>
      </NuqsAdapter>
    </NextThemesProvider>
  );
}
