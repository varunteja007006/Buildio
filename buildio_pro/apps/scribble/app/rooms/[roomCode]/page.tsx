"use client";

import React from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import usePresence from "@convex-dev/presence/react";
import { api } from "@workspace/games-convex-backend/convex/_generated/api";

import { useUserStore } from "@/lib/store/user.store";
import { ParticipantCard } from "@/components/participant-card";

export default function RoomPage() {
  const params = useParams();
  const roomCode = (params?.roomCode as string) ?? "";
  const { user } = useUserStore();

  const presenceState = usePresence(
    api.presence,
    roomCode,
    user?.id ?? ""
  );

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success("Room code copied to clipboard");
  };

  if (!user?.id) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading user...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col items-center gap-8 py-10">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold">Room Code</h1>
        <div
          className="flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-6 py-3 text-2xl font-mono shadow-sm transition-colors hover:bg-accent"
          onClick={handleCopyRoomCode}
          title="Click to copy"
        >
          <span>{roomCode}</span>
          <Copy className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-center">Participants</h2>
        <div className="space-y-2">
          {presenceState ? (
            presenceState.map((participant) => (
              <ParticipantCard
                key={participant.userId}
                name={participant.name ?? "Unknown User"}
                online={participant.online}
                lastDisconnected={participant.lastDisconnected}
                emojiId={participant.userId}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              Waiting for participants...
            </p>
          )}
          {presenceState && presenceState.length === 0 && (
             <p className="text-center text-muted-foreground">
              No participants yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
