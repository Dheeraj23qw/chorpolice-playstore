import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { applyTransaction } from "@/features/wallet/walletSlice";
import { QuizStatsEntry } from "@/features/quizStats/quizStatsTypes";
import { addQuizEntry } from "@/features/quizStats/quizStatsSlice";

export function useQuizReward() {
  const dispatch: AppDispatch = useDispatch();
  const hasRecorded = useRef(false);

  const { level, correctQuestions, totalQuestions, isWinner } = useSelector(
    (state: RootState) => state.difficulty,
  );

  const rewardData = useMemo(() => {
    if (!level || totalQuestions === 0) return { totalReward: 0, accuracy: 0 };

    const accuracy = correctQuestions / totalQuestions;

    const maxRewardTable = {
      easy: 30,
      medium: 80,
      hard: 200,
    };

    const baseReward = maxRewardTable[level];
    let totalReward: number;

    if (accuracy < 0.5) {
      // 📉 NEGATIVE MARKING: 
      // If accuracy < 50%, deduct 50% of the max potential reward as a penalty
      totalReward = Math.floor(baseReward * -0.5);
    } else {
      // ✅ POSITIVE MARKING:
      // Accuracy 50% to 100% scales the reward proportionally
      totalReward = Math.floor(accuracy * baseReward);
    }

    return { totalReward, accuracy };
  }, [level, correctQuestions, totalQuestions]);

  useEffect(() => {
    if (!level || hasRecorded.current) return;
    hasRecorded.current = true;

    const { totalReward, accuracy } = rewardData;

    // Dispatch even if reward is negative to update the user's wallet balance (deduction)
    dispatch(
      applyTransaction({
        amount: totalReward, // If totalReward is negative, this will decrease balance
        reason: totalReward >= 0 ? "Quiz Accuracy Reward" : "Quiz Penalty",
        source: "quiz_reward",
      }),
    );

    const entry: QuizStatsEntry = {
      id: Date.now().toString(),
      result: isWinner ? "win" : "fail",
      accuracy,
      coinsEarned: totalReward,
      date: new Date().toISOString().split("T")[0],
      metadata: { difficulty: level },
    };

    dispatch(addQuizEntry(entry));
  }, [rewardData, level, isWinner, dispatch]);

  return { reward: rewardData.totalReward };
}