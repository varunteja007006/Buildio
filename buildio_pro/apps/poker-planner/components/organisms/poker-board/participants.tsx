import React from "react";

import { useQuery } from "convex/react";
import type { Id } from "@workspace/games-convex-backend/convex/_generated/dataModel";
import { api } from "@workspace/games-convex-backend/convex/_generated/api";
import usePresence from "@convex-dev/presence/react";

import { useParams } from "next/navigation";
import { ParticipantCard } from "./participant-card";
import { useUserStore } from "@/lib/store/user.store";

const findUserStoryPoint = (
  userId: string,
  list: {
    userId: string;
    isCurrentUser: boolean;
    storyPoint: string | number | undefined;
  }[]
) => {
  return list.find((item) => item.userId === userId);
};

export function Participants({
  storyId,
}: Readonly<{
  storyId: Id<"stories"> | null;
}>) {
  const params = useParams();
  const roomCode = params?.roomCode ?? "unknown-room";

  const { user, userToken } = useUserStore();

  const presenceState = usePresence(api.presence, roomCode as string, user?.id!);

  const roomStoryPoints = useQuery(
    api.storyPoints.getStoryPoints,
    storyId && userToken ? { storyId, token: userToken } : "skip"
  );

  const updatedRoomStoryPoints = React.useMemo(
    () =>
      roomStoryPoints?.success && roomStoryPoints.storyPoints
        ? roomStoryPoints.storyPoints.map((item) => ({
            userId: item.userId,
            isCurrentUser: item.isCurrentUser,
            storyPoint: item.story_point,
          }))
        : [],
    [roomStoryPoints]
  );

  const participantList = React.useMemo(
    () =>
      presenceState?.map((p) => {
        const foundUser = findUserStoryPoint(p.userId, updatedRoomStoryPoints);
        return {
          ...p,
          isCurrentUser: foundUser?.isCurrentUser,
          hasVoted: !!foundUser?.userId,
        };
      }) ?? [],
    [presenceState, updatedRoomStoryPoints]
  );

  if (!presenceState) {
    return null;
  }

  return (
    <div className="space-y-2">
      {participantList.map((user) => {
        return (
          <ParticipantCard
            key={user.userId}
            name={user.name ?? "Unknown User"}
            online={user.online}
            hasVoted={user?.hasVoted}
            lastDisconnected={user.lastDisconnected}
            emojiId={user.userId}
          />
        );
      })}
    </div>
  );
}
