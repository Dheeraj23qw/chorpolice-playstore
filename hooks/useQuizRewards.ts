import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { applyTransaction } from "@/features/wallet/walletSlice";

export function useQuizReward() {
  const dispatch = useDispatch();

  const { level, correctQuestions, totalQuestions } = useSelector(
    (state: RootState) => state.difficulty
  );

  const rewardData = useMemo(() => {
    if (!level || totalQuestions === 0) {
      return { totalReward: 0, baseReward: 0, bonus: 0 };
    }

    const accuracy = correctQuestions / totalQuestions;

    /* ------------------ BASE TABLE ------------------ */
    const baseTable = {
      easy: { full: 500, half: 250, fail: -500 },
      medium: { full: 1500, half: 750, fail: -700 },
      hard: { full: 3000, half: 1500, fail: -1000 },
    };

    let baseReward = 0;

    if (accuracy === 1) baseReward = baseTable[level].full;
    else if (accuracy >= 0.5) baseReward = baseTable[level].half;
    else baseReward = baseTable[level].fail;

    /* ------------------ ACCURACY BONUS ------------------ */
    let bonus = 0;
    if (accuracy === 1) bonus = 500;
    else if (accuracy >= 0.9) bonus = 300;
    else if (accuracy >= 0.8) bonus = 150;

    const totalReward = baseReward + bonus;

    return { totalReward, baseReward, bonus };
  }, [level, correctQuestions, totalQuestions]);

  /* ------------------ APPLY TRANSACTION (ONCE) ------------------ */
  useEffect(() => {
    if (!level || rewardData.totalReward === 0) return;

    dispatch(
      applyTransaction({
        amount: rewardData.totalReward,
        reason:
          rewardData.totalReward > 0
            ? "Quiz Performance Reward"
            : "Quiz Penalty",
        source: "quiz_reward",
        metadata: {
          level,
          correctQuestions,
          totalQuestions,
          baseReward: rewardData.baseReward,
          bonus: rewardData.bonus,
        },
      })
    );
  }, [rewardData, level, correctQuestions, totalQuestions, dispatch]);

  const message = useMemo(() => {
    const { totalReward, bonus } = rewardData;

    if (totalReward > 0) {
      if (bonus > 0) return `You earned ${totalReward} coins 🎉 (+${bonus} bonus)`;
      return `You earned ${totalReward} coins 🎉`;
    }

    if (totalReward < 0) return `Penalty: ${totalReward} coins ⚠️`;

    return "";
  }, [rewardData]);

  return {
    reward: rewardData.totalReward,
    message,
  };
}
