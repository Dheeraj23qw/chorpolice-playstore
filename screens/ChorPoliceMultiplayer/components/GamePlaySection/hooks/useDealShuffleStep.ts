import { DEAL_SHUFFLE_PATHS, DEALING_SPIN_MS } from "../constants";
import { useTimedShuffleStep } from "./useTimedShuffleStep";

export const useDealShuffleStep = (gamePhase: string, round: number) => {
  return useTimedShuffleStep({
    isActive: gamePhase === "dealing",
    totalDurationMs: DEALING_SPIN_MS,
    stepCount: DEAL_SHUFFLE_PATHS[0]?.length ?? 1,
    resetKeys: [gamePhase, round],
  });
};
