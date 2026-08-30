"use client";


import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import * as React from "react";

import { TRPCAppProvider } from "@/lib/trpc-client";

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
