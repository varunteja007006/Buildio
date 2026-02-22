"use client";
import React from "react";

import { GoofyLoader } from "@/components/atoms/loaders/goofy";
import Unauthorized from "@/components/organisms/auth/unauthorized";
import { useSession } from "@/lib/auth-client";

export const Protected = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { data, isPending } = useSession();

  if (isPending) {
    return <GoofyLoader />;
  }

  if (data?.user) {
    return <>{children}</>;
  }

  return <Unauthorized />;
};
