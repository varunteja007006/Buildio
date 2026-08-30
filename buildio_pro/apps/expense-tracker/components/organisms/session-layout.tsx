"use client";
import React from "react";

import { GoofyLoader } from "@/components/atoms/loaders/goofy";
import { useSession } from "@/lib/auth-client";

export function SessionLayout({
  protectedShell,
  publicShell,
}: Readonly<{
  protectedShell: React.ReactNode;
  publicShell: React.ReactNode;
}>) {
  const { data, isPending } = useSession();

  if (isPending) {
    return <GoofyLoader />;
  }

  return <>{data?.user ? protectedShell : publicShell}</>;
}
