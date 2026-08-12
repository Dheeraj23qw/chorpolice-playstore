import { useCallback, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { AppDispatch } from "@/redux/store";
import { resetDifficulty } from "@/redux/reducers/quiz";
import { clearSession, resetGameState } from "@/redux/reducers/sessionSlice";
import {
  stopSession,
  cleanupAfterMatchCompleted,
} from "@/service/lanGameService";
import { leaveLanLobby } from "@/service/lanLobbyCoordinator";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { ChorPoliceBotBehavior } from "@/service/ChorPoliceBotBehavior";

interface CleanupDeps {
  timerRefs: React.RefObject<ReturnType<typeof setTimeout>[]>;
  isQuittingRef: React.RefObject<boolean>;
  scoreQuizStartedRef: React.RefObject<boolean>;
  roundStartPendingRef: React.RefObject<boolean>;
}

export const useCPCleanup = ({
  timerRefs,
  isQuittingRef,
  scoreQuizStartedRef,
  roundStartPendingRef,
}: CleanupDeps) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const clearAllTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  }, [timerRefs]);

  const performFullCleanup = useCallback(async () => {
    scoreQuizStartedRef.current = false;
    roundStartPendingRef.current = false;

    ChorPoliceEngine.reset();
    ChorPoliceBotBehavior.reset();
    clearAllTimers();

    // Idempotent transport cleanup — safe even if already called
    await cleanupAfterMatchCompleted({ reason: "full_cleanup" });
    await leaveLanLobby();
  }, [clearAllTimers, scoreQuizStartedRef, roundStartPendingRef]);

  const handleFinalExit = useCallback(
    async (target?: string) => {
      if (isQuittingRef.current) return;
      isQuittingRef.current = true;

      await performFullCleanup();

      dispatch(resetGameState());
      dispatch(resetDifficulty());

      requestAnimationFrame(() => {
        router.dismissAll();

        switch (target) {
          case "stats":
            router.replace("/stats" as any);
            break;
          case "report-bug":
            router.replace("/report-bug" as any);
            break;
          case "earn":
            router.replace("/earn" as any);
            break;
          default:
            router.replace("/mode-select" as any);
        }

        setTimeout(() => {
          isQuittingRef.current = false;
        }, 500);
      });
    },
    [dispatch, isQuittingRef, performFullCleanup, router],
  );

  const navigateToHome = useCallback(() => {
    router.dismissAll();
    router.replace("/mode-select" as any);
    setTimeout(() => dispatch(resetGameState()), 100);
  }, [dispatch, router]);

  return useMemo(
    () => ({
      clearAllTimers,
      performFullCleanup,
      handleFinalExit,
      navigateToHome,
    }),
    [clearAllTimers, performFullCleanup, handleFinalExit, navigateToHome],
  );
};
