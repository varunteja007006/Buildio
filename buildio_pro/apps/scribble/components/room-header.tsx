"use client";

import { Button } from "@workspace/ui/components/button";
import { Copy, Settings, Play } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@workspace/games-convex-backend/convex/_generated/api";
import { CopyBtn } from "@/components/atoms/copy-btn";
import { useUserStore } from "@/lib/store/user.store";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { GameSettingsDialog } from "@/components/game-settings-dialog";

export function RoomHeader() {
  const params = useParams();
  const roomCode = params?.roomCode ?? "";
  const { userToken, user } = useUserStore();

  const roomDetails = useQuery(api.rooms.getRoomDetails, {
    userToken,
    roomCode: roomCode as string,
  });

  const isOwner = roomDetails?.room?.ownerId === user?.id;

  return (
    <div className="w-full flex justify-between gap-2 items-center">
      <div>
        <p className="font-bold text-lg text-primary">
          {roomDetails?.room?.room_name}
        </p>
      </div>
      <div className="flex flex-row items-center gap-2 justify-end">
        {isOwner && (
          <>
            <Button className="cursor-pointer" size="sm">
              <Play className="mr-2 h-4 w-4" />
              Start Game
            </Button>
            <Tooltip>
              <GameSettingsDialog roomCode={roomCode as string}>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
              </GameSettingsDialog>
              <TooltipContent>
                <p>Game Settings</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
        <Link href={"/rooms"}>
          <Button variant={"destructive"} className="cursor-pointer">
            Leave Room
          </Button>
        </Link>
        <CopyBtn text={roomCode as string} variant="outline">
          <Copy className="mr-2 h-4 w-4" />
          Copy Room Code
        </CopyBtn>
      </div>
    </div>
  );
}
