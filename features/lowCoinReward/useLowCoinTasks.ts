import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAppDispatch } from "@/hooks/useAppRedux";
import { updateCoins } from "@/features/wallet/walletSlice";
import { handleShare } from "@/utils/share";
import { handleAppReview } from "@/utils/reviewHelper";
import { toast } from "@/components/feedback/toast";

const REWARD_AMOUNT = 10000;

export const useLowCoinTasks = (onComplete: () => void, referralCode: string) => {
  const dispatch = useAppDispatch();
  const [activeTask, setActiveTask] = useState<"SHARE" | null>(null);
  const appState = useRef(AppState.currentState);

  const award = useCallback(() => {
    dispatch(updateCoins(REWARD_AMOUNT));
    toast.success(
      "Task Completed! 🎉",
      `You've earned ${REWARD_AMOUNT} coins for sharing your code!`
    );
    onComplete();
  }, [dispatch, onComplete]);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      // If the user returns to the app while a task is active
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active" &&
        activeTask !== null
      ) {
        console.log("[LowCoinTasks] User returned from task:", activeTask);
        
        // Award after a small delay to ensure UI is ready
        setTimeout(() => {
          award();
          setActiveTask(null);
        }, 800);
      }
      appState.current = nextAppState;
    },
    [activeTask, award]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [handleAppStateChange]);

  const startShareTask = async () => {
    setActiveTask("SHARE");
    await handleShare(referralCode);
  };

  return {
    startShareTask,
  };
};
