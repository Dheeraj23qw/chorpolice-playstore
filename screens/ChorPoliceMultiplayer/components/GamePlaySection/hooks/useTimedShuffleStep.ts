import { useEffect, useState } from "react";

type UseTimedShuffleStepInput = {
  isActive: boolean;
  totalDurationMs: number;
  stepCount: number;
  resetKeys: readonly unknown[];
  settledStep?: number;
};

export const useTimedShuffleStep = ({
  isActive,
  totalDurationMs,
  stepCount,
  resetKeys,
  settledStep = stepCount - 1,
}: UseTimedShuffleStepInput) => {
  const safeSettledStep = Math.max(Math.min(settledStep, stepCount - 1), 0);
  const resetSignature = JSON.stringify(resetKeys);
  const [step, setStep] = useState(() =>
    isActive && stepCount > 1 ? 0 : safeSettledStep,
  );

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (!isActive || stepCount <= 1) {
      setStep(safeSettledStep);
      return () => {
        timers.forEach(clearTimeout);
      };
    }

    const stepDuration = totalDurationMs / stepCount;

    setStep(0);

    for (let nextStep = 1; nextStep < stepCount; nextStep += 1) {
      timers.push(
        setTimeout(() => {
          setStep(nextStep);
        }, stepDuration * nextStep),
      );
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isActive, resetSignature, safeSettledStep, stepCount, totalDurationMs]);

  return step;
};
