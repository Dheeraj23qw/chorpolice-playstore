import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { applyTransaction } from "@/features/wallet/walletSlice";
import { QuizStatsEntry } from "@/features/quizStats/quizStatsTypes";
import { addQuizEntry, saveQuizStats } from "@/features/quizStats/quizStatsSlice";

export function useQuizReward() {
  const dispatch: AppDispatch = useDispatch();
  const hasRecorded = useRef(false);

  const { level, correctQuestions, totalQuestions, isWinner } = useSelector(
    (state: RootState) => state.difficulty,
  );

  const quizStats = useSelector((state: RootState) => state.quizStats); // ✅ current state

  const rewardData = useMemo(() => {
    if (!level || totalQuestions === 0) return { totalReward: 0, baseReward: 0, bonus: 0, accuracy: 0 };

    const accuracy = correctQuestions / totalQuestions;

    const baseTable = {
      easy: { full: 500, half: 250, fail: -500 },
      medium: { full: 1500, half: 750, fail: -700 },
      hard: { full: 3000, half: 1500, fail: -1000 },
    };

    let baseReward: number;
    if (accuracy === 1) baseReward = baseTable[level].full;
    else if (accuracy >= 0.5) baseReward = baseTable[level].half;
    else baseReward = baseTable[level].fail;

    let bonus = 0;
    if (accuracy === 1) bonus = 500;
    else if (accuracy >= 0.9) bonus = 300;
    else if (accuracy >= 0.8) bonus = 150;

    return { totalReward: baseReward + bonus, baseReward, bonus, accuracy };
  }, [level, correctQuestions, totalQuestions]);

  useEffect(() => {
    if (!level || hasRecorded.current) return;
    hasRecorded.current = true;

    const { totalReward, baseReward, bonus, accuracy } = rewardData;

    if (totalReward !== 0) {
      dispatch(
        applyTransaction({
          amount: totalReward,
          reason: totalReward > 0 ? "Quiz Performance Reward" : "Quiz Penalty",
          source: "quiz_reward",
          metadata: { level, correctQuestions, totalQuestions, baseReward, bonus },
        }),
      );
    }

    const entry: QuizStatsEntry = {
      id: Date.now().toString(),
      result: isWinner ? "win" : "fail",
      accuracy,
      coinsEarned: totalReward,
      date: new Date().toISOString().slice(0, 10),
      metadata: { difficulty: level },
    };

    dispatch(addQuizEntry(entry));

    // ✅ Persist immediately after Redux update
    saveQuizStats(quizStats);
  }, [rewardData, level, isWinner, dispatch, quizStats]);

  const message = useMemo(() => {
    const { totalReward, bonus } = rewardData;

    if (totalReward > 0) return bonus > 0 ? `You earned ${totalReward} coins 🎉 (+${bonus} bonus)` : `You earned ${totalReward} coins 🎉`;
    if (totalReward < 0) return `Penalty: ${totalReward} coins ⚠️`;
    return "";
  }, [rewardData]);

  return { reward: rewardData.totalReward, message };
}
