import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { AppDispatch } from "@/redux/store";
import { resetDifficulty } from "@/redux/reducers/quiz";
import {
  clearSession,
  resetGameState,
} from "@/redux/reducers/sessionSlice";
import { stopSession } from "@/service/lanGameService";
import { leaveLanLobby } from "@/service/lanLobbyCoordinator";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { ChorPoliceBotBehavior } from "@/service/ChorPoliceBotBehavior";

interface CleanupDeps {
  timerRefs: React.MutableRefObject<ReturnType<typeof setTimeout>[]>;
  isQuittingRef: React.MutableRefObject<boolean>;
  currentQuizPlayerIdRef: React.MutableRefObject<string | null>;
  scoreQuizStartedRef: React.MutableRefObject<boolean>;
  roundStartPendingRef: React.MutableRefObject<boolean>;
}

export const useCPCleanup = ({
  timerRefs,
  isQuittingRef,
  currentQuizPlayerIdRef,
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
    currentQuizPlayerIdRef.current = null;
    scoreQuizStartedRef.current = false;
    roundStartPendingRef.current = false;

    ChorPoliceEngine.reset();
    ChorPoliceBotBehavior.reset();
    clearAllTimers();

    await leaveLanLobby();
    await stopSession();
  }, [clearAllTimers, currentQuizPlayerIdRef, scoreQuizStartedRef, roundStartPendingRef]);

  const handleFinalExit = useCallback(async (target?: string) => {
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
  }, [dispatch, isQuittingRef, performFullCleanup, router]);

  const navigateToHome = useCallback(() => {
    router.dismissAll();
    router.replace("/mode-select" as any);
    setTimeout(() => dispatch(resetGameState()), 100);
  }, [dispatch, router]);

  return {
    clearAllTimers,
    performFullCleanup,
    handleFinalExit,
    navigateToHome,
  };
};
