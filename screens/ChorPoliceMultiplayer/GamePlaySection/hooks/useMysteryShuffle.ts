import { useEffect, useState } from "react";

import { CP_FLOW_TIMINGS } from "@/constants/cpFlowTimings";

export const useMysteryShuffle = (
  gamePhase: string | undefined,
  round: number,
  investigationTargetsLength: number,
) => {
  const [mysteryShuffleStep, setMysteryShuffleStep] = useState(3);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (
      gamePhase === "investigation_shuffle" &&
      investigationTargetsLength > 0
    ) {
      const stepDuration = CP_FLOW_TIMINGS.MYSTERY_SHUFFLE_DURATION_MS / 4;

      setMysteryShuffleStep(0);

      timers.push(setTimeout(() => setMysteryShuffleStep(1), stepDuration));
      timers.push(setTimeout(() => setMysteryShuffleStep(2), stepDuration * 2));
      timers.push(setTimeout(() => setMysteryShuffleStep(3), stepDuration * 3));
    } else {
      setMysteryShuffleStep(3);
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [gamePhase, round, investigationTargetsLength]);

  return mysteryShuffleStep;
};
