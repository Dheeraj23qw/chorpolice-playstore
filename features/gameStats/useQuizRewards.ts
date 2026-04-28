import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { addQuizEntry } from "@/features/gameStats/gameStatsSlice";
import { updateCoins } from "@/features/wallet/walletSlice";
import { toast } from "@/components/feedback/toast";

export function useQuizReward() {
  const dispatch: AppDispatch = useDispatch();
  const hasRecorded = useRef(false);

  const { level, correctQuestions, totalQuestions, isWinner } = useSelector(
    (state: RootState) => state.difficulty,
  );

  const rewardData = useMemo(() => {
    if (!level || totalQuestions === 0) return { totalReward: 0, accuracy: 0 };

    const accuracy = (correctQuestions / totalQuestions) * 100;

    const maxRewardTable = {
      easy: 30,
      medium: 80,
      hard: 200,
    };

    const baseReward = maxRewardTable[level];

    let totalReward: number;

    if (accuracy < 50) {
      totalReward = Math.floor(baseReward * -0.5);
    } else {
      totalReward = Math.floor((accuracy / 100) * baseReward);
    }

    return { totalReward, accuracy };
  }, [level, correctQuestions, totalQuestions]);

  useEffect(() => {
    if (!level || totalQuestions === 0 || hasRecorded.current) return;

    hasRecorded.current = true;

    const { totalReward, accuracy } = rewardData;

    if (totalReward !== 0) {
      dispatch(updateCoins(totalReward));
      
      if (totalReward > 0) {
        toast.success("Coins Earned!", `You earned ${totalReward} coins for ${Math.round(accuracy)}% accuracy.`);
      } else {
        toast.warning("Low Accuracy", `Deducted ${Math.abs(totalReward)} coins. Practice more to earn rewards!`);
      }
    }

    dispatch(
      addQuizEntry({
        result: isWinner ? "win" : "fail",
        accuracy,
        difficulty: level,
      }),
    );
  }, [rewardData, level, totalQuestions, isWinner, dispatch]);

  return { reward: rewardData.totalReward };
}
