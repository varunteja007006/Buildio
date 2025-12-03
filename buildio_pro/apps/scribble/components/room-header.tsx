"use client";

import { Button } from "@workspace/ui/components/button";
import { Copy } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@workspace/games-convex-backend/convex/_generated/api";
import { CopyBtn } from "@/components/atoms/copy-btn";
import { useUserStore } from "@/lib/store/user.store";
import { useParams } from "next/navigation";
import Link from "next/link";

export function RoomHeader() {
  const params = useParams();
  const roomCode = params?.roomCode ?? "";
  const { userToken } = useUserStore();

  const roomDetails = useQuery(api.rooms.getRoomDetails, {
    userToken,
    roomCode: roomCode as string,
  });

  return (
    <div className="w-full flex justify-between gap-2 items-center">
      <div>
        <p className="font-bold text-lg text-primary">
          {roomDetails?.room?.room_name}
        </p>
      </div>
      <div className="flex flex-row items-center gap-2 justify-end">
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
