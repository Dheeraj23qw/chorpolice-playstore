import { useMemo } from "react";
import { playerImages } from "@/constants/playerData";

export const useLeaderboard = (
  data: any[] | undefined,
  roundProgress: Record<string, any> = {},
) => {
  return useMemo(() => {
    const getAvatarSource = (avatarId: number) => {
      const imgData = playerImages[avatarId];
      return imgData
        ? imgData.src
        : require("@/assets/images/chorsipahi/kid1.webp");
    };

    // 1. Determine if we are in the 'Finished' state
    const allFinished = !!(data && data.length > 0);

    // 2. Data transformation based on state
    const players = allFinished
      ? data!.map((d: any) => ({
          id: d.id,
          name: d.name,
          correctCount: d.correctCount ?? 0,
          totalTime: d.totalTime ?? 0,
          avatarId: d.avatarId,
          isFinished: true,
        }))
      : Object.values(roundProgress).sort(
          (a: any, b: any) => b.correctCount - a.correctCount,
        );

    // 3. Destructure the winner and the rest
    const [winner, ...others] = players;

    return {
      players,
      winner: allFinished ? winner : null,
      others: allFinished ? others : players,
      allFinished,
      getAvatarSource,
    };
  }, [data, roundProgress]); // Only recalculate if data/progress changes
};
