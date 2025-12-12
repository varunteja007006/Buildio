"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/lib/store/user.store";
import { RoomHeader } from "@/components/room-header";
import { Participants } from "@/components/participants";
import { ChatBox } from "@/components/chat-box";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/games-convex-backend/convex/_generated/api";

const Canvas = dynamic(
  () => import("@/components/canvas").then((mod) => mod.Canvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        Loading Canvas...
      </div>
    ),
  },
);

export default function RoomPage() {
  const { user, userToken } = useUserStore();
  const params = useParams();
  const roomCode = params.roomCode as string;
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const roomDetails = useQuery(api.rooms.getRoomDetails, {
    userToken,
    roomCode,
  });
  const initializeSettings = useMutation(api.scribble.initializeGameSettings);
  const joinRoom = useMutation(api.rooms.joinRoom);
  const isOwner = roomDetails?.room?.ownerId === user?.id;

  // Initialize default game settings when owner joins
  useEffect(() => {
    if (isOwner && userToken && roomCode) {
      initializeSettings({ roomCode, userToken }).catch(console.error);
    }
    if (userToken && roomCode) {
      joinRoom({ roomCode, userToken }).catch(console.error);
    }
  }, [isOwner, userToken, roomCode]);

  useEffect(() => {
    if (!container) return;

    const updateDimensions = () => {
      setDimensions({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [container]);

  if (!user?.id) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <p>Loading user...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-1 md:flex-row p-1 md:px-2 md:py-4 h-[calc(100vh-10rem)]">
      <div className="flex flex-col min-w-0 gap-1 h-[50%] md:h-full md:flex-1">
        <RoomHeader />

        <div
          ref={setContainer}
          className="flex-1 w-full bg-muted/20 rounded-md border overflow-hidden relative"
        >
          {dimensions.width > 0 && dimensions.height > 0 ? (
            <Canvas width={dimensions.width} height={dimensions.height} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Initializing Canvas...
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-row md:flex-col gap-1">
        <div>
          <Participants />
        </div>
        <div>
          <ChatBox roomCode={roomCode} />
        </div>
      </div>
    </div>
  );
}
