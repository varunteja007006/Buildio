"use client";

import React from "react";
import { useUserStore } from "@/lib/store/user.store";
import { UserRegistrationDialog } from "@/components/user-registration-dialog";

export default function RoomLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userToken } = useUserStore();

  if (!userToken) {
    return <UserRegistrationDialog defaultOpen={true} />;
  }

  return <>{children}</>;
}
