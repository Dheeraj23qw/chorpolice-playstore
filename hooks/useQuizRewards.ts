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

    // Define maximum rewards per difficulty
    const maxRewardTable = {
      easy: 30,
      medium: 80,
      hard: 200,
    };

    // Calculate reward: accuracy (0.0 to 1.0) * max reward
    // Math.floor ensures you get a whole number of coins
    const totalReward = Math.floor(accuracy * maxRewardTable[level]);

    return { totalReward, accuracy };
  }, [level, correctQuestions, totalQuestions]);

  useEffect(() => {
    if (!level || hasRecorded.current) return;

    hasRecorded.current = true;

    const { totalReward, accuracy } = rewardData;

    // Only dispatch if reward is greater than 0
    if (totalReward > 0) {
      dispatch(
        applyTransaction({
          amount: totalReward,
          reason: "Quiz Accuracy Reward",
          source: "quiz_reward",
        }),
      );
    }

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
