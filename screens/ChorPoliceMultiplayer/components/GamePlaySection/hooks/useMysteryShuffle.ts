import { useEffect, useState } from "react";

export const useMysteryShuffle = (
  gamePhase: string,
  round: number,
  investigationTargetsLength: number,
) => {
  const [mysteryShuffleStep, setMysteryShuffleStep] = useState(3);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (gamePhase === "investigation_shuffle") {
      setMysteryShuffleStep(0);
      timers.push(setTimeout(() => setMysteryShuffleStep(1), 520));
      timers.push(setTimeout(() => setMysteryShuffleStep(2), 1040));
      timers.push(setTimeout(() => setMysteryShuffleStep(3), 1560));
    } else {
      setMysteryShuffleStep(3);
    }

    return () => timers.forEach(clearTimeout);
  }, [gamePhase, round, investigationTargetsLength]);

  return mysteryShuffleStep;
};
