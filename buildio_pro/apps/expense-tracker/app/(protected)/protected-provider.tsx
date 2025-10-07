"use client";

import React from "react";

import { Spinner } from "@/components/atoms/loader";
import { useSession } from "@/lib/auth-client";

export default function ProtectedProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex flex-col min-h-screen items-center">
        <Spinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[calc(100dvh-20dvh)] flex flex-col items-center w-full justify-center">
        Not Authenticated...
      </div>
    );
  }

  return <>{children}</>;
}
