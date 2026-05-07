import { useEffect, useState } from "react";

import { DEALING_SPIN_MS, FADE_START_MS } from "../constants";
import { DealingStage } from "../types";

export const useDealingStage = (gamePhase: string, round: number) => {
  const [dealingStage, setDealingStage] = useState<DealingStage>("idle");

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (gamePhase === "dealing") {
      setDealingStage("spin");

      if (FADE_START_MS < DEALING_SPIN_MS) {
        timers.push(setTimeout(() => setDealingStage("fade"), FADE_START_MS));
      }
      timers.push(setTimeout(() => setDealingStage("reveal"), DEALING_SPIN_MS));
    } else {
      setDealingStage("idle");
    }

    return () => timers.forEach(clearTimeout);
  }, [gamePhase, round]);

  return dealingStage;
};
