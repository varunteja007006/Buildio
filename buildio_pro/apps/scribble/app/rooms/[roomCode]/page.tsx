"use client";

import React from "react";
import { useUserStore } from "@/lib/store/user.store";
import { RoomHeader } from "@/components/room-header";
import { Participants } from "@/components/participants";

export default function RoomPage() {
  const { user } = useUserStore();

  if (!user?.id) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading user...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 md:flex-row px-4 py-2">
      <div className="flex flex-col w-full gap-4">
        <RoomHeader />

        <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] gap-10 bg-card rounded-md border">
          <p className="text-muted-foreground">Canvas will be here</p>
        </div>
      </div>

      <div className="w-full md:w-80">
        <Participants />
      </div>
    </div>
  );
}
