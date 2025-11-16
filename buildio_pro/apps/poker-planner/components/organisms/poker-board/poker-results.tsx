import { useQuery } from "convex/react";

import type { Id } from "@workspace/games-convex-backend/convex/_generated/dataModel";
import { api } from "@workspace/games-convex-backend/convex/_generated/api";

import { useParams } from "next/navigation";
import { useUserStore } from "@/lib/store/user.store";
import { PokerResultChart } from "./poker-chart-result";
import { PokerResultTable } from "./poker-table-result";

export function PokerResults({
  storyId,
}: Readonly<{
  storyId: Id<"stories"> | null;
}>) {
  const { userToken } = useUserStore();
  const params = useParams();
  const roomCode = params?.roomCode as string;

  const result = useQuery(
    api.storyPoints.getStoryPointsStats,
    storyId && userToken
      ? { token: userToken, storyId }
      : { token: userToken, roomCode },
  );

  if (!result?.success) {
    return null;
  }

  const stats = {
    chartData: result.chartData || [],
    avgPoints: result.avgPoints || 0,
    totalVoters: result.totalVoters,
  };

  if (stats.chartData.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="p-2 border flex-1 bg-card rounded-lg">
        <PokerResultChart chartData={stats.chartData} />
        <Stats avgValue={stats.avgPoints} totalVotes={stats.totalVoters ?? 0} />
      </div>
      <div className="p-1 border flex-1 bg-card rounded-lg">
        <PokerResultTable chartData={stats.chartData} />
      </div>
    </div>
  );
}

const Stats = ({
  avgValue,
  totalVotes,
}: {
  avgValue: number;
  totalVotes: number;
}) => {
  return (
    <div className="text-primary font-semibold flex justify-center items-center w-full gap-2 text-sm">
      <div className="flex items-center gap-1 border-primary border py-1 px-2 rounded-full">
        <div>{`Average: ${avgValue}`}</div>
      </div>
      <div className="flex items-center gap-1 border-primary border py-1 px-2 rounded-full">
        <div>{`Voters: ${totalVotes}`}</div>
      </div>
    </div>
  );
};
